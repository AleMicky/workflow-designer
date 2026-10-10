import type {
    FlowNodeComponentProps,
} from '../../../lib/flow/types/flow.types';
import { FlowHandle } from '../../../lib/flow/components/handles/FlowHandle';

export function ConditionNode({
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

            <div className="workflow-node workflow-node--condition">
                <span className="workflow-node__icon">◇</span>

                <div>
                    <strong>Condición</strong>
                    <small>{String(data.label ?? 'Evaluar condición')}</small>
                </div>
            </div>

            <FlowHandle
                nodeId={id}
                id="true"
                type="source"
                position="right"
                label="Sí"
                color="#10b981"
                style={{ top: '35%' }}
            />

            <FlowHandle
                nodeId={id}
                id="false"
                type="source"
                position="right"
                label="No"
                color="#ef4444"
                style={{ top: '65%' }}
            />
        </>
    );
}
