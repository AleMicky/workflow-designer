import { useEffect } from 'react';

import {
    BpmnPalette,
    FlowCanvas,
    bpmnElementRegistry,
    createBpmnNodeTypes,
    useFlowStore,
} from './lib/flow';
import { NodePropertiesPanel } from './lib/flow/components/panels/NodePropertiesPanel';

const bpmnNodeTypes = createBpmnNodeTypes(bpmnElementRegistry);

export default function App() {
    const addNode = useFlowStore((state) => state.addNode);
    const addEdge = useFlowStore((state) => state.addEdge);

    useEffect(() => {
        const { nodes } = useFlowStore.getState();

        if (nodes.length > 0) return;

        addNode(
            bpmnElementRegistry.createNode('startEvent', {
                id: 'start-event',
                position: { x: 300, y: 180 },
            }),
        );

        addNode(
            bpmnElementRegistry.createNode('userTask', {
                id: 'user-task',
                position: { x: 520, y: 180 },
            }),
        );

        addNode(
            bpmnElementRegistry.createNode('exclusiveGateway', {
                id: 'exclusive-gateway',
                position: { x: 740, y: 180 },
            }),
        );

        addEdge({
            id: 'sequence-flow-1',
            source: 'start-event',
            sourceHandle: 'output',
            target: 'user-task',
            targetHandle: 'input',
            type: 'bezier',
        });

        addEdge({
            id: 'sequence-flow-2',
            source: 'user-task',
            sourceHandle: 'output',
            target: 'exclusive-gateway',
            targetHandle: 'input',
            type: 'bezier',
        });
    }, [addEdge, addNode]);

    return (
        <div className="miky-flow-app">
            <header className="miky-flow-header">
                <div>
                    <strong>Miky Flow</strong>
                    <span>Diseñador visual de procesos</span>
                </div>

                <span className="miky-flow-header__badge">
                    BPMN 2.0 · Flowable
                </span>
            </header>

            <FlowCanvas nodeTypes={bpmnNodeTypes} />
            <BpmnPalette registry={bpmnElementRegistry} />
            <NodePropertiesPanel registry={bpmnElementRegistry} />
        </div>
    );
}
