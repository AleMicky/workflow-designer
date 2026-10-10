import { useEffect } from 'react';

import type {
    CSSProperties,
    PointerEvent,
} from 'react';

import type {
    FlowHandlePosition,
    FlowHandleType,
} from '../../types/flow.types';

import { useFlowStore } from '../../store/flow.store';

import {
    getCanvas,
    screenToFlowPosition,
    findTargetHandle,
} from './ConnectionManager';

interface FlowHandleProps {
    nodeId: string;
    id: string;
    type: FlowHandleType;
    position?: FlowHandlePosition;
    color?: string;
    style?: CSSProperties;
}

const EDGE_LABELS: Record<string, string> = {
    approved: 'Aprobado',
    rejected: 'Rechazado',
    observed: 'Observado',
    true: 'Sí',
    false: 'No',
};

export function FlowHandle({
    nodeId,
    id,
    type,
    position = 'right',
    color,
    style,
}: FlowHandleProps) {
    const registerHandle = useFlowStore(
        (state) => state.registerHandle,
    );

    const unregisterHandle = useFlowStore(
        (state) => state.unregisterHandle,
    );

    const startConnection = useFlowStore(
        (state) => state.startConnection,
    );

    const updateConnection = useFlowStore(
        (state) => state.updateConnection,
    );

    const endConnection = useFlowStore(
        (state) => state.endConnection,
    );

    const addEdge = useFlowStore(
        (state) => state.addEdge,
    );

    // REGISTRAR HANDLE

    useEffect(() => {
        registerHandle({
            id,
            nodeId,
            type,
            position,
        });

        return () => {
            unregisterHandle(nodeId, type, id);
        };
    }, [
        id,
        nodeId,
        type,
        position,
        registerHandle,
        unregisterHandle,
    ]);

    // INICIAR CONEXIÓN

    const handlePointerDown = (
        event: PointerEvent<HTMLButtonElement>,
    ) => {
        event.stopPropagation();

        if (type !== 'source') return;
        if (event.button !== 0) return;

        event.preventDefault();

        const handle = event.currentTarget;
        const canvas = getCanvas(handle);

        if (!canvas) return;

        const viewport = useFlowStore.getState().viewport;
        const rect = handle.getBoundingClientRect();

        const start = screenToFlowPosition(
            rect.left + rect.width / 2,
            rect.top + rect.height / 2,
            canvas,
            viewport,
        );

        handle.setPointerCapture(event.pointerId);

        startConnection({
            source: nodeId,
            sourceHandle: id,
            start,
            end: start,
        });
    };

    // MOVER CONEXIÓN

    const handlePointerMove = (
        event: PointerEvent<HTMLButtonElement>,
    ) => {
        const connection = useFlowStore.getState().connection;

        if (!connection) return;

        event.stopPropagation();

        const canvas = getCanvas(event.currentTarget);

        if (!canvas) return;

        const viewport = useFlowStore.getState().viewport;

        updateConnection(
            screenToFlowPosition(
                event.clientX,
                event.clientY,
                canvas,
                viewport,
            ),
        );
    };

    // FINALIZAR CONEXIÓN

    const handlePointerUp = (
        event: PointerEvent<HTMLButtonElement>,
    ) => {
        event.stopPropagation();

        const handle = event.currentTarget;
        const connection = useFlowStore.getState().connection;

        if (!connection) return;

        const canvas = getCanvas(handle);

        const clientX = event.clientX;
        const clientY = event.clientY;

        if (handle.hasPointerCapture(event.pointerId)) {
            handle.releasePointerCapture(event.pointerId);
        }

        if (!canvas) {
            endConnection();
            return;
        }

        const targetHandle = findTargetHandle(
            clientX,
            clientY,
            canvas,
        );

        if (!targetHandle) {
            endConnection();
            return;
        }

        const targetNodeId = targetHandle.dataset.nodeId;
        const targetHandleId = targetHandle.dataset.handleId;

        if (!targetNodeId || !targetHandleId) {
            endConnection();
            return;
        }

        if (targetNodeId === connection.source) {
            endConnection();
            return;
        }

        const sourceHandleId = connection.sourceHandle ?? 'output';

        addEdge({
            id: crypto.randomUUID(),

            source: connection.source,
            target: targetNodeId,

            sourceHandle: sourceHandleId,
            targetHandle: targetHandleId,

            type: 'bezier',

            label:
                sourceHandleId === 'output'
                    ? undefined
                    : EDGE_LABELS[sourceHandleId] ?? sourceHandleId,
        });

        endConnection();
    };

    // CANCELAR CONEXIÓN

    const handlePointerCancel = (
        event: PointerEvent<HTMLButtonElement>,
    ) => {
        event.stopPropagation();

        const handle = event.currentTarget;

        if (handle.hasPointerCapture(event.pointerId)) {
            handle.releasePointerCapture(event.pointerId);
        }

        endConnection();
    };

    return (
        <button
            type="button"
            className={`flow-handle flow-handle--${position}`}
            data-flow-handle={type}
            data-node-id={nodeId}
            data-handle-id={id}
            aria-label={`${type === 'source' ? 'Salida' : 'Entrada'
                } ${id}`}
            title={`${type === 'source' ? 'Salida' : 'Entrada'}: ${id}`}
            style={{
                ...style,
                backgroundColor: color,
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
        />
    );
}