import type {
    FlowNodeComponentProps,
} from '../../../lib/flow/types/flow.types';
import { FlowHandle } from '../../../lib/flow/components/handles/FlowHandle';

export function StartNode({
    id,
    data,
}: FlowNodeComponentProps) {
    return (
        <>
            <div className="workflow-node workflow-node--start">
                <span className="workflow-node__icon">▶</span>

                <div>
                    <strong>Inicio</strong>
                    <small>{String(data.label ?? 'Inicio del proceso')}</small>
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