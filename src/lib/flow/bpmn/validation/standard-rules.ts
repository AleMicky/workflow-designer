import type {
    BpmnValidationIssue,
    BpmnValidationRule,
} from './bpmn-validation.types';

function issue(
    ruleId: string,
    code: string,
    severity: 'error' | 'warning',
    message: string,
    elementId?: string,
    path?: string,
): BpmnValidationIssue {
    return { ruleId, code, severity, message, elementId, path };
}

export const processIdentityRule: BpmnValidationRule = {
    id: 'process-identity',
    validate: ({ document }) => {
        const issues: BpmnValidationIssue[] = [];

        if (!document.process.id.trim()) {
            issues.push(issue(
                'process-identity',
                'PROCESS_ID_REQUIRED',
                'error',
                'El proceso necesita un identificador.',
                undefined,
                'process.id',
            ));
        }

        if (!document.process.name.trim()) {
            issues.push(issue(
                'process-identity',
                'PROCESS_NAME_REQUIRED',
                'error',
                'El proceso necesita un nombre.',
                undefined,
                'process.name',
            ));
        }

        return issues;
    },
};

export const elementDefinitionRule: BpmnValidationRule = {
    id: 'element-definitions',
    validate: ({ document, registry }) => {
        const issues: BpmnValidationIssue[] = [];
        const ids = new Set<string>();

        document.process.elements.forEach((element, index) => {
            if (ids.has(element.id)) {
                issues.push(issue(
                    'element-definitions',
                    'DUPLICATE_ELEMENT_ID',
                    'error',
                    `El identificador "${element.id}" está duplicado.`,
                    element.id,
                    `process.elements[${index}].id`,
                ));
            }

            ids.add(element.id);

            const definition = registry.get(element.type);

            if (!definition) {
                issues.push(issue(
                    'element-definitions',
                    'UNKNOWN_ELEMENT_TYPE',
                    'error',
                    `El tipo BPMN "${element.type}" no está registrado.`,
                    element.id,
                ));
                return;
            }

            for (const property of definition.properties) {
                if (!property.required) continue;

                const value = element.data[property.key];
                const missing = value === undefined
                    || value === null
                    || (typeof value === 'string' && !value.trim());

                if (missing) {
                    issues.push(issue(
                        'element-definitions',
                        'REQUIRED_PROPERTY_MISSING',
                        'error',
                        `La propiedad "${property.label}" es obligatoria.`,
                        element.id,
                        `process.elements[${index}].data.${property.key}`,
                    ));
                }
            }
        });

        return issues;
    },
};

export const startEventRule: BpmnValidationRule = {
    id: 'start-events',
    validate: ({ document }) => {
        const starts = document.process.elements.filter(
            (element) => element.type === 'startEvent',
        );

        if (starts.length > 0) return [];

        return [issue(
            'start-events',
            'START_EVENT_REQUIRED',
            'error',
            'El proceso necesita al menos un evento de inicio.',
        )];
    },
};

function validateHandle(
    type: 'source' | 'target',
    handleId: string | undefined,
    elementType: string | undefined,
    registry: Parameters<BpmnValidationRule['validate']>[0]['registry'],
): boolean {
    if (!handleId || !elementType) return true;

    return registry.get(elementType)?.handles.some(
        (handle) => handle.type === type && handle.id === handleId,
    ) ?? false;
}

export const sequenceFlowRule: BpmnValidationRule = {
    id: 'sequence-flows',
    validate: ({ document, registry }) => {
        const issues: BpmnValidationIssue[] = [];
        const elements = new Map(
            document.process.elements.map((element) => [element.id, element]),
        );
        const flowIds = new Set<string>();

        document.process.sequenceFlows.forEach((flow, index) => {
            const path = `process.sequenceFlows[${index}]`;

            if (flowIds.has(flow.id)) {
                issues.push(issue(
                    'sequence-flows',
                    'DUPLICATE_SEQUENCE_FLOW_ID',
                    'error',
                    `El identificador de conexión "${flow.id}" está duplicado.`,
                    flow.id,
                    `${path}.id`,
                ));
            }

            flowIds.add(flow.id);

            const source = elements.get(flow.sourceRef);
            const target = elements.get(flow.targetRef);

            if (!source) {
                issues.push(issue(
                    'sequence-flows',
                    'SOURCE_ELEMENT_NOT_FOUND',
                    'error',
                    `No existe el elemento de origen "${flow.sourceRef}".`,
                    flow.id,
                    `${path}.sourceRef`,
                ));
            }

            if (!target) {
                issues.push(issue(
                    'sequence-flows',
                    'TARGET_ELEMENT_NOT_FOUND',
                    'error',
                    `No existe el elemento de destino "${flow.targetRef}".`,
                    flow.id,
                    `${path}.targetRef`,
                ));
            }

            if (flow.sourceRef === flow.targetRef) {
                issues.push(issue(
                    'sequence-flows',
                    'SELF_SEQUENCE_FLOW',
                    'error',
                    'Una conexión no puede volver al mismo elemento.',
                    flow.id,
                ));
            }

            if (!validateHandle('source', flow.sourceHandle, source?.type, registry)) {
                issues.push(issue(
                    'sequence-flows',
                    'SOURCE_HANDLE_NOT_FOUND',
                    'error',
                    `El handle de salida "${flow.sourceHandle}" no existe.`,
                    flow.id,
                    `${path}.sourceHandle`,
                ));
            }

            if (!validateHandle('target', flow.targetHandle, target?.type, registry)) {
                issues.push(issue(
                    'sequence-flows',
                    'TARGET_HANDLE_NOT_FOUND',
                    'error',
                    `El handle de entrada "${flow.targetHandle}" no existe.`,
                    flow.id,
                    `${path}.targetHandle`,
                ));
            }

            if (source?.type === 'endEvent') {
                issues.push(issue(
                    'sequence-flows',
                    'END_EVENT_HAS_OUTGOING',
                    'error',
                    'Un evento de fin no puede tener conexiones salientes.',
                    source.id,
                ));
            }

            if (target?.type === 'startEvent') {
                issues.push(issue(
                    'sequence-flows',
                    'START_EVENT_HAS_INCOMING',
                    'error',
                    'Un evento de inicio no puede tener conexiones entrantes.',
                    target.id,
                ));
            }
        });

        return issues;
    },
};

export const diagramRule: BpmnValidationRule = {
    id: 'diagram',
    validate: ({ document }) => {
        const issues: BpmnValidationIssue[] = [];
        const elementIds = new Set(
            document.process.elements.map((element) => element.id),
        );
        const shapeIds = new Set<string>();

        document.diagram.shapes.forEach((shape, index) => {
            if (shapeIds.has(shape.elementId)) {
                issues.push(issue(
                    'diagram',
                    'DUPLICATE_SHAPE',
                    'error',
                    `El elemento "${shape.elementId}" tiene más de una forma gráfica.`,
                    shape.elementId,
                    `diagram.shapes[${index}]`,
                ));
            }

            shapeIds.add(shape.elementId);

            if (!elementIds.has(shape.elementId)) {
                issues.push(issue(
                    'diagram',
                    'SHAPE_ELEMENT_NOT_FOUND',
                    'error',
                    `La forma referencia un elemento inexistente "${shape.elementId}".`,
                    shape.elementId,
                ));
            }
        });

        for (const elementId of elementIds) {
            if (!shapeIds.has(elementId)) {
                issues.push(issue(
                    'diagram',
                    'SHAPE_MISSING',
                    'warning',
                    `El elemento "${elementId}" no tiene información gráfica.`,
                    elementId,
                ));
            }
        }

        return issues;
    },
};

export const reachabilityRule: BpmnValidationRule = {
    id: 'reachability',
    validate: ({ document }) => {
        const starts = document.process.elements
            .filter((element) => element.type === 'startEvent')
            .map((element) => element.id);

        if (starts.length === 0) return [];

        const adjacency = new Map<string, string[]>();

        for (const flow of document.process.sequenceFlows) {
            const targets = adjacency.get(flow.sourceRef) ?? [];
            targets.push(flow.targetRef);
            adjacency.set(flow.sourceRef, targets);
        }

        const reachable = new Set(starts);
        const pending = [...starts];

        while (pending.length > 0) {
            const current = pending.shift();
            if (!current) continue;

            for (const target of adjacency.get(current) ?? []) {
                if (reachable.has(target)) continue;
                reachable.add(target);
                pending.push(target);
            }
        }

        return document.process.elements
            .filter((element) => !reachable.has(element.id))
            .map((element) => issue(
                'reachability',
                'UNREACHABLE_ELEMENT',
                'warning',
                `El elemento "${element.data.label}" no es alcanzable desde un inicio.`,
                element.id,
            ));
    },
};

export const exclusiveGatewayRule: BpmnValidationRule = {
    id: 'exclusive-gateways',
    validate: ({ document }) => {
        const issues: BpmnValidationIssue[] = [];
        const gateways = document.process.elements.filter(
            (element) => element.type === 'exclusiveGateway',
        );

        for (const gateway of gateways) {
            const outgoing = document.process.sequenceFlows.filter(
                (flow) => flow.sourceRef === gateway.id,
            );

            if (outgoing.length < 2) continue;

            const defaultFlows = outgoing.filter((flow) => flow.data?.isDefault);

            if (defaultFlows.length > 1) {
                issues.push(issue(
                    'exclusive-gateways',
                    'MULTIPLE_DEFAULT_FLOWS',
                    'error',
                    'Una compuerta exclusiva solo puede tener una ruta predeterminada.',
                    gateway.id,
                ));
            }

            for (const flow of outgoing) {
                if (flow.data?.isDefault || flow.data?.conditionExpression?.trim()) {
                    continue;
                }

                issues.push(issue(
                    'exclusive-gateways',
                    'GATEWAY_FLOW_CONDITION_REQUIRED',
                    'error',
                    'Cada salida no predeterminada necesita una condición.',
                    flow.id,
                ));
            }
        }

        return issues;
    },
};

export const standardBpmnValidationRules = [
    processIdentityRule,
    elementDefinitionRule,
    startEventRule,
    sequenceFlowRule,
    diagramRule,
    reachabilityRule,
    exclusiveGatewayRule,
] as const satisfies readonly BpmnValidationRule[];
