import type {
    FlowNode as FlowNodeType,
    FlowNodeTypes,
} from '../types/flow.types';

interface FlowNodeRendererProps {
    node: FlowNodeType;
    selected: boolean;
    nodeTypes?: FlowNodeTypes;
}

export function FlowNodeRenderer({
    node,
    selected,
    nodeTypes = {},
}: FlowNodeRendererProps) {
    const Component = nodeTypes[node.type];

    if (!Component) {
        return (
            <div className="flow-node-default">
                <strong>{String(node.data.label ?? node.id)}</strong>
            </div>
        );
    }

    return (
        <Component
            id={node.id}
            type={node.type}
            data={node.data}
            selected={selected}
        />
    );
}