import {
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import type {
    FlowEdge as FlowEdgeType,
    FlowPosition,
} from '../../types/flow.types';

import { useFlowStore } from '../../store/flow.store';

import {
    findHandle,
    getCanvas,
    getHandlePosition,
} from '../handles/ConnectionManager';

interface FlowEdgeProps {
    edge: FlowEdgeType;
}

interface EdgePoints {
    source: FlowPosition;
    target: FlowPosition;
}

export function FlowEdge({
    edge,
}: FlowEdgeProps) {
    const groupRef = useRef<SVGGElement>(null);

    const [points, setPoints] =
        useState<EdgePoints | null>(null);

    const sourceNode = useFlowStore((state) =>
        state.nodes.find(
            (node) => node.id === edge.source,
        ),
    );

    const targetNode = useFlowStore((state) =>
        state.nodes.find(
            (node) => node.id === edge.target,
        ),
    );

    const viewport = useFlowStore(
        (state) => state.viewport,
    );

    const handles = useFlowStore(
        (state) => state.handles,
    );

    const removeEdge = useFlowStore(
        (state) => state.removeEdge,
    );

    // CALCULAR POSICIONES REALES

    useLayoutEffect(() => {
        const group = groupRef.current;

        if (!group) return;

        const canvas = getCanvas(group);

        if (!canvas) return;

        const sourceHandleId =
            edge.sourceHandle ?? 'output';

        const targetHandleId =
            edge.targetHandle ?? 'input';

        const calculate = () => {
            const source = getHandlePosition(
                edge.source,
                sourceHandleId,
                'source',
                canvas,
                viewport,
            );

            const target = getHandlePosition(
                edge.target,
                targetHandleId,
                'target',
                canvas,
                viewport,
            );

            if (!source || !target) {
                setPoints(null);
                return;
            }

            setPoints((previous) => {
                if (
                    previous?.source.x === source.x &&
                    previous?.source.y === source.y &&
                    previous?.target.x === target.x &&
                    previous?.target.y === target.y
                ) {
                    return previous;
                }

                return { source, target };
            });
        };

        calculate();

        const observer = new ResizeObserver(calculate);

        const sourceHandle = findHandle(
            canvas,
            edge.source,
            sourceHandleId,
            'source',
        );

        const targetHandle = findHandle(
            canvas,
            edge.target,
            targetHandleId,
            'target',
        );

        if (sourceHandle) {
            observer.observe(sourceHandle);
        }

        if (targetHandle) {
            observer.observe(targetHandle);
        }

        return () => {
            observer.disconnect();
        };
    }, [
        edge.source,
        edge.target,
        edge.sourceHandle,
        edge.targetHandle,
        sourceNode?.position.x,
        sourceNode?.position.y,
        targetNode?.position.x,
        targetNode?.position.y,
        viewport,
        handles,
    ]);

    if (!sourceNode || !targetNode) {
        return null;
    }

    // COORDENADAS

    const sourceX =
        points?.source.x ??
        sourceNode.position.x + 180;

    const sourceY =
        points?.source.y ??
        sourceNode.position.y + 35;

    const targetX =
        points?.target.x ??
        targetNode.position.x;

    const targetY =
        points?.target.y ??
        targetNode.position.y + 35;

    // CURVA BEZIER

    const offset = Math.max(
        Math.abs(targetX - sourceX) * 0.5,
        60,
    );

    const path = [
        `M ${sourceX} ${sourceY}`,
        `C ${sourceX + offset} ${sourceY}`,
        `${targetX - offset} ${targetY}`,
        `${targetX} ${targetY}`,
    ].join(' ');

    // PUNTO MEDIO DE LA CURVA CÚBICA

    const middleX =
        (sourceX + targetX) / 2;

    const middleY =
        (sourceY + targetY) / 2;

    return (
        <g
            ref={groupRef}
            className="flow-edge"
        >
            {/* ÁREA INTERACTIVA INVISIBLE */}

            <path
                d={path}
                fill="none"
                stroke="transparent"
                strokeWidth={16}
                className="flow-edge__hit-area"
                onPointerDown={(event) =>
                    event.stopPropagation()
                }
            />

            {/* LÍNEA VISIBLE */}

            <path
                d={path}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                className="flow-edge__path"
                pointerEvents="none"
            />

            {/* ETIQUETA */}

            {edge.label && (
                <text
                    x={middleX}
                    y={middleY - 14}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight={600}
                    fill="#475569"
                    pointerEvents="none"
                >
                    {edge.label}
                </text>
            )}

            {/* BOTÓN ELIMINAR */}

            <g
                className="flow-edge__delete"
                onPointerDown={(event) =>
                    event.stopPropagation()
                }
                onClick={(event) => {
                    event.stopPropagation();
                    removeEdge(edge.id);
                }}
            >
                <circle
                    cx={middleX}
                    cy={middleY}
                    r={10}
                    fill="#ffffff"
                    stroke="#cbd5e1"
                    strokeWidth={1.5}
                />

                <text
                    x={middleX}
                    y={middleY + 4}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={700}
                    fill="#ef4444"
                    pointerEvents="none"
                >
                    ×
                </text>
            </g>
        </g>
    );
}