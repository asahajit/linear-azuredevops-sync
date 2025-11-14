import { LinearConfig, LinearWorkItemReference, LinearIssue, ValidationResult } from '../types';

/**
 * Service for interacting with Linear API
 */
export class LinearService {
  // We dynamically import the heavy `@linear/sdk` at runtime to avoid
  // adding the browser-unfriendly Node-targeted bundle into our main chunks.
  // This reduces initial parse/eval time (helps avoid long main-thread tasks).
  private client: any = null;
  private config: LinearConfig | null = null;

  /**
   * Initialize the Linear client with API key
   */
  public initialize(config: LinearConfig): void {
    if (!config.apiKey) {
      throw new Error('Linear API key is required');
    }
    
    this.config = config;
    // Lazy-load the Linear client implementation when needed.
    // Keep initialization synchronous by creating the client holder now
    // and creating the real client asynchronously when first used.
    this.client = { __pendingInit: true, apiKey: config.apiKey };
  }

  /**
   * Check if the service is initialized
   */
  public isInitialized(): boolean {
    return this.client !== null && this.config !== null;
  }

  /**
   * Extract Linear work item references from text (commit message, PR description, etc.)
   * Supports formats: LIN-123, TEAM-456, etc.
   */
  public extractWorkItemReferences(text: string): LinearWorkItemReference[] {
    const references: LinearWorkItemReference[] = [];
    
    // Regex pattern to match Linear issue identifiers (e.g., LIN-123, TEAM-456)
    const pattern = /\b([A-Z]{2,10})-(\d{1,6})\b/g;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      references.push({
        issueId: match[0],
        teamKey: match[1],
        issueNumber: match[2],
        rawText: match[0]
      });
    }

    return references;
  }

  /**
   * Validate a Linear work item exists and is accessible
   */
  public async validateWorkItem(reference: LinearWorkItemReference): Promise<{ isValid: boolean; issue?: LinearIssue; error?: string }> {
    if (!this.client) {
      return { isValid: false, error: 'Linear client not initialized' };
    }

    // If client is a pending placeholder, perform the dynamic import and construct it now
    if (this.client && this.client.__pendingInit) {
      try {
        const sdk = await import('@linear/sdk');
        const LinearClient = sdk.LinearClient || (sdk as any).default?.LinearClient || (sdk as any).default;
        this.client = new LinearClient({ apiKey: this.client.apiKey });
      } catch (err) {
        console.error('Failed to load @linear/sdk dynamically:', err);
        return { isValid: false, error: 'Failed to initialize Linear client' };
      }
    }

    try {
      const issue = await this.client.issue(reference.issueId);
      
      if (!issue) {
        return { isValid: false, error: `Issue ${reference.issueId} not found` };
      }

      const issueData: LinearIssue = {
        id: issue.id,
        identifier: issue.identifier,
        title: issue.title,
        state: {
          name: (await issue.state)?.name || 'Unknown',
          type: (await issue.state)?.type || 'Unknown'
        },
        team: {
          key: (await issue.team)?.key || reference.teamKey,
          name: (await issue.team)?.name || 'Unknown'
        },
        url: issue.url
      };

      return { isValid: true, issue: issueData };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { isValid: false, error: `Failed to validate ${reference.issueId}: ${errorMessage}` };
    }
  }

  /**
   * Validate multiple work items
   */
  public async validateWorkItems(references: LinearWorkItemReference[]): Promise<ValidationResult> {
    if (!this.isInitialized()) {
      return {
        isValid: false,
        message: 'Linear integration is not configured',
        workItems: [],
        errors: ['Linear API key not configured']
      };
    }

    if (references.length === 0) {
      return {
        isValid: false,
        message: 'No Linear work items found',
        workItems: [],
        errors: ['No Linear issue references found in commit message']
      };
    }

    const errors: string[] = [];
    const validWorkItems: LinearWorkItemReference[] = [];

    for (const ref of references) {
      const result = await this.validateWorkItem(ref);
      
      if (result.isValid) {
        validWorkItems.push(ref);
      } else {
        errors.push(result.error || `Invalid reference: ${ref.issueId}`);
      }
    }

    const isValid = validWorkItems.length > 0 && errors.length === 0;

    return {
      isValid,
      message: isValid 
        ? `Found ${validWorkItems.length} valid Linear issue(s)` 
        : `Validation failed: ${errors.join(', ')}`,
      workItems: validWorkItems,
      errors
    };
  }

  /**
   * Validate commit message contains valid Linear work items
   */
  public async validateCommitMessage(commitMessage: string): Promise<ValidationResult> {
    const references = this.extractWorkItemReferences(commitMessage);
    return await this.validateWorkItems(references);
  }

  /**
   * Search for Linear issues by query
   */
  public async searchIssues(query: string): Promise<LinearIssue[]> {
    if (!this.client) {
      throw new Error('Linear client not initialized');
    }

    try {
      const issues = await this.client.issues({
        filter: {
          title: { contains: query }
        }
      });

      const results: LinearIssue[] = [];
      
      for (const issue of issues.nodes) {
        results.push({
          id: issue.id,
          identifier: issue.identifier,
          title: issue.title,
          state: {
            name: (await issue.state)?.name || 'Unknown',
            type: (await issue.state)?.type || 'Unknown'
          },
          team: {
            key: (await issue.team)?.key || '',
            name: (await issue.team)?.name || 'Unknown'
          },
          url: issue.url
        });
      }

      return results;
    } catch (error) {
      console.error('Error searching issues:', error);
      return [];
    }
  }
}

// Singleton instance
export const linearService = new LinearService();
