import { useEffect } from 'react';

import {
    FlowCanvas,
    useFlowStore,
} from './lib/flow';
import { NodePropertiesPanel } from './lib/flow/components/panels/NodePropertiesPanel';
import { workflowNodeTypes } from './features/workflow/node-types';

export default function App() {
    const addNode = useFlowStore((state) => state.addNode);
    const addEdge = useFlowStore((state) => state.addEdge);

    const handleAddNode = (
        type: 'task' | 'approval' | 'condition' | 'end',
        label: string,
    ) => {
        const id = `node-${Date.now().toString(36)}`;
        const randomOffsetY = (Math.random() - 0.5) * 80;
        addNode({
            id,
            type,
            position: { x: 250 + Math.random() * 200, y: 250 + randomOffsetY },
            data: { label },
        });
    };

    useEffect(() => {
        const { nodes } = useFlowStore.getState();

        if (nodes.length > 0) return;

        addNode({
            id: 'inicio',
            type: 'start',
            position: { x: 100, y: 180 },
            data: { label: 'Inicio del proceso' },
        });

        addNode({
            id: 'solicitud',
            type: 'task',
            position: { x: 400, y: 180 },
            data: { label: 'Solicitud de compra' },
        });

        addNode({
            id: 'aprobacion',
            type: 'approval',
            position: { x: 700, y: 180 },
            data: { label: 'Aprobación del jefe' },
        });

        addEdge({
            id: 'edge-1',
            source: 'inicio',
            target: 'solicitud',
        });

        addEdge({
            id: 'edge-2',
            source: 'solicitud',
            target: 'aprobacion',
        });
    }, [addNode, addEdge]);

    return (
        <div style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
            {/* Barra superior de herramientas */}
            <header
                style={{
                    position: 'absolute',
                    top: 16,
                    left: 20,
                    right: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 18px',
                    background: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid #e2e8f0',
                    borderRadius: 12,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    zIndex: 25,
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: '#0f172a' }}>
                        Workflow Designer
                    </span>
                    <span
                        style={{
                            fontSize: 12,
                            padding: '3px 8px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            borderRadius: 6,
                            fontWeight: 600,
                        }}
                    >
                        React 19 + Zustand
                    </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <button
                        type="button"
                        onClick={() => handleAddNode('task', 'Nueva tarea')}
                        style={{
                            padding: '7px 14px',
                            background: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Tarea
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAddNode('approval', 'Nueva aprobación')}
                        style={{
                            padding: '7px 14px',
                            background: '#f59e0b',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Aprobación
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAddNode('condition', 'Nueva condición')}
                        style={{
                            padding: '7px 14px',
                            background: '#8b5cf6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Condición
                    </button>
                    <button
                        type="button"
                        onClick={() => handleAddNode('end', 'Fin')}
                        style={{
                            padding: '7px 14px',
                            background: '#ef4444',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: 8,
                            fontSize: 13,
                            fontWeight: 600,
                            cursor: 'pointer',
                        }}
                    >
                        + Fin
                    </button>
                </div>
            </header>

            <FlowCanvas nodeTypes={workflowNodeTypes} />

            <NodePropertiesPanel />
        </div>
    );
}