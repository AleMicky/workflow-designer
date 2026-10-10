import { useFlowStore } from '../../store/flow.store';
import type { FlowNodeData } from '../../types/flow.types';

export function NodePropertiesPanel() {
    const selectedNodeId = useFlowStore(
        (state) => state.selectedNodeId,
    );

    const node = useFlowStore((state) =>
        state.nodes.find((item) => item.id === selectedNodeId),
    );

    const updateNodeData = useFlowStore(
        (state) => state.updateNodeData,
    );

    const selectNode = useFlowStore(
        (state) => state.selectNode,
    );

    if (!node) {
        return (
            <aside className="flow-properties">
                <div className="flow-properties__empty">
                    Selecciona un nodo para configurar sus propiedades.
                </div>
            </aside>
        );
    }

    const data = node.data as unknown as FlowNodeData;

    const update = (changes: Partial<FlowNodeData>) => {
        updateNodeData(node.id, changes);
    };

    const isApproval = node.type === 'approval';

    return (
        <aside className="flow-properties">
            <div className="flow-properties__header">
                <div>
                    <h3>Propiedades</h3>
                    <span>{node.type}</span>
                </div>

                <button
                    type="button"
                    onClick={() => selectNode(null)}
                    aria-label="Cerrar propiedades"
                >
                    ×
                </button>
            </div>

            <div className="flow-properties__body">
                <div className="flow-field">
                    <label htmlFor="node-label">Nombre</label>
                    <input
                        id="node-label"
                        value={data.label ?? ''}
                        onChange={(event) =>
                            update({ label: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="node-code">Código</label>
                    <input
                        id="node-code"
                        value={data.code ?? ''}
                        placeholder="APROBACION_JEFE"
                        onChange={(event) =>
                            update({ code: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="node-description">Descripción</label>
                    <textarea
                        id="node-description"
                        rows={3}
                        value={data.description ?? ''}
                        onChange={(event) =>
                            update({ description: event.target.value })
                        }
                    />
                </div>

                {(node.type === 'task' || isApproval) && (
                    <div className="flow-field">
                        <label htmlFor="node-assignee">Responsable</label>
                        <input
                            id="node-assignee"
                            value={data.assignee ?? ''}
                            placeholder="JEFE_UNIDAD"
                            onChange={(event) =>
                                update({ assignee: event.target.value })
                            }
                        />
                    </div>
                )}

                {isApproval && (
                    <>
                        <h4>Configuración de aprobación</h4>

                        <div className="flow-checkboxes">
                            {(
                                [
                                    ['allowApprove', 'Permitir aprobar'],
                                    ['allowReject', 'Permitir rechazar'],
                                    ['allowObserve', 'Permitir observar'],
                                    ['requireComment', 'Requiere comentario'],
                                ] as const
                            ).map(([key, label]) => (
                                <label key={key} className="flow-checkbox">
                                    <input
                                        type="checkbox"
                                        checked={data[key] ?? false}
                                        onChange={(event) =>
                                            update({ [key]: event.target.checked })
                                        }
                                    />
                                    <span>{label}</span>
                                </label>
                            ))}
                        </div>

                        <div className="flow-field">
                            <label htmlFor="node-timeout">
                                Tiempo máximo (horas)
                            </label>
                            <input
                                id="node-timeout"
                                type="number"
                                min={0}
                                value={data.timeoutHours ?? ''}
                                onChange={(event) => {
                                    const value = event.target.value;

                                    update({
                                        timeoutHours:
                                            value === ''
                                                ? undefined
                                                : Math.max(0, Number(value)),
                                    });
                                }}
                            />
                        </div>
                    </>
                )}

                <div className="flow-properties__info">
                    <strong>ID del nodo</strong>
                    <code>{node.id}</code>
                </div>
            </div>
        </aside>
    );
}