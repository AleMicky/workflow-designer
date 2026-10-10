import { createElement } from 'react';

import type { FlowNodeComponentProps, FlowNodeTypes } from '../types/flow.types';
import { BpmnElementNode } from './components/BpmnElementNode';
import type { BpmnElementRegistry } from './registry/BpmnElementRegistry';

export function createBpmnNodeTypes(
    registry: BpmnElementRegistry,
): FlowNodeTypes {
    const nodeTypes: FlowNodeTypes = {};

    for (const definition of registry.getAll()) {
        nodeTypes[definition.type] = (props: FlowNodeComponentProps) =>
            createElement(BpmnElementNode, {
                ...props,
                definition,
            });
    }

    return nodeTypes;
}
