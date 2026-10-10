import type {
    FlowPosition,
    FlowViewport,
} from '../../types/flow.types';
import type { BpmnElementData } from '../types/bpmn-element.types';

export const BPMN_DOCUMENT_SCHEMA_VERSION = 1 as const;

export interface BpmnElementInstance {
    id: string;
    type: string;
    data: BpmnElementData;
}

export interface BpmnSequenceFlowData extends Record<string, unknown> {
    name?: string;
    conditionExpression?: string;
    isDefault?: boolean;
}

export interface BpmnSequenceFlow {
    id: string;
    sourceRef: string;
    targetRef: string;
    sourceHandle?: string;
    targetHandle?: string;
    data?: BpmnSequenceFlowData;
}

export interface BpmnProcessModel {
    id: string;
    name: string;
    targetNamespace: string;
    documentation?: string;
    elements: BpmnElementInstance[];
    sequenceFlows: BpmnSequenceFlow[];
}

export interface BpmnShape {
    elementId: string;
    position: FlowPosition;
    width: number;
    height: number;
}

export interface BpmnEdgeDiagram {
    sequenceFlowId: string;
    waypoints: FlowPosition[];
}

export interface BpmnDiagramModel {
    id: string;
    shapes: BpmnShape[];
    edges: BpmnEdgeDiagram[];
}

export interface BpmnEditorState {
    viewport: FlowViewport;
}

export interface BpmnDocumentV1 {
    schemaVersion: typeof BPMN_DOCUMENT_SCHEMA_VERSION;
    process: BpmnProcessModel;
    diagram: BpmnDiagramModel;
    editor: BpmnEditorState;
}

export type BpmnDocument = BpmnDocumentV1;
