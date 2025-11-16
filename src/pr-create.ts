import * as SDK from 'azure-devops-extension-sdk';
import { LinearService } from './services/linearService';
import { LinearIssue, LinearConfig } from './types';

/**
 * PR Create page handler for Linear integration
 * Shows dropdown to select Linear issues for PR description
 */
class PRCreateHandler {
  private linearService: LinearService | null = null;
  private allIssues: LinearIssue[] = [];
  private filteredIssues: LinearIssue[] = [];
  private selectedIssues: Set<string> = new Set();

  /**
   * Initialize the extension
   */
  public async initialize(): Promise<void> {
    try {
      console.log('===== LINEAR PR CREATE HANDLER STARTING =====');
      await SDK.init();
      console.log('SDK initialized');
      await SDK.ready();
      console.log('SDK ready');

      const config = SDK.getConfiguration();
      console.log('Configuration:', config);

      console.log('PR Create handler initialized');

      // Load Linear configuration
      await this.loadConfiguration();

      // Load Linear issues for dropdown
      await this.loadIssues();

      // Setup UI event listeners
      this.setupEventListeners();
      
      SDK.notifyLoadSucceeded();
      console.log('===== LINEAR PR CREATE HANDLER LOADED SUCCESSFULLY =====');
    } catch (error) {
      console.error('===== LINEAR PR CREATE HANDLER FAILED =====', error);
      this.showError('Failed to initialize Linear integration: ' + (error as Error).message);
      SDK.notifyLoadSucceeded();
    }
  }

  /**
   * Load Linear configuration from project settings
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const accessToken = SDK.getAccessToken();
      const config = SDK.getConfiguration();
      
      console.log('Loading configuration...', { hasToken: !!accessToken });

      // Get project settings
      const projectId = config.project?.id;
      if (!projectId) {
        throw new Error('Project ID not available');
      }

      const dataService: any = await SDK.getService('ms.vss-features.extension-data-service');
      const dataManager = await dataService.getExtensionDataManager(SDK.getExtensionContext().id, accessToken);
      
      const settings = await dataManager.getValue('linear-config', { scopeType: 'Project', scopeValue: projectId }) as LinearConfig;
      
      if (!settings || !settings.apiKey) {
        throw new Error('Linear API key not configured. Please configure it in Project Settings > Linear Integration.');
      }

      this.linearService = new LinearService();
      this.linearService.initialize(settings);
      console.log('Linear service initialized');
    } catch (error) {
      console.error('Failed to load configuration:', error);
      throw error;
    }
  }

  /**
   * Load all Linear issues
   */
  private async loadIssues(): Promise<void> {
    if (!this.linearService) {
      this.showError('Linear service not initialized');
      return;
    }

    try {
      console.log('Loading Linear issues...');
      this.allIssues = await this.linearService.searchIssues('');
      this.filteredIssues = [...this.allIssues];
      console.log(`Loaded ${this.allIssues.length} Linear issues`);
      
      this.renderIssueList();
    } catch (error) {
      console.error('Failed to load Linear issues:', error);
      this.showError('Failed to load Linear issues. Please check your API key configuration.');
    }
  }

  /**
   * Render the issue list
   */
  private renderIssueList(): void {
    const listElement = document.getElementById('dropdown-list');
    if (!listElement) return;

    if (this.filteredIssues.length === 0) {
      listElement.innerHTML = '<div class="loading">No issues found</div>';
      return;
    }

    listElement.innerHTML = '';
    this.filteredIssues.forEach(issue => {
      const item = document.createElement('div');
      item.className = 'issue-item';
      item.dataset.issueId = issue.id;
      
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'issue-checkbox';
      checkbox.checked = this.selectedIssues.has(issue.id);
      checkbox.addEventListener('change', () => this.toggleIssueSelection(issue.id));
      
      const identifier = document.createElement('span');
      identifier.className = 'issue-identifier';
      identifier.textContent = issue.identifier;
      
      const title = document.createElement('span');
      title.className = 'issue-title';
      title.textContent = issue.title;
      
      item.appendChild(checkbox);
      item.appendChild(identifier);
      item.appendChild(title);
      
      item.addEventListener('click', (e) => {
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
          this.toggleIssueSelection(issue.id);
        }
      });
      
      listElement.appendChild(item);
    });
  }

  /**
   * Toggle issue selection
   */
  private toggleIssueSelection(issueId: string): void {
    if (this.selectedIssues.has(issueId)) {
      this.selectedIssues.delete(issueId);
    } else {
      this.selectedIssues.add(issueId);
    }
    this.updateSelectedIssuesDisplay();
    this.updateCopyButton();
  }

  /**
   * Update selected issues display
   */
  private updateSelectedIssuesDisplay(): void {
    const container = document.getElementById('selected-issues');
    if (!container) return;

    const selectedIssuesData = this.allIssues.filter(issue => this.selectedIssues.has(issue.id));
    
    container.innerHTML = `<div class="selected-issues-title">Selected Issues (${selectedIssuesData.length})</div>`;
    
    selectedIssuesData.forEach(issue => {
      const tag = document.createElement('span');
      tag.className = 'selected-issue-tag';
      tag.textContent = issue.identifier;
      container.appendChild(tag);
    });
  }

  /**
   * Update copy button state
   */
  private updateCopyButton(): void {
    const button = document.getElementById('copy-button') as HTMLButtonElement;
    if (button) {
      button.disabled = this.selectedIssues.size === 0;
    }
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    // Search box
    const searchBox = document.getElementById('search-box') as HTMLInputElement;
    if (searchBox) {
      searchBox.addEventListener('input', () => {
        const query = searchBox.value.toLowerCase();
        this.filteredIssues = this.allIssues.filter(issue =>
          issue.identifier.toLowerCase().includes(query) ||
          issue.title.toLowerCase().includes(query)
        );
        this.renderIssueList();
      });
    }

    // Copy button
    const copyButton = document.getElementById('copy-button');
    if (copyButton) {
      copyButton.addEventListener('click', () => this.copyReferences());
    }
  }

  /**
   * Copy references to clipboard
   */
  private async copyReferences(): Promise<void> {
    const selectedIssuesData = this.allIssues.filter(issue => this.selectedIssues.has(issue.id));
    
    if (selectedIssuesData.length === 0) return;

    const references = selectedIssuesData.map(issue => 
      `[${issue.identifier}](${issue.url}) - ${issue.title}`
    ).join('\n');

    try {
      await navigator.clipboard.writeText(references);
      
      const button = document.getElementById('copy-button') as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓ Copied to Clipboard!';
        button.style.backgroundColor = '#107c10';
        setTimeout(() => {
          button.textContent = originalText;
          button.style.backgroundColor = '';
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      this.showError('Failed to copy to clipboard');
    }
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    const listElement = document.getElementById('dropdown-list');
    if (listElement) {
      listElement.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`;
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

// Initialize when the DOM is ready
const handler = new PRCreateHandler();
handler.initialize();
