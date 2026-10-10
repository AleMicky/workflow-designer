import type {
    FlowHandlePosition,
    FlowHandleType,
    FlowNode,
    FlowPosition,
} from '../../types/flow.types';

export type BpmnElementCategory =
    | 'events'
    | 'activities'
    | 'gateways';

export type BpmnPropertyControl =
    | 'text'
    | 'textarea'
    | 'number'
    | 'checkbox'
    | 'select';

export interface BpmnPropertyOption {
    label: string;
    value: string;
}

export interface BpmnPropertyDefinition {
    key: string;
    label: string;
    control: BpmnPropertyControl;
    placeholder?: string;
    required?: boolean;
    min?: number;
    options?: readonly BpmnPropertyOption[];
}

export interface BpmnHandleDefinition {
    id: string;
    type: FlowHandleType;
    position: FlowHandlePosition;
    label?: string;
    color?: string;
}

export interface BpmnElementData extends Record<string, unknown> {
    label: string;
}

export interface BpmnElementDefinition {
    /** Stable identifier used by Miky Flow nodes. */
    type: string;
    /** BPMN 2.0 qualified element name used by serializers. */
    bpmnType: `bpmn:${string}`;
    category: BpmnElementCategory;
    label: string;
    description: string;
    icon: string;
    color: string;
    handles: readonly BpmnHandleDefinition[];
    properties: readonly BpmnPropertyDefinition[];
    defaultData: BpmnElementData;
}

export interface CreateBpmnNodeOptions {
    id?: string;
    position: FlowPosition;
    data?: Partial<BpmnElementData>;
}

export type BpmnFlowNode = FlowNode<BpmnElementData>;
