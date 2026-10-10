import type { CSSProperties } from 'react';

import type { BpmnElementRegistry } from '../../bpmn/registry/BpmnElementRegistry';
import type {
    BpmnElementCategory,
    BpmnElementDefinition,
} from '../../bpmn/types/bpmn-element.types';
import { useFlowStore } from '../../store/flow.store';

interface BpmnPaletteProps {
    registry: BpmnElementRegistry;
}

const categories: readonly {
    id: BpmnElementCategory;
    label: string;
}[] = [
    { id: 'events', label: 'Eventos' },
    { id: 'activities', label: 'Actividades' },
    { id: 'gateways', label: 'Compuertas' },
];

export function BpmnPalette({ registry }: BpmnPaletteProps) {
    const addNode = useFlowStore((state) => state.addNode);
    const selectNode = useFlowStore((state) => state.selectNode);
    const nodeCount = useFlowStore((state) => state.nodes.length);
    const viewport = useFlowStore((state) => state.viewport);

    const addElement = (definition: BpmnElementDefinition) => {
        const column = nodeCount % 3;
        const row = Math.floor(nodeCount / 3) % 5;
        const node = registry.createNode(definition.type, {
            position: {
                x: (300 - viewport.x) / viewport.zoom + column * 210,
                y: (300 - viewport.y) / viewport.zoom + row * 120,
            },
        });

        addNode(node);
        selectNode(node.id);
    };

    return (
        <aside className="bpmn-palette" aria-label="Elementos BPMN">
            <div className="bpmn-palette__header">
                <span>Elementos BPMN</span>
                <small>Haz clic para añadir</small>
            </div>

            <div className="bpmn-palette__body">
                {categories.map((category) => {
                    const definitions = registry.getByCategory(category.id);

                    if (definitions.length === 0) return null;

                    return (
                        <section key={category.id} className="bpmn-palette__group">
                            <h2>{category.label}</h2>

                            <div className="bpmn-palette__items">
                                {definitions.map((definition) => {
                                    const style = {
                                        '--bpmn-element-color': definition.color,
                                    } as CSSProperties;

                                    return (
                                        <button
                                            key={definition.type}
                                            type="button"
                                            className="bpmn-palette__item"
                                            style={style}
                                            title={definition.description}
                                            onClick={() => addElement(definition)}
                                        >
                                            <span aria-hidden="true">
                                                {definition.icon}
                                            </span>
                                            <span>{definition.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    );
                })}
            </div>
        </aside>
    );
}
