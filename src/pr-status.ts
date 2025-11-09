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

  /**
   * Initialize the extension
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();

      // Get the Git REST client
      const apiClient = await SDK.getService<GitRestClient>('ms.vss-code-web.git-client');
      this.gitClient = apiClient;

      // Load Linear configuration
      await this.loadConfiguration();

      // Validate the current PR
      await this.validatePullRequest();
    } catch (error) {
      console.error('Failed to initialize PR status provider:', error);
      this.reportError('Failed to initialize Linear integration');
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
      const pr = await this.gitClient.getPullRequest(repositoryId, pullRequestId, projectId);
      
      // Extract text to validate (title + description)
      const textToValidate = `${pr.title || ''}\n${pr.description || ''}`;

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
    
    // Update PR status
    this.updatePRStatus('succeeded', message, details);
  }

  /**
   * Report warning
   */
  private reportWarning(message: string): void {
    console.warn(`⚠ ${message}`);
    this.updatePRStatus('pending', message, 'Linear work item reference recommended');
  }

  /**
   * Report failure status
   */
  private reportFailure(message: string, errors: string[]): void {
    const details = errors.join('\n');
    console.error(`✗ ${message}`);
    this.updatePRStatus('failed', message, details);
  }

  /**
   * Report error
   */
  private reportError(message: string): void {
    console.error(`✗ ${message}`);
    this.updatePRStatus('error', message, 'Check extension configuration');
  }

  /**
   * Update PR status
   */
  private updatePRStatus(state: string, message: string, description: string): void {
    // In a real implementation, this would call the Azure DevOps API
    // to update the PR status via the Status API
    console.log(`Status: ${state} - ${message}\n${description}`);
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
