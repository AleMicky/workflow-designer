import type { BpmnElementRegistry } from '../../bpmn/registry/BpmnElementRegistry';
import type { BpmnPropertyDefinition } from '../../bpmn/types/bpmn-element.types';
import { useFlowStore } from '../../store/flow.store';
import type { FlowNodeData } from '../../types/flow.types';

interface NodePropertiesPanelProps {
    registry?: BpmnElementRegistry;
}

const fallbackProperties = [
    {
        key: 'label',
        label: 'Nombre',
        control: 'text',
    },
    {
        key: 'code',
        label: 'Código',
        control: 'text',
    },
    {
        key: 'description',
        label: 'Descripción',
        control: 'textarea',
    },
] as const satisfies readonly BpmnPropertyDefinition[];

function getInputValue(value: unknown): string | number {
    return typeof value === 'string' || typeof value === 'number'
        ? value
        : '';
}

export function NodePropertiesPanel({ registry }: NodePropertiesPanelProps) {
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

    const data = node.data as FlowNodeData;
    const definition = registry?.get(node.type);
    const properties = definition?.properties ?? fallbackProperties;

    const update = (key: string, value: unknown) => {
        updateNodeData(node.id, { [key]: value });
    };

    const renderProperty = (property: BpmnPropertyDefinition) => {
        const inputId = `node-property-${property.key}`;
        const value = data[property.key];

        if (property.control === 'checkbox') {
            return (
                <label key={property.key} className="flow-checkbox">
                    <input
                        id={inputId}
                        type="checkbox"
                        checked={Boolean(value)}
                        onChange={(event) =>
                            update(property.key, event.target.checked)
                        }
                    />
                    <span>{property.label}</span>
                </label>
            );
        }

        if (property.control === 'textarea') {
            return (
                <div key={property.key} className="flow-field">
                    <label htmlFor={inputId}>{property.label}</label>
                    <textarea
                        id={inputId}
                        rows={4}
                        required={property.required}
                        placeholder={property.placeholder}
                        value={getInputValue(value)}
                        onChange={(event) =>
                            update(property.key, event.target.value)
                        }
                    />
                </div>
            );
        }

        if (property.control === 'select') {
            return (
                <div key={property.key} className="flow-field">
                    <label htmlFor={inputId}>{property.label}</label>
                    <select
                        id={inputId}
                        required={property.required}
                        value={getInputValue(value)}
                        onChange={(event) =>
                            update(property.key, event.target.value)
                        }
                    >
                        <option value="">Seleccionar…</option>
                        {property.options?.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            );
        }

        return (
            <div key={property.key} className="flow-field">
                <label htmlFor={inputId}>{property.label}</label>
                <input
                    id={inputId}
                    type={property.control === 'number' ? 'number' : 'text'}
                    min={property.min}
                    required={property.required}
                    placeholder={property.placeholder}
                    value={getInputValue(value)}
                    onChange={(event) => {
                        if (property.control !== 'number') {
                            update(property.key, event.target.value);
                            return;
                        }

                        update(
                            property.key,
                            event.target.value === ''
                                ? undefined
                                : Number(event.target.value),
                        );
                    }}
                />
            </div>
        );
    };

    return (
        <aside className="flow-properties">
            <div className="flow-properties__header">
                <div>
                    <h3>Propiedades</h3>
                    <span>{definition?.label ?? node.type}</span>
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
                {properties.map(renderProperty)}

                <div className="flow-properties__info">
                    <strong>ID del nodo</strong>
                    <code>{node.id}</code>

                    {definition && (
                        <>
                            <strong>Tipo BPMN</strong>
                            <code>{definition.bpmnType}</code>
                        </>
                    )}
                </div>
            </div>
        </aside>
    );
}
