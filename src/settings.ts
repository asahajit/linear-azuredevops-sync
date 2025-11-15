// Log immediately when this module loads
console.log('[LINEAR] settings.ts module loaded');

import * as SDK from 'azure-devops-extension-sdk';
import { LinearConfig } from './types';

console.log('[LINEAR] SDK imported:', typeof SDK);

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
      console.log('[LINEAR] Initializing SDK...');
      
      // Initialize SDK with loaded: false to prevent automatic notifyLoadSucceeded
      await SDK.init({ loaded: false });
      console.log('[LINEAR] SDK initialized');

      // Wait for SDK to be ready
      await SDK.ready();
      console.log('[LINEAR] SDK ready');

      // CRITICAL: Notify Azure DevOps that the page loaded successfully
      SDK.notifyLoadSucceeded();
      console.log('[LINEAR] notifyLoadSucceeded called');

      // Setup UI
      console.log('[LINEAR] Setting up event handlers');
      this.setupEventHandlers();
      this.populateForm();
      console.log('[LINEAR] UI setup complete');

      // Load configuration
      console.log('[LINEAR] Loading configuration');
      await this.loadConfiguration();
      console.log('[LINEAR] Configuration loaded');

    } catch (error) {
      console.error('[LINEAR] Initialize error:', error);
      // Still notify load succeeded to dismiss spinner, even if there's an error
      try {
        SDK.notifyLoadSucceeded();
        console.log('[LINEAR] notifyLoadSucceeded called after error');
      } catch (notifyError) {
        console.error('[LINEAR] Failed to notify load succeeded:', notifyError);
      }
      this.showError('Failed to initialize: ' + (error instanceof Error ? error.message : String(error)));
    }
  }

  /**
   * Load configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    try {
      const dataService: any = await SDK.getService('ms.vss-features.extension-data-service');
      const extensionContext = SDK.getExtensionContext();
      const accessToken = await SDK.getAccessToken();
      const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
      
      const savedConfig = await dataManager.getValue('linear-config') as LinearConfig;
      
      if (savedConfig) {
        this.config = { ...this.config, ...savedConfig };
        this.showSuccess('Loaded saved settings');
      }
    } catch (error) {
      console.error('Failed to load configuration:', error);
      this.showInfo('No saved settings found');
    }
  }

  /**
   * Save configuration to storage
   */
  private async saveConfiguration(): Promise<void> {
    try {
      const dataService: any = await SDK.getService('ms.vss-features.extension-data-service');
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
      this.showError('Connection failed. Please check your API key or network connectivity.');
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
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[LINEAR] DOMContentLoaded fired, starting initialization');
  const settingsPage = new SettingsPage();
  await settingsPage.initialize();
});

// Also try immediate execution if DOM is already loaded
if (document.readyState === 'loading') {
  console.log('[LINEAR] Document is still loading, waiting for DOMContentLoaded');
} else {
  console.log('[LINEAR] Document already loaded, initializing immediately');
  const settingsPage = new SettingsPage();
  settingsPage.initialize().catch(err => {
    console.error('[LINEAR] Immediate initialization failed:', err);
  });
}

// Expose to window for debugging
(window as any).SettingsPage = SettingsPage;
(window as any).LinearSettings = { SettingsPage };
console.log('[LINEAR] SettingsPage exposed to window');

export default SettingsPage;
export { SettingsPage };
