import type { BpmnElementRegistry } from '../../bpmn/registry/BpmnElementRegistry';
import { useFlowStore } from '../../store/flow.store';
import { EdgePropertiesPanel } from './EdgePropertiesPanel';
import { NodePropertiesPanel } from './NodePropertiesPanel';
import { ProcessPropertiesPanel } from './ProcessPropertiesPanel';

interface BpmnPropertiesPanelProps {
    registry: BpmnElementRegistry;
}

export function BpmnPropertiesPanel({ registry }: BpmnPropertiesPanelProps) {
    const selectedNodeId = useFlowStore((state) => state.selectedNodeId);
    const selectedEdgeId = useFlowStore((state) => state.selectedEdgeId);

    if (selectedEdgeId) {
        return <EdgePropertiesPanel />;
    }

    if (selectedNodeId) {
        return <NodePropertiesPanel registry={registry} />;
    }

    return <ProcessPropertiesPanel />;
}
