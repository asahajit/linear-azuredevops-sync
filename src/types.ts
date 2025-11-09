/**
 * Configuration interface for Linear integration
 */
export interface LinearConfig {
  apiKey: string;
  organizationId?: string;
  requireWorkItemInCommits: boolean;
  requireWorkItemInPR: boolean;
}

/**
 * Linear work item reference parsed from commit messages
 */
export interface LinearWorkItemReference {
  issueId: string;
  teamKey: string;
  issueNumber: string;
  rawText: string;
}

/**
 * Validation result for Linear work item checks
 */
export interface ValidationResult {
  isValid: boolean;
  message: string;
  workItems: LinearWorkItemReference[];
  errors: string[];
}

/**
 * Linear issue information
 */
export interface LinearIssue {
  id: string;
  identifier: string;
  title: string;
  state: {
    name: string;
    type: string;
  };
  team: {
    key: string;
    name: string;
  };
  url: string;
}
