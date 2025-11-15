import * as SDK from 'azure-devops-extension-sdk';
import { GitRestClient } from 'azure-devops-extension-api/Git';
import { linearService } from './services/linearService';
import { LinearConfig } from './types';

/**
 * Check-in Policy Validator
 * Enforces Linear work item references in commits
 */
class CheckinPolicyValidator {
  private gitClient: GitRestClient | null = null;
  private config: LinearConfig | null = null;
  private allIssues: any[] = [];
  private filteredIssues: any[] = [];
  private selectedIssues: Set<string> = new Set();

  /**
   * Initialize the policy validator
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();

      // Check if we're in a valid Git context
      const config = SDK.getConfiguration();
      console.log('Check-in policy context:', config);

      // Get the Git REST client
      const apiClient = await SDK.getService<GitRestClient>('ms.vss-code-web.git-client');
      this.gitClient = apiClient;

      // Load configuration
      await this.loadConfiguration();

      // Load Linear issues for dropdown
      await this.loadIssues();

      // Setup UI event listeners
      this.setupEventListeners();

      // Start validation
      await this.validateCommits();
      
      SDK.notifyLoadSucceeded();
    } catch (error) {
      console.error('Failed to initialize check-in policy:', error);
      SDK.notifyLoadSucceeded();
    }
  }

  /**
   * Load Linear configuration
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const dataService = await SDK.getService<IExtensionDataService>('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      this.config = await dataManager.getValue('linear-config') as LinearConfig;
      
      if (this.config && this.config.apiKey) {
        linearService.initialize(this.config);
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
    const copyButton = document.getElementById('copy-reference');

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

    if (copyButton) {
      copyButton.addEventListener('click', () => this.copyReference());
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
   * Copy reference to clipboard
   */
  private async copyReference(): Promise<void> {
    if (this.selectedIssues.size === 0) {
      alert('Please select at least one issue');
      return;
    }

    const references = Array.from(this.selectedIssues).map(id => `[${id}]`).join(' ');
    
    try {
      await navigator.clipboard.writeText(references);
      alert(`Copied to clipboard: ${references}\n\nAdd this to your commit message!`);
    } catch (error) {
      console.error('Failed to copy:', error);
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = references;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert(`Copied to clipboard: ${references}\n\nAdd this to your commit message!`);
    }
  }

  /**
   * Validate commits in the current context
   */
  private async validateCommits(): Promise<void> {
    if (!this.gitClient || !this.config) {
      console.error('Not properly initialized');
      return;
    }

    // Skip if policy is not enabled
    if (!this.config.requireWorkItemInCommits) {
      console.log('Check-in policy not enforced');
      this.setStatus('passed', 'Check-in policy is not enforced. Use the dropdown above to link Linear issues.');
      return;
    }

    try {
      const context = SDK.getConfiguration();
      const commits = context.commits || [];

      if (commits.length === 0) {
        console.log('No commits to validate');
        return;
      }

      const results = await this.validateCommitMessages(commits);
      
      // Display results
      this.displayValidationResults(results);

    } catch (error) {
      console.error('Failed to validate commits:', error);
    }
  }

  /**
   * Validate multiple commit messages
   */
  private async validateCommitMessages(commits: any[]): Promise<Array<{ commit: any; result: any }>> {
    const results = [];

    for (const commit of commits) {
      const commitMessage = commit.comment || commit.message || '';
      const result = await linearService.validateCommitMessage(commitMessage);
      
      results.push({
        commit,
        result
      });
    }

    return results;
  }

  /**
   * Display validation results
   */
  private displayValidationResults(results: Array<{ commit: any; result: any }>): void {
    const allValid = results.every(r => r.result.isValid);

    if (allValid) {
      console.log('✓ All commits have valid Linear work item references');
      this.setStatus('passed', 'All commits validated successfully');
    } else {
      const failedCommits = results.filter(r => !r.result.isValid);
      const errors = failedCommits.map(fc => {
        const commitId = fc.commit.commitId?.substring(0, 7) || 'unknown';
        return `Commit ${commitId}: ${fc.result.message}`;
      });

      console.error('✗ Check-in policy failed:');
      errors.forEach(err => console.error(`  - ${err}`));
      
      this.setStatus('failed', 'Some commits are missing Linear work item references', errors);
    }
  }

  /**
   * Set policy status
   */
  private setStatus(state: string, message: string, errors?: string[]): void {
    const statusElement = document.getElementById('policy-status');
    if (statusElement) {
      statusElement.innerHTML = `
        <div class="policy-result ${state}">
          <h3>${state === 'passed' ? '✓' : '✗'} ${message}</h3>
          ${errors ? `<ul>${errors.map(e => `<li>${e}</li>`).join('')}</ul>` : ''}
        </div>
      `;
    }

    console.log(`Policy status: ${state} - ${message}`);
  }

  /**
   * Escape HTML
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Show error message in dropdown area
   */
  private showError(message: string): void {
    const section = document.querySelector('.section') as HTMLElement;
    if (section) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'policy-result failed';
      errorDiv.style.marginTop = '12px';
      errorDiv.innerHTML = `<strong>⚠️ ${this.escapeHtml(message)}</strong>`;
      section.appendChild(errorDiv);
    }
  }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const validator = new CheckinPolicyValidator();
    validator.initialize().catch(error => {
      console.error('Failed to initialize:', error);
    });
  });
}

export { CheckinPolicyValidator };

// Type extension
interface IExtensionDataService {
  getExtensionDataManager(extensionId: string, accessToken: string): Promise<any>;
}
