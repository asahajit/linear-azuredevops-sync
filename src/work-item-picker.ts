import * as SDK from 'azure-devops-extension-sdk';
import { linearService } from './services/linearService';
import { LinearConfig, LinearWorkItemReference } from './types';

/**
 * Work Item Picker for Linear Issues
 * Provides autocomplete functionality for selecting Linear issues
 */
class WorkItemPicker {
  private allIssues: any[] = [];
  private filteredIssues: any[] = [];
  private selectedIssue: any = null;

  /**
   * Initialize the picker
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();
      SDK.notifyLoadSucceeded();

      // Load Linear configuration
      await this.loadConfiguration();

      // Load all issues
      await this.loadIssues();

      // Setup event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('Failed to initialize work item picker:', error);
      this.showError('Failed to load Linear issues. Please check your configuration.');
    }
  }

  /**
   * Load Linear configuration
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const dataService: any = await SDK.getService('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      const config = await dataManager.getValue('linear-config') as LinearConfig;
      
      if (config && config.apiKey) {
        linearService.initialize(config);
      } else {
        throw new Error('Linear API key not configured');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Load all Linear issues for the user
   */
  private async loadIssues(): Promise<void> {
    try {
      // Load all issues (search with empty query returns recent issues)
      const issues = await linearService.searchIssues('');
      
      this.allIssues = issues;
      this.filteredIssues = [...this.allIssues];
      this.renderIssues();
    } catch (error) {
      console.error('Failed to load issues:', error);
      throw error;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = (e.target as HTMLInputElement).value.toLowerCase();
        this.filterIssues(query);
      });
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
        issue.state.name.toLowerCase().includes(query) ||
        issue.team.name.toLowerCase().includes(query)
      );
    }
    
    this.renderIssues();
  }

  /**
   * Render issues list
   */
  private renderIssues(): void {
    const container = document.getElementById('issues-container');
    if (!container) return;

    if (this.filteredIssues.length === 0) {
      container.innerHTML = '<div class="no-results">No issues found</div>';
      return;
    }

    container.innerHTML = this.filteredIssues.map(issue => `
      <div class="issue-item" data-issue-id="${issue.identifier}">
        <div class="issue-identifier">${issue.identifier}</div>
        <div class="issue-title">${this.escapeHtml(issue.title)}</div>
        <div class="issue-meta">
          ${issue.team.name} • ${issue.state.name}
        </div>
      </div>
    `).join('');

    // Add click handlers
    const items = container.querySelectorAll('.issue-item');
    items.forEach(item => {
      item.addEventListener('click', () => {
        this.selectIssue(item.getAttribute('data-issue-id') || '');
      });
    });
  }

  /**
   * Select an issue
   */
  private selectIssue(issueId: string): void {
    const issue = this.allIssues.find(i => i.identifier === issueId);
    if (!issue) return;

    this.selectedIssue = issue;

    // Highlight selected item
    const items = document.querySelectorAll('.issue-item');
    items.forEach(item => {
      if (item.getAttribute('data-issue-id') === issueId) {
        item.classList.add('selected');
      } else {
        item.classList.remove('selected');
      }
    });

    // Notify parent that an issue was selected
    SDK.resize(undefined, 500);
    
    // Return the selected issue to the calling context
    const configuration = SDK.getConfiguration();
    if (configuration.dialog) {
      configuration.dialog.close({
        identifier: issue.identifier,
        title: issue.title,
        url: issue.url,
        state: issue.state.name,
        team: issue.team.name
      });
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const container = document.getElementById('issues-container');
    if (container) {
      container.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const picker = new WorkItemPicker();
  await picker.initialize();
});

export { WorkItemPicker };
