import type { BpmnSequenceFlowData } from '../../bpmn/model/bpmn-document.types';
import { useFlowStore } from '../../store/flow.store';

export function EdgePropertiesPanel() {
    const selectedEdgeId = useFlowStore((state) => state.selectedEdgeId);
    const edge = useFlowStore((state) =>
        state.edges.find((item) => item.id === selectedEdgeId),
    );
    const updateEdgeData = useFlowStore((state) => state.updateEdgeData);
    const selectEdge = useFlowStore((state) => state.selectEdge);

    if (!edge) return null;

    const data = edge.data as BpmnSequenceFlowData | undefined;

    return (
        <aside className="flow-properties">
            <div className="flow-properties__header">
                <div>
                    <h3>Conexión</h3>
                    <span>Sequence Flow</span>
                </div>

                <button
                    type="button"
                    onClick={() => selectEdge(null)}
                    aria-label="Cerrar propiedades"
                >
                    ×
                </button>
            </div>

            <div className="flow-properties__body">
                <div className="flow-field">
                    <label htmlFor="edge-name">Nombre</label>
                    <input
                        id="edge-name"
                        value={data?.name ?? ''}
                        placeholder="Nombre de la ruta"
                        onChange={(event) =>
                            updateEdgeData(edge.id, { name: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="edge-condition">Condición</label>
                    <textarea
                        id="edge-condition"
                        rows={5}
                        value={data?.conditionExpression ?? ''}
                        placeholder="${variable == 'valor'}"
                        onChange={(event) =>
                            updateEdgeData(edge.id, {
                                conditionExpression: event.target.value,
                            })
                        }
                    />
                    <small className="flow-field__help">
                        Expresión que debe cumplirse para recorrer esta ruta.
                    </small>
                </div>

                <label className="flow-checkbox">
                    <input
                        type="checkbox"
                        checked={data?.isDefault ?? false}
                        onChange={(event) =>
                            updateEdgeData(edge.id, {
                                isDefault: event.target.checked,
                            })
                        }
                    />
                    <span>Ruta predeterminada</span>
                </label>

                <div className="flow-properties__info">
                    <strong>ID de la conexión</strong>
                    <code>{edge.id}</code>
                    <strong>Origen</strong>
                    <code>{edge.source}</code>
                    <strong>Destino</strong>
                    <code>{edge.target}</code>
                </div>
            </div>
        </aside>
    );
}
