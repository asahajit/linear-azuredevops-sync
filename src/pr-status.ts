import * as SDK from 'azure-devops-extension-sdk';
import { GitRestClient } from 'azure-devops-extension-api/Git';
import { linearService } from './services/linearService';
import { LinearConfig } from './types';

/**
 * Pull Request Status Provider
 * Validates Linear work item references in PR titles and descriptions
 */
class PRStatusProvider {
  private gitClient: GitRestClient | null = null;
  private allIssues: any[] = [];
  private filteredIssues: any[] = [];
  private selectedIssues: Set<string> = new Set();
  private currentPR: any = null;

  /**
   * Initialize the extension
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();

      // Check if we're in a valid PR context
      const config = SDK.getConfiguration();
      if (!config || !config.pullRequestId) {
        console.log('Not in a PR context, skipping initialization');
        this.showContextMessage('This extension works within Pull Requests. Open a PR to see Linear issue linking.');
        SDK.notifyLoadSucceeded();
        return;
      }

      // Get the Git REST client
      const apiClient = await SDK.getService<GitRestClient>('ms.vss-code-web.git-client');
      this.gitClient = apiClient;

      // Load Linear configuration
      await this.loadConfiguration();

      // Load Linear issues for dropdown
      await this.loadIssues();

      // Setup UI event listeners
      this.setupEventListeners();

      // Validate the current PR
      await this.validatePullRequest();
      
      SDK.notifyLoadSucceeded();
    } catch (error) {
      console.error('Failed to initialize PR status provider:', error);
      this.reportError('Failed to initialize Linear integration');
      SDK.notifyLoadSucceeded();
    }
  }

  /**
   * Load Linear configuration from extension data storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const dataService = await SDK.getService<IExtensionDataService>('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      const config = await dataManager.getValue('linear-config') as LinearConfig;
      
      if (config && config.apiKey) {
        linearService.initialize(config);
      } else {
        console.warn('Linear API key not configured');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  /**
   * Load all Linear issues
   */
  private async loadIssues(): Promise<void> {
    try {
      const issues = await linearService.searchIssues('');
      this.allIssues = issues;
      this.filteredIssues = [...this.allIssues];
      console.log(`Loaded ${this.allIssues.length} Linear issues`);
    } catch (error) {
      console.error('Failed to load Linear issues:', error);
      this.showError('Unable to load Linear issues. Please check your API configuration in project settings.');
    }
  }

  /**
   * Setup event listeners for UI
   */
  private setupEventListeners(): void {
    const searchInput = document.getElementById('issue-search') as HTMLInputElement;
    const dropdownList = document.getElementById('dropdown-list');
    const addButton = document.getElementById('add-to-pr');

    if (searchInput && dropdownList) {
      searchInput.addEventListener('focus', () => {
        dropdownList.classList.add('show');
        this.renderDropdown();
      });

      searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        this.filterIssues(query);
        this.renderDropdown();
      });

      // Close dropdown when clicking outside
      document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target as Node) && !dropdownList.contains(e.target as Node)) {
          dropdownList.classList.remove('show');
        }
      });
    }

    if (addButton) {
      addButton.addEventListener('click', () => this.addIssuesToPR());
    }
  }

  /**
   * Filter issues based on search query
   */
  private filterIssues(query: string): void {
    if (!query) {
      this.filteredIssues = [...this.allIssues];
    } else {
      this.filteredIssues = this.allIssues.filter(issue => 
        issue.identifier.toLowerCase().includes(query) ||
        issue.title.toLowerCase().includes(query) ||
        (issue.state?.name || '').toLowerCase().includes(query)
      );
    }
  }

  /**
   * Render dropdown list
   */
  private renderDropdown(): void {
    const dropdownList = document.getElementById('dropdown-list');
    if (!dropdownList) return;

    if (this.filteredIssues.length === 0) {
      dropdownList.innerHTML = '<div style="padding: 8px; color: #605e5c;">No issues found</div>';
      return;
    }

    dropdownList.innerHTML = this.filteredIssues.slice(0, 10).map(issue => `
      <div class="dropdown-item" data-issue-id="${issue.identifier}">
        <div class="issue-identifier">${issue.identifier}</div>
        <div class="issue-title">${this.escapeHtml(issue.title)}</div>
      </div>
    `).join('');

    // Add click handlers
    dropdownList.querySelectorAll('.dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const issueId = item.getAttribute('data-issue-id');
        if (issueId) {
          this.selectIssue(issueId);
        }
      });
    });
  }

  /**
   * Select an issue
   */
  private selectIssue(issueId: string): void {
    this.selectedIssues.add(issueId);
    this.renderSelectedIssues();
    
    // Clear search and hide dropdown
    const searchInput = document.getElementById('issue-search') as HTMLInputElement;
    const dropdownList = document.getElementById('dropdown-list');
    if (searchInput) searchInput.value = '';
    if (dropdownList) dropdownList.classList.remove('show');
  }

  /**
   * Render selected issues
   */
  private renderSelectedIssues(): void {
    const container = document.getElementById('selected-issues');
    if (!container) return;

    container.innerHTML = Array.from(this.selectedIssues).map(issueId => `
      <div class="selected-issue">
        ${issueId}
        <span class="remove" data-issue-id="${issueId}">×</span>
      </div>
    `).join('');

    // Add remove handlers
    container.querySelectorAll('.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const issueId = btn.getAttribute('data-issue-id');
        if (issueId) {
          this.selectedIssues.delete(issueId);
          this.renderSelectedIssues();
        }
      });
    });
  }

  /**
   * Add selected issues to PR description
   */
  private async addIssuesToPR(): Promise<void> {
    if (this.selectedIssues.size === 0 || !this.gitClient || !this.currentPR) {
      alert('Please select at least one issue');
      return;
    }

    try {
      const issueLinks = Array.from(this.selectedIssues).map(id => `Linear: ${id}`).join(', ');
      const newDescription = this.currentPR.description 
        ? `${this.currentPR.description}\n\n${issueLinks}`
        : issueLinks;

      // Update PR with proper object spread
      const context = SDK.getConfiguration();
      const updatedPR = {
        ...this.currentPR,
        description: newDescription
      };
      
      await this.gitClient.updatePullRequest(
        updatedPR,
        context.repositoryId,
        this.currentPR.pullRequestId,
        context.projectId
      );

      this.selectedIssues.clear();
      this.renderSelectedIssues();
      
      // Revalidate
      await this.validatePullRequest();
      
      alert('Issues added to PR description successfully!');
    } catch (error) {
      console.error('Failed to update PR:', error);
      alert('Failed to add issues to PR. Please try again.');
    }
  }

  /**
   * Validate the current pull request
   */
  private async validatePullRequest(): Promise<void> {
    if (!this.gitClient) {
      this.reportError('Git client not initialized');
      return;
    }

    try {
      // Get current PR context
      const context = SDK.getConfiguration();
      const projectId = context.projectId;
      const repositoryId = context.repositoryId;
      const pullRequestId = context.pullRequestId;

      if (!projectId || !repositoryId || !pullRequestId) {
        console.error('Missing PR context information');
        return;
      }

      // Get PR details
      this.currentPR = await this.gitClient.getPullRequest(repositoryId, pullRequestId, projectId);
      
      // Extract text to validate (title + description)
      const textToValidate = `${this.currentPR.title || ''}\n${this.currentPR.description || ''}`;

      // Extract and validate Linear work items
      const references = linearService.extractWorkItemReferences(textToValidate);
      
      if (references.length === 0) {
        this.reportWarning('No Linear work items referenced in PR');
        return;
      }

      const validationResult = await linearService.validateWorkItems(references);

      if (validationResult.isValid) {
        this.reportSuccess(validationResult.message, validationResult.workItems);
      } else {
        this.reportFailure(validationResult.message, validationResult.errors);
      }

    } catch (error) {
      console.error('Failed to validate PR:', error);
      this.reportError('Failed to validate Linear work items');
    }
  }

  /**
   * Report success status
   */
  private reportSuccess(message: string, workItems: any[]): void {
    const details = workItems.map(wi => `✓ ${wi.issueId}`).join(', ');
    console.log(`✓ ${message}: ${details}`);
    
    const container = document.getElementById('pr-status-container');
    if (container) {
      container.className = 'status success';
      container.innerHTML = `<strong>✓ ${message}</strong><br>${details}`;
    }
  }

  /**
   * Report warning
   */
  private reportWarning(message: string): void {
    console.warn(`⚠ ${message}`);
    
    const container = document.getElementById('pr-status-container');
    if (container) {
      container.className = 'status warning';
      container.innerHTML = `<strong>⚠ ${message}</strong><br>Use the dropdown above to add Linear issues to this PR.`;
    }
  }

  /**
   * Report failure status
   */
  private reportFailure(message: string, errors: string[]): void {
    const details = errors.join('<br>');
    console.error(`✗ ${message}`);
    
    const container = document.getElementById('pr-status-container');
    if (container) {
      container.className = 'status error';
      container.innerHTML = `<strong>✗ ${message}</strong><br>${details}`;
    }
  }

  /**
   * Report error
   */
  private reportError(message: string): void {
    console.error(`✗ ${message}`);
    
    const container = document.getElementById('pr-status-container');
    if (container) {
      container.className = 'status error';
      container.innerHTML = `<strong>✗ ${message}</strong><br>Check extension configuration in project settings.`;
    }
  }

  /**
   * Show context message
   */
  private showContextMessage(message: string): void {
    const container = document.getElementById('pr-status-container');
    if (container) {
      container.className = 'status warning';
      container.innerHTML = `<strong>ℹ️ ${message}</strong>`;
    }
    
    // Hide the picker section
    const section = document.querySelector('.section') as HTMLElement;
    if (section) {
      section.style.display = 'none';
    }
  }

  /**
   * Show error message in dropdown area
   */
  private showError(message: string): void {
    const section = document.querySelector('.section') as HTMLElement;
    if (section) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'status error';
      errorDiv.style.marginTop = '12px';
      errorDiv.innerHTML = `<strong>⚠️ ${this.escapeHtml(message)}</strong>`;
      section.appendChild(errorDiv);
    }
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when the DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const provider = new PRStatusProvider();
    provider.initialize().catch(error => {
      console.error('Failed to initialize:', error);
    });
  });
}

// For module exports
export { PRStatusProvider };

// Extend the IExtensionDataService interface
interface IExtensionDataService {
  getExtensionDataManager(extensionId: string, accessToken: string): Promise<any>;
}
