import type { CSSProperties } from 'react';

import { FlowHandle } from '../../components/handles/FlowHandle';
import type {
    FlowNodeComponentProps,
} from '../../types/flow.types';
import type { BpmnElementDefinition } from '../types/bpmn-element.types';

interface BpmnElementNodeProps extends FlowNodeComponentProps {
    definition: BpmnElementDefinition;
}

export function BpmnElementNode({
    id,
    data,
    definition,
}: BpmnElementNodeProps) {
    const instanceLabel = typeof data.label === 'string'
        ? data.label
        : definition.label;

    const style = {
        '--bpmn-element-color': definition.color,
    } as CSSProperties;

    return (
        <>
            {definition.handles.map((handle) => (
                <FlowHandle
                    key={`${handle.type}:${handle.id}`}
                    nodeId={id}
                    id={handle.id}
                    type={handle.type}
                    position={handle.position}
                    label={handle.label}
                    color={handle.color ?? definition.color}
                />
            ))}

            <div
                className={`bpmn-node bpmn-node--${definition.category}`}
                style={style}
            >
                <span className="bpmn-node__icon" aria-hidden="true">
                    {definition.icon}
                </span>

                <div className="bpmn-node__content">
                    <strong>{definition.label}</strong>
                    <small>{instanceLabel}</small>
                </div>
            </div>
        </>
    );
}
