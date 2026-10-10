import type {
    FlowNodeComponentProps,
} from '../../../lib/flow/types/flow.types';

import { FlowHandle } from '../../../lib/flow/components/handles/FlowHandle';

export function ApprovalNode({
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

            <div className="workflow-node workflow-node--approval">
                <span className="workflow-node__icon">✓</span>

                <div>
                    <strong>Aprobación</strong>
                    <small>{String(data.label ?? 'Nueva aprobación')}</small>
                </div>
            </div>

            <FlowHandle
                nodeId={id}
                id="approved"
                type="source"
                position="right"
                label="Aprobado"
                color="#10b981"
                style={{ top: '25%' }}
            />

            <FlowHandle
                nodeId={id}
                id="rejected"
                type="source"
                position="right"
                label="Rechazado"
                color="#ef4444"
                style={{ top: '50%' }}
            />

            <FlowHandle
                nodeId={id}
                id="observed"
                type="source"
                position="right"
                label="Observado"
                color="#f59e0b"
                style={{ top: '75%' }}
            />
        </>
    );
}
