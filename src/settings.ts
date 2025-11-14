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
      // Resolve the runtime SDK (imported module, window.SDK, or AMD require)
      const sdk = await this.resolveSdk();

      await sdk.init();
      // Wait for SDK.ready with timeout to avoid hanging indefinitely
      await this.waitForSdkReady(10000, sdk);

      // Load existing configuration (don't block UI on failure)
      this.loadConfiguration().catch(err => {
        console.warn('Non-fatal: failed to load configuration', err);
        this.showInfo('Could not load saved settings (will continue).');
      });

      // Setup UI event handlers and populate form immediately
      this.setupEventHandlers();
      this.populateForm();

    } catch (error) {
      console.error('Failed to initialize settings:', error);
      this.showError('Failed to load settings');
    }
  }

  /**
   * Resolve the Azure DevOps extension SDK at runtime.
   * Tries in order: imported `SDK` binding, `SDK.default`, `window.SDK`, and AMD `require`.
   */
  private resolveSdk(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      try {
        // 1) Imported SDK (module namespace)
        if (SDK && typeof (SDK as any).init === 'function') {
          return resolve(SDK);
        }

        // 2) Imported default export (some bundlers use default)
        if (SDK && (SDK as any).default && typeof (SDK as any).default.init === 'function') {
          return resolve((SDK as any).default);
        }

        // 3) Global window.SDK exposed by host
        if (typeof (window as any).SDK !== 'undefined' && typeof (window as any).SDK.init === 'function') {
          return resolve((window as any).SDK);
        }

        // 4) AMD require (async)
        const req = (window as any).require;
        if (typeof req === 'function') {
          try {
            // AMD-style require takes an array and a callback
            req(['azure-devops-extension-sdk'], (maybe: any) => {
              if (maybe && typeof maybe.init === 'function') return resolve(maybe);
              if (maybe && maybe.default && typeof maybe.default.init === 'function') return resolve(maybe.default);
              return reject(new Error('AMD module loaded but does not expose init()'));
            }, (err: any) => {
              return reject(err || new Error('AMD require failed'));
            });
            return;
          } catch (e) {
            // fallthrough to reject below
          }
        }

        return reject(new Error('Azure DevOps extension SDK not available (init not found)'));
      } catch (e) {
        return reject(e);
      }
    });
  }

  /**
   * Load configuration from storage
   */
  private async loadConfiguration(): Promise<void> {
    // Try to load from extension data service with retries; fallback to localStorage
    const maxAttempts = 3;
    const attemptDelay = 1000; // ms

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        this.showInfo(`Loading saved settings (attempt ${attempt}/${maxAttempts})...`);
        const dataService = await SDK.getService<IExtensionDataService>('ms.vss-features.extension-data-service');
        this.showInfo('Obtained extension data service');

        const extensionContext = SDK.getExtensionContext();
        const accessToken = await SDK.getAccessToken();
        this.showInfo('Got access token');

        const dataManager = await dataService.getExtensionDataManager(extensionContext.id, accessToken);
        this.showInfo('Obtained data manager');

        const savedConfig = await dataManager.getValue('linear-config') as LinearConfig;

        if (savedConfig) {
          this.config = { ...this.config, ...savedConfig };
          this.showSuccess('Loaded saved settings');
        } else {
          this.showInfo('No saved settings found');
        }

        return;
      } catch (error) {
        console.warn(`loadConfiguration attempt ${attempt} failed:`, error);
        // If last attempt, surface friendly error and fallback
        if (attempt === maxAttempts) {
          console.error('Failed to load configuration after retries:', error);
          this.showError('Unable to load saved settings from Azure DevOps. Using local settings if available.');

          // Fallback to localStorage if available
          try {
            const raw = localStorage.getItem('linear-config');
            if (raw) {
              const local = JSON.parse(raw) as LinearConfig;
              this.config = { ...this.config, ...local };
              this.showInfo('Loaded settings from browser storage as fallback');
            }
          } catch (err) {
            console.warn('localStorage fallback failed', err);
          }

          return;
        }

        // wait before retrying
        await this.delay(attempt * attemptDelay);
      }
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
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
   * Wait for SDK.ready with timeout
   */
  private async waitForSdkReady(timeoutMs: number, sdk?: any): Promise<void> {
    const runtimeSdk = sdk || SDK;
    const readyPromise = typeof runtimeSdk.ready === 'function' ? runtimeSdk.ready() : Promise.resolve();
    let timer: any;
    const timeoutPromise = new Promise<void>((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error('SDK.ready() timed out')), timeoutMs);
    });

    try {
      await Promise.race([readyPromise, timeoutPromise]);
    } finally {
      clearTimeout(timer);
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
