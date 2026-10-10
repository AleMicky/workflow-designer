import type {
    FlowNodeComponentProps,
} from '../../../lib/flow/types/flow.types';

import { FlowHandle } from '../../../lib/flow/components/handles/FlowHandle';

export function TaskNode({
    id,
    data,
}: FlowNodeComponentProps) {
    return (
        <>
            <FlowHandle
                nodeId={id}
                id="input"
                type="target"
                position="left"
            />

            <div className="workflow-node workflow-node--task">
                <span className="workflow-node__icon">☷</span>

                <div>
                    <strong>Tarea</strong>
                    <small>{String(data.label ?? 'Nueva tarea')}</small>
                </div>
            </div>

            <FlowHandle
                nodeId={id}
                id="output"
                type="source"
                position="right"
            />
        </>
    );
}