import type {
    FlowEdge,
    FlowNode,
    FlowProcessMetadata,
    FlowViewport,
} from '../../types/flow.types';
import type {
    BpmnDocument,
    BpmnProcessModel,
    BpmnSequenceFlowData,
} from './bpmn-document.types';
import { BPMN_DOCUMENT_SCHEMA_VERSION } from './bpmn-document.types';

const DEFAULT_NODE_WIDTH = 180;
const DEFAULT_NODE_HEIGHT = 70;

export interface CreateBpmnDocumentOptions {
    process: Pick<BpmnProcessModel, 'id' | 'name'>
        & Partial<Pick<
            BpmnProcessModel,
            'targetNamespace' | 'documentation' | 'version' | 'executable'
        >>;
    nodes: readonly FlowNode[];
    edges: readonly FlowEdge<BpmnSequenceFlowData>[];
    viewport: FlowViewport;
}

export interface BpmnFlowSnapshot {
    process: FlowProcessMetadata;
    nodes: FlowNode[];
    edges: FlowEdge<BpmnSequenceFlowData>[];
    viewport: FlowViewport;
}

export function createBpmnDocumentFromFlow({
    process,
    nodes,
    edges,
    viewport,
}: CreateBpmnDocumentOptions): BpmnDocument {
    return {
        schemaVersion: BPMN_DOCUMENT_SCHEMA_VERSION,
        process: {
            id: process.id,
            name: process.name,
            targetNamespace: process.targetNamespace ?? 'urn:miky-flow:process',
            documentation: process.documentation,
            version: process.version,
            executable: process.executable,
            elements: nodes.map((node) => ({
                id: node.id,
                type: node.type,
                data: {
                    label: typeof node.data.label === 'string'
                        ? node.data.label
                        : node.id,
                    ...node.data,
                },
            })),
            sequenceFlows: edges.map((edge) => ({
                id: edge.id,
                sourceRef: edge.source,
                targetRef: edge.target,
                sourceHandle: edge.sourceHandle,
                targetHandle: edge.targetHandle,
                data: {
                    ...edge.data,
                    name: edge.data?.name ?? edge.label,
                },
            })),
        },
        diagram: {
            id: `${process.id}-diagram`,
            shapes: nodes.map((node) => ({
                elementId: node.id,
                position: { ...node.position },
                width: DEFAULT_NODE_WIDTH,
                height: DEFAULT_NODE_HEIGHT,
            })),
            edges: edges.map((edge) => ({
                sequenceFlowId: edge.id,
                waypoints: [],
            })),
        },
        editor: {
            viewport: { ...viewport },
        },
    };
}

export function createFlowSnapshotFromBpmnDocument(
    document: BpmnDocument,
): BpmnFlowSnapshot {
    const shapes = new Map(
        document.diagram.shapes.map((shape) => [shape.elementId, shape]),
    );

    return {
        process: {
            id: document.process.id,
            name: document.process.name,
            targetNamespace: document.process.targetNamespace,
            documentation: document.process.documentation,
            version: document.process.version,
            executable: document.process.executable,
        },
        nodes: document.process.elements.map((element) => ({
            id: element.id,
            type: element.type,
            position: shapes.get(element.id)?.position ?? { x: 0, y: 0 },
            data: { ...element.data },
        })),
        edges: document.process.sequenceFlows.map((sequenceFlow) => ({
            id: sequenceFlow.id,
            source: sequenceFlow.sourceRef,
            target: sequenceFlow.targetRef,
            sourceHandle: sequenceFlow.sourceHandle,
            targetHandle: sequenceFlow.targetHandle,
            type: 'bezier',
            label: sequenceFlow.data?.name,
            data: sequenceFlow.data
                ? { ...sequenceFlow.data }
                : undefined,
        })),
        viewport: { ...document.editor.viewport },
    };
}
