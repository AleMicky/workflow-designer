import type { BpmnElementRegistry } from '../registry/BpmnElementRegistry';
import { BpmnValidator } from './BpmnValidator';
import { standardBpmnValidationRules } from './standard-rules';

export function createStandardBpmnValidator(
    registry: BpmnElementRegistry,
): BpmnValidator {
    return new BpmnValidator(registry, standardBpmnValidationRules);
}

export { BpmnValidator } from './BpmnValidator';
export { standardBpmnValidationRules } from './standard-rules';
export type {
    BpmnValidationContext,
    BpmnValidationIssue,
    BpmnValidationReport,
    BpmnValidationRule,
    BpmnValidationSeverity,
} from './bpmn-validation.types';
