import { useEffect, useMemo } from 'react';

import {
    BpmnPalette,
    FlowCanvas,
    bpmnElementRegistry,
    createBpmnDocumentFromFlow,
    createBpmnNodeTypes,
    createStandardBpmnValidator,
    useFlowStore,
} from './lib/flow';
import { NodePropertiesPanel } from './lib/flow/components/panels/NodePropertiesPanel';

const bpmnNodeTypes = createBpmnNodeTypes(bpmnElementRegistry);
const bpmnValidator = createStandardBpmnValidator(bpmnElementRegistry);

export default function App() {
    const addNode = useFlowStore((state) => state.addNode);
    const addEdge = useFlowStore((state) => state.addEdge);
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const viewport = useFlowStore((state) => state.viewport);

    const validation = useMemo(() => {
        const document = createBpmnDocumentFromFlow({
            process: {
                id: 'process-1',
                name: 'Proceso sin título',
            },
            nodes,
            edges,
            viewport,
        });

        return bpmnValidator.validate(document);
    }, [edges, nodes, viewport]);

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
                <div className="miky-flow-header__identity">
                    <strong>Miky Flow</strong>
                    <span>Diseñador visual de procesos</span>
                </div>

                <div className="miky-flow-header__status">
                    <span className="miky-flow-header__badge">
                        BPMN 2.0 · Flowable
                    </span>
                    <span
                        className={`miky-flow-header__validation ${
                            validation.valid
                                ? 'miky-flow-header__validation--valid'
                                : 'miky-flow-header__validation--invalid'
                        }`}
                        title={validation.issues
                            .map((item) => item.message)
                            .join('\n')}
                    >
                        {validation.valid
                            ? `Modelo válido${
                                validation.warnings.length > 0
                                    ? ` · ${validation.warnings.length} avisos`
                                    : ''
                            }`
                            : `${validation.errors.length} errores`}
                    </span>
                </div>
            </header>

            <FlowCanvas nodeTypes={bpmnNodeTypes} />
            <BpmnPalette registry={bpmnElementRegistry} />
            <NodePropertiesPanel registry={bpmnElementRegistry} />
        </div>
    );
}
