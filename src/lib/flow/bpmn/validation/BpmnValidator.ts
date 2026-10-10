import type { BpmnDocument } from '../model/bpmn-document.types';
import type { BpmnElementRegistry } from '../registry/BpmnElementRegistry';
import type {
    BpmnValidationReport,
    BpmnValidationRule,
} from './bpmn-validation.types';

export class BpmnValidator {
    private readonly rules = new Map<string, BpmnValidationRule>();
    private readonly registry: BpmnElementRegistry;

    constructor(
        registry: BpmnElementRegistry,
        rules: readonly BpmnValidationRule[] = [],
    ) {
        this.registry = registry;
        this.registerMany(rules);
    }

    register(rule: BpmnValidationRule): this {
        if (this.rules.has(rule.id)) {
            throw new Error(`BPMN validation rule "${rule.id}" is already registered.`);
        }

        this.rules.set(rule.id, rule);
        return this;
    }

    registerMany(rules: readonly BpmnValidationRule[]): this {
        for (const rule of rules) {
            this.register(rule);
        }

        return this;
    }

    unregister(ruleId: string): boolean {
        return this.rules.delete(ruleId);
    }

    validate(document: BpmnDocument): BpmnValidationReport {
        const issues = [...this.rules.values()].flatMap((rule) =>
            rule.validate({ document, registry: this.registry }),
        );
        const errors = issues.filter((issue) => issue.severity === 'error');
        const warnings = issues.filter((issue) => issue.severity === 'warning');

        return {
            valid: errors.length === 0,
            issues,
            errors,
            warnings,
        };
    }
}
