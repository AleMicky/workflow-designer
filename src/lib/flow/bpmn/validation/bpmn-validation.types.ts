import type { BpmnDocument } from '../model/bpmn-document.types';
import type { BpmnElementRegistry } from '../registry/BpmnElementRegistry';

export type BpmnValidationSeverity = 'error' | 'warning';

export interface BpmnValidationIssue {
    ruleId: string;
    code: string;
    severity: BpmnValidationSeverity;
    message: string;
    elementId?: string;
    path?: string;
}

export interface BpmnValidationContext {
    document: BpmnDocument;
    registry: BpmnElementRegistry;
}

export interface BpmnValidationRule {
    id: string;
    validate: (
        context: BpmnValidationContext,
    ) => readonly BpmnValidationIssue[];
}

export interface BpmnValidationReport {
    valid: boolean;
    issues: BpmnValidationIssue[];
    errors: BpmnValidationIssue[];
    warnings: BpmnValidationIssue[];
}
