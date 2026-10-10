import type {
    FlowNodeComponentProps,
} from '../../../lib/flow/types/flow.types';
import { FlowHandle } from '../../../lib/flow/components/handles/FlowHandle';

export function EndNode({
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

            <div className="workflow-node workflow-node--end">
                <span className="workflow-node__icon">■</span>

                <div>
                    <strong>Fin</strong>
                    <small>{String(data.label ?? 'Fin del proceso')}</small>
                </div>
            </div>
        </>
    );
}