import { useFlowStore } from '../../store/flow.store';

export function ProcessPropertiesPanel() {
    const process = useFlowStore((state) => state.process);
    const updateProcess = useFlowStore((state) => state.updateProcess);

    return (
        <aside className="flow-properties">
            <div className="flow-properties__header">
                <div>
                    <h3>Proceso</h3>
                    <span>Configuración general</span>
                </div>
            </div>

            <div className="flow-properties__body">
                <div className="flow-field">
                    <label htmlFor="process-name">Nombre</label>
                    <input
                        id="process-name"
                        value={process.name}
                        onChange={(event) =>
                            updateProcess({ name: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="process-id">ID del proceso</label>
                    <input
                        id="process-id"
                        value={process.id}
                        onChange={(event) =>
                            updateProcess({ id: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="process-namespace">Namespace</label>
                    <input
                        id="process-namespace"
                        value={process.targetNamespace}
                        onChange={(event) =>
                            updateProcess({ targetNamespace: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="process-version">Versión</label>
                    <input
                        id="process-version"
                        value={process.version ?? ''}
                        placeholder="1.0"
                        onChange={(event) =>
                            updateProcess({ version: event.target.value })
                        }
                    />
                </div>

                <div className="flow-field">
                    <label htmlFor="process-documentation">Documentación</label>
                    <textarea
                        id="process-documentation"
                        rows={5}
                        value={process.documentation ?? ''}
                        onChange={(event) =>
                            updateProcess({ documentation: event.target.value })
                        }
                    />
                </div>

                <label className="flow-checkbox">
                    <input
                        type="checkbox"
                        checked={process.executable ?? false}
                        onChange={(event) =>
                            updateProcess({ executable: event.target.checked })
                        }
                    />
                    <span>Proceso ejecutable</span>
                </label>
            </div>
        </aside>
    );
}
