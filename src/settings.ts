import * as SDK from 'azure-devops-extension-sdk';
import { LinearConfig } from './types';

/**
 * Settings page for Linear integration configuration
 */
class SettingsPage {
  private config: LinearConfig = {
    apiKey: '',
    organizationId: '',
    requireWorkItemInCommits: true,
    requireWorkItemInPR: true
  };

  /**
   * Initialize the settings page
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();

      // Load existing configuration
      await this.loadConfiguration();

      // Setup UI event handlers
      this.setupEventHandlers();

      // Populate form
      this.populateForm();

    } catch (error) {
      console.error('Failed to initialize settings:', error);
      this.showError('Failed to load settings');
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const dataService = await SDK.getService<IExtensionDataService>('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      const savedConfig = await dataManager.getValue('linear-config') as LinearConfig;
      
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfiguration(): Promise<void> {
    try {
      const dataService = await SDK.getService<IExtensionDataService>('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      await dataManager.setValue('linear-config', this.config);
      
      this.showSuccess('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save configuration:', error);
      this.showError('Failed to save settings');
    }
  }

  /**
   * Setup event handlers for form elements
   */
  private setupEventHandlers(): void {
    const saveButton = document.getElementById('save-settings');
    const testButton = document.getElementById('test-connection');

    if (saveButton) {
      saveButton.addEventListener('click', () => this.handleSave());
    }

    if (testButton) {
      testButton.addEventListener('click', () => this.handleTestConnection());
    }

    // Input change handlers
    const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
    const orgIdInput = document.getElementById('org-id') as HTMLInputElement;
    const requireCommitCheckbox = document.getElementById('require-commit') as HTMLInputElement;
    const requirePRCheckbox = document.getElementById('require-pr') as HTMLInputElement;

    if (apiKeyInput) {
      apiKeyInput.addEventListener('input', (e) => {
        this.config.apiKey = (e.target as HTMLInputElement).value;
      });
    }

    if (orgIdInput) {
      orgIdInput.addEventListener('input', (e) => {
        this.config.organizationId = (e.target as HTMLInputElement).value;
      });
    }

    if (requireCommitCheckbox) {
      requireCommitCheckbox.addEventListener('change', (e) => {
        this.config.requireWorkItemInCommits = (e.target as HTMLInputElement).checked;
      });
    }

    if (requirePRCheckbox) {
      requirePRCheckbox.addEventListener('change', (e) => {
        this.config.requireWorkItemInPR = (e.target as HTMLInputElement).checked;
      });
    }
  }

  /**
   * Populate form with current configuration
   */
  private populateForm(): void {
    const apiKeyInput = document.getElementById('api-key') as HTMLInputElement;
    const orgIdInput = document.getElementById('org-id') as HTMLInputElement;
    const requireCommitCheckbox = document.getElementById('require-commit') as HTMLInputElement;
    const requirePRCheckbox = document.getElementById('require-pr') as HTMLInputElement;

    if (apiKeyInput) apiKeyInput.value = this.config.apiKey || '';
    if (orgIdInput) orgIdInput.value = this.config.organizationId || '';
    if (requireCommitCheckbox) requireCommitCheckbox.checked = this.config.requireWorkItemInCommits;
    if (requirePRCheckbox) requirePRCheckbox.checked = this.config.requireWorkItemInPR;
  }

  /**
   * Handle save button click
   */
  private async handleSave(): Promise<void> {
    if (!this.validateForm()) {
      return;
    }

    await this.saveConfiguration();
  }

  /**
   * Handle test connection button click
   */
  private async handleTestConnection(): Promise<void> {
    if (!this.config.apiKey) {
      this.showError('Please enter a Linear API key');
      return;
    }

    this.showInfo('Testing connection...');

    try {
      const { linearService } = await import('./services/linearService');
      linearService.initialize(this.config);

      // Try to fetch a simple query
      const issues = await linearService.searchIssues('');
      
      this.showSuccess(`Connection successful! Found ${issues.length} issues.`);
    } catch (error) {
      console.error('Connection test failed:', error);
      this.showError('Connection failed. Please check your API key.');
    }
  }

  /**
   * Validate form inputs
   */
  private validateForm(): boolean {
    if (!this.config.apiKey || this.config.apiKey.trim() === '') {
      this.showError('Linear API key is required');
      return false;
    }

    return true;
  }

  /**
   * Show success message
   */
  private showSuccess(message: string): void {
    this.showMessage(message, 'success');
  }

  /**
   * Show error message
   */
  private showError(message: string): void {
    this.showMessage(message, 'error');
  }

  /**
   * Show info message
   */
  private showInfo(message: string): void {
    this.showMessage(message, 'info');
  }

  /**
   * Show message to user
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info'): void {
    const messageElement = document.getElementById('message-area');
    if (messageElement) {
      messageElement.className = `message ${type}`;
      messageElement.textContent = message;
      messageElement.style.display = 'block';

      // Auto-hide after 5 seconds for success messages
      if (type === 'success') {
        setTimeout(() => {
          messageElement.style.display = 'none';
        }, 5000);
      }
    }
  }
}

// Initialize when DOM is ready
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    const settingsPage = new SettingsPage();
    settingsPage.initialize().catch(error => {
      console.error('Failed to initialize settings page:', error);
    });
  });
}

export { SettingsPage };

// Type extension
interface IExtensionDataService {
  getExtensionDataManager(extensionId: string, accessToken: string): Promise<any>;
}
