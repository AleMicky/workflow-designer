import type { ComponentType } from 'react';

export interface FlowNodeComponentProps<
    T = Record<string, unknown>,
> {
    id: string;
    type: string;
    data: T;
    selected: boolean;
}

export type FlowNodeTypes = Record<
    string,
    ComponentType<FlowNodeComponentProps>
>;

export interface FlowPosition {
    x: number;
    y: number;
}

export interface FlowNode<T = Record<string, unknown>> {
    id: string;
    type: string;
    position: FlowPosition;
    data: T;
    draggable?: boolean;
    selected?: boolean;
}

export interface FlowEdge {
    id: string;

    source: string;
    target: string;

    sourceHandle?: string;
    targetHandle?: string;

    type?: 'straight' | 'bezier' | 'step';

    label?: string;
}

export interface FlowViewport {
    x: number;
    y: number;
    zoom: number;
}

export interface FlowDefinition {
    id: string;
    name: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
}

export interface FlowConnection {
    source: string;
    sourceHandle?: string;
    start: FlowPosition;
    end: FlowPosition;
}

export type FlowNodeType =
    | 'start'
    | 'task'
    | 'approval'
    | 'condition'
    | 'end';

export interface FlowNodeData {
    label: string;
    code?: string;
    description?: string;
    assignee?: string;
    allowApprove?: boolean;
    allowReject?: boolean;
    allowObserve?: boolean;
    requireComment?: boolean;
    timeoutHours?: number;
}

export type FlowHandleType = 'source' | 'target';

export type FlowHandlePosition =
    | 'top'
    | 'right'
    | 'bottom'
    | 'left';

export interface FlowHandleDefinition {
    id: string;
    nodeId: string;
    type: FlowHandleType;
    position: FlowHandlePosition;
}