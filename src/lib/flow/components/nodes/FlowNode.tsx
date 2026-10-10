import { useRef, useState } from 'react';

import type {
    MouseEvent,
    PointerEvent,
} from 'react';

import type {
    FlowNode as FlowNodeType,
    FlowNodeTypes,
} from '../../types/flow.types';

import { useFlowStore } from '../../store/flow.store';

import { FlowHandle } from '../handles/FlowHandle';
import { FlowNodeRenderer } from '../../core/FlowNodeRenderer';

interface FlowNodeProps {
    node: FlowNodeType;
    nodeTypes?: FlowNodeTypes;
}

interface DragState {
    pointerX: number;
    pointerY: number;
    nodeX: number;
    nodeY: number;
}

export function FlowNode({
    node,
    nodeTypes,
}: FlowNodeProps) {
    const selectedNodeId = useFlowStore(
        (state) => state.selectedNodeId,
    );

    const selectNode = useFlowStore(
        (state) => state.selectNode,
    );

    const updateNodePosition = useFlowStore(
        (state) => state.updateNodePosition,
    );

    const removeNode = useFlowStore(
        (state) => state.removeNode,
    );

    const zoom = useFlowStore(
        (state) => state.viewport.zoom,
    );

    const [isDragging, setIsDragging] = useState(false);

    const dragRef = useRef<DragState | null>(null);

    const isSelected = selectedNodeId === node.id;

    const isCustom = Boolean(
        nodeTypes && nodeTypes[node.type],
    );

    // INICIAR ARRASTRE

    const handlePointerDown = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (event.button !== 0) return;

        event.stopPropagation();

        // Evitar arrastrar cuando se interactúa
        // con controles internos del nodo.
        const target = event.target as HTMLElement;

        if (
            target.closest(
                'button, input, textarea, select, a, [data-no-drag]',
            )
        ) {
            return;
        }

        selectNode(node.id);

        if (node.draggable === false) return;

        event.preventDefault();

        event.currentTarget.setPointerCapture(
            event.pointerId,
        );

        setIsDragging(true);

        dragRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            nodeX: node.position.x,
            nodeY: node.position.y,
        };
    };

    // MOVER NODO

    const handlePointerMove = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (!dragRef.current) return;

        const drag = dragRef.current;

        const deltaX =
            (event.clientX - drag.pointerX) / zoom;

        const deltaY =
            (event.clientY - drag.pointerY) / zoom;

        updateNodePosition(node.id, {
            x: drag.nodeX + deltaX,
            y: drag.nodeY + deltaY,
        });
    };

    // FINALIZAR ARRASTRE

    const handlePointerUp = (
        event: PointerEvent<HTMLDivElement>,
    ) => {
        if (
            event.currentTarget.hasPointerCapture(
                event.pointerId,
            )
        ) {
            event.currentTarget.releasePointerCapture(
                event.pointerId,
            );
        }

        dragRef.current = null;
        setIsDragging(false);
    };

    // ELIMINAR NODO

    const handleDelete = (
        event: MouseEvent<HTMLButtonElement>,
    ) => {
        event.stopPropagation();
        removeNode(node.id);
    };

    return (
        <div
            className={[
                'flow-node',
                `flow-node--${node.type}`,
                isDragging ? 'flow-node--dragging' : '',
                isSelected ? 'flow-node--selected' : '',
            ]
                .filter(Boolean)
                .join(' ')}
            data-node-id={node.id}
            style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width: 180,
                height: 70,
                touchAction: 'none',
                cursor:
                    node.draggable === false
                        ? 'default'
                        : isDragging
                            ? 'grabbing'
                            : 'grab',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
        >
            {/* ELIMINAR */}

            <button
                type="button"
                className="flow-node__delete"
                onPointerDown={(event) =>
                    event.stopPropagation()
                }
                onClick={handleDelete}
                title="Eliminar nodo"
                aria-label="Eliminar nodo"
            >
                ×
            </button>

            {/* HANDLE DE ENTRADA PREDETERMINADO */}

            {!isCustom && node.type !== 'start' && (
                <FlowHandle
                    nodeId={node.id}
                    id="input"
                    type="target"
                    position="left"
                />
            )}

            {/* CONTENIDO */}

            <div className="flow-node__content">
                <FlowNodeRenderer
                    node={node}
                    selected={isSelected}
                    nodeTypes={nodeTypes}
                />
            </div>

            {/* HANDLE DE SALIDA PREDETERMINADO */}

            {!isCustom && node.type !== 'end' && (
                <FlowHandle
                    nodeId={node.id}
                    id="output"
                    type="source"
                    position="right"
                />
            )}
        </div>
    );
}