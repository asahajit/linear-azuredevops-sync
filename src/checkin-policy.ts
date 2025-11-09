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

  /**
   * Initialize the policy validator
   */
  public async initialize(): Promise<void> {
    try {
      await SDK.init();
      await SDK.ready();

      // Get the Git REST client
      const apiClient = await SDK.getService<GitRestClient>('ms.vss-code-web.git-client');
      this.gitClient = apiClient;

      // Load configuration
      await this.loadConfiguration();

      // Start validation
      await this.validateCommits();
    } catch (error) {
      console.error('Failed to initialize check-in policy:', error);
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
