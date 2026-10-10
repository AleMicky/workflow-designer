import type {
    BpmnElementDefinition,
    BpmnElementCategory,
    BpmnFlowNode,
    CreateBpmnNodeOptions,
} from '../types/bpmn-element.types';

function validateDefinition(definition: BpmnElementDefinition): void {
    if (!definition.type.trim()) {
        throw new Error('A BPMN element definition requires a type.');
    }

    if (!definition.label.trim()) {
        throw new Error(`BPMN element "${definition.type}" requires a label.`);
    }

    const handleKeys = new Set<string>();

    for (const handle of definition.handles) {
        const key = `${handle.type}:${handle.id}`;

        if (handleKeys.has(key)) {
            throw new Error(
                `BPMN element "${definition.type}" has a duplicate handle "${key}".`,
            );
        }

        handleKeys.add(key);
    }

    const propertyKeys = new Set<string>();

    for (const property of definition.properties) {
        if (propertyKeys.has(property.key)) {
            throw new Error(
                `BPMN element "${definition.type}" has a duplicate property "${property.key}".`,
            );
        }

        propertyKeys.add(property.key);
    }
}

function createNodeId(type: string): string {
    const suffix = globalThis.crypto?.randomUUID?.()
        ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

    return `${type}-${suffix}`;
}

export class BpmnElementRegistry {
    private readonly definitions = new Map<string, BpmnElementDefinition>();

    constructor(definitions: readonly BpmnElementDefinition[] = []) {
        this.registerMany(definitions);
    }

    register(definition: BpmnElementDefinition): this {
        validateDefinition(definition);

        if (this.definitions.has(definition.type)) {
            throw new Error(
                `BPMN element "${definition.type}" is already registered.`,
            );
        }

        this.definitions.set(definition.type, definition);
        return this;
    }

    registerMany(definitions: readonly BpmnElementDefinition[]): this {
        for (const definition of definitions) {
            this.register(definition);
        }

        return this;
    }

    unregister(type: string): boolean {
        return this.definitions.delete(type);
    }

    has(type: string): boolean {
        return this.definitions.has(type);
    }

    get(type: string): BpmnElementDefinition | undefined {
        return this.definitions.get(type);
    }

    getAll(): readonly BpmnElementDefinition[] {
        return [...this.definitions.values()];
    }

    getByCategory(category: BpmnElementCategory): readonly BpmnElementDefinition[] {
        return this.getAll().filter(
            (definition) => definition.category === category,
        );
    }

    createNode(type: string, options: CreateBpmnNodeOptions): BpmnFlowNode {
        const definition = this.get(type);

        if (!definition) {
            throw new Error(`BPMN element "${type}" is not registered.`);
        }

        return {
            id: options.id ?? createNodeId(type),
            type,
            position: options.position,
            data: {
                ...definition.defaultData,
                ...options.data,
            },
        };
    }
}
