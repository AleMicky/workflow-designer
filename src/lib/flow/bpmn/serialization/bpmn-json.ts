import type {
    BpmnDocument,
    BpmnDocumentV1,
} from '../model/bpmn-document.types';
import { BPMN_DOCUMENT_SCHEMA_VERSION } from '../model/bpmn-document.types';

export class BpmnSerializationError extends Error {
    constructor(message: string, options?: ErrorOptions) {
        super(message, options);
        this.name = 'BpmnSerializationError';
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function assertString(value: unknown, path: string): asserts value is string {
    if (typeof value !== 'string') {
        throw new BpmnSerializationError(`Expected a string at "${path}".`);
    }
}

function assertFiniteNumber(value: unknown, path: string): asserts value is number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new BpmnSerializationError(`Expected a finite number at "${path}".`);
    }
}

function assertPosition(value: unknown, path: string): void {
    if (!isRecord(value)) {
        throw new BpmnSerializationError(`Expected a position at "${path}".`);
    }

    assertFiniteNumber(value.x, `${path}.x`);
    assertFiniteNumber(value.y, `${path}.y`);
}

function assertDocumentV1(value: unknown): asserts value is BpmnDocumentV1 {
    if (!isRecord(value)) {
        throw new BpmnSerializationError('The BPMN document must be an object.');
    }

    if (value.schemaVersion !== BPMN_DOCUMENT_SCHEMA_VERSION) {
        throw new BpmnSerializationError(
            `Unsupported BPMN document version "${String(value.schemaVersion)}".`,
        );
    }

    const process = value.process;
    const diagram = value.diagram;
    const editor = value.editor;

    if (!isRecord(process)) {
        throw new BpmnSerializationError('Missing BPMN process data.');
    }

    assertString(process.id, 'process.id');
    assertString(process.name, 'process.name');
    assertString(process.targetNamespace, 'process.targetNamespace');

    if (!Array.isArray(process.elements)) {
        throw new BpmnSerializationError('Expected an array at "process.elements".');
    }

    process.elements.forEach((element, index) => {
        const path = `process.elements[${index}]`;

        if (!isRecord(element)) {
            throw new BpmnSerializationError(`Expected an object at "${path}".`);
        }

        assertString(element.id, `${path}.id`);
        assertString(element.type, `${path}.type`);

        if (!isRecord(element.data)) {
            throw new BpmnSerializationError(`Expected an object at "${path}.data".`);
        }

        assertString(element.data.label, `${path}.data.label`);
    });

    if (!Array.isArray(process.sequenceFlows)) {
        throw new BpmnSerializationError('Expected an array at "process.sequenceFlows".');
    }

    process.sequenceFlows.forEach((sequenceFlow, index) => {
        const path = `process.sequenceFlows[${index}]`;

        if (!isRecord(sequenceFlow)) {
            throw new BpmnSerializationError(`Expected an object at "${path}".`);
        }

        assertString(sequenceFlow.id, `${path}.id`);
        assertString(sequenceFlow.sourceRef, `${path}.sourceRef`);
        assertString(sequenceFlow.targetRef, `${path}.targetRef`);

        if (sequenceFlow.data !== undefined && !isRecord(sequenceFlow.data)) {
            throw new BpmnSerializationError(`Expected an object at "${path}.data".`);
        }
    });

    if (!isRecord(diagram)) {
        throw new BpmnSerializationError('Missing BPMN diagram data.');
    }

    assertString(diagram.id, 'diagram.id');

    if (!Array.isArray(diagram.shapes) || !Array.isArray(diagram.edges)) {
        throw new BpmnSerializationError('The BPMN diagram requires shapes and edges arrays.');
    }

    diagram.shapes.forEach((shape, index) => {
        const path = `diagram.shapes[${index}]`;

        if (!isRecord(shape)) {
            throw new BpmnSerializationError(`Expected an object at "${path}".`);
        }

        assertString(shape.elementId, `${path}.elementId`);
        assertPosition(shape.position, `${path}.position`);
        assertFiniteNumber(shape.width, `${path}.width`);
        assertFiniteNumber(shape.height, `${path}.height`);
    });

    diagram.edges.forEach((edge, index) => {
        const path = `diagram.edges[${index}]`;

        if (!isRecord(edge)) {
            throw new BpmnSerializationError(`Expected an object at "${path}".`);
        }

        assertString(edge.sequenceFlowId, `${path}.sequenceFlowId`);

        if (!Array.isArray(edge.waypoints)) {
            throw new BpmnSerializationError(`Expected an array at "${path}.waypoints".`);
        }

        edge.waypoints.forEach((waypoint, waypointIndex) =>
            assertPosition(waypoint, `${path}.waypoints[${waypointIndex}]`),
        );
    });

    if (!isRecord(editor) || !isRecord(editor.viewport)) {
        throw new BpmnSerializationError('Missing BPMN editor viewport data.');
    }

    assertFiniteNumber(editor.viewport.x, 'editor.viewport.x');
    assertFiniteNumber(editor.viewport.y, 'editor.viewport.y');
    assertFiniteNumber(editor.viewport.zoom, 'editor.viewport.zoom');
}

export function serializeBpmnDocument(
    document: BpmnDocument,
    space = 2,
): string {
    assertDocumentV1(document);
    return JSON.stringify(document, null, space);
}

export function parseBpmnDocument(serialized: string): BpmnDocument {
    let value: unknown;

    try {
        value = JSON.parse(serialized) as unknown;
    } catch (error) {
        throw new BpmnSerializationError('The BPMN document is not valid JSON.', {
            cause: error,
        });
    }

    assertDocumentV1(value);
    return value;
}
