import { useRef, useState } from 'react';
import type { CSSProperties, PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from 'react';

import { useFlowStore } from '../store/flow.store';
import { FlowNode } from '../components/nodes/FlowNode';
import { FlowEdge } from '../components/edges/FlowEdge';
import { ConnectionLine } from "../components/handles/ConnectionLine";
import type { FlowNodeTypes } from '../types/flow.types';



interface FlowCanvasProps {
    nodeTypes?: FlowNodeTypes;
}


export function FlowCanvas({ nodeTypes = {} }: FlowCanvasProps) {
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const viewport = useFlowStore((state) => state.viewport);
    const setViewport = useFlowStore((state) => state.setViewport);

    const selectNode = useFlowStore(
        (state) => state.selectNode,
    );

    const canvasRef = useRef<HTMLDivElement>(null);
    const [isPanning, setIsPanning] = useState(false);
    const panStartRef = useRef<{
        pointerX: number;
        pointerY: number;
        viewportX: number;
        viewportY: number;
    } | null>(null);

    const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {

        selectNode(null);

        // Solo arrastrar el lienzo con botón izquierdo o central
        if (event.button !== 0 && event.button !== 1) return;

        // Si se hace clic sobre un nodo, un handle o un botón, no iniciar pan
        const target = event.target as HTMLElement;
        if (target.closest('.flow-node, .flow-handle, button')) {
            return;
        }

        event.currentTarget.setPointerCapture(event.pointerId);
        setIsPanning(true);
        panStartRef.current = {
            pointerX: event.clientX,
            pointerY: event.clientY,
            viewportX: viewport.x,
            viewportY: viewport.y,
        };

    };

    const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (!panStartRef.current) return;

        const pan = panStartRef.current;
        const deltaX = event.clientX - pan.pointerX;
        const deltaY = event.clientY - pan.pointerY;

        setViewport({
            ...viewport,
            x: pan.viewportX + deltaX,
            y: pan.viewportY + deltaY,
        });
    };

    const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
            event.currentTarget.releasePointerCapture(event.pointerId);
        }
        panStartRef.current = null;
        setIsPanning(false);
    };

    const handleWheel = (event: ReactWheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        const canvas = canvasRef.current;
        if (!canvas) return;

        const bounds = canvas.getBoundingClientRect();
        const mouseX = event.clientX - bounds.left;
        const mouseY = event.clientY - bounds.top;

        const zoomFactor = event.deltaY < 0 ? 1.08 : 0.92;
        const nextZoom = Math.min(Math.max(viewport.zoom * zoomFactor, 0.25), 2.5);

        // Zoom enfocado hacia el cursor del ratón
        const nextX = mouseX - (mouseX - viewport.x) * (nextZoom / viewport.zoom);
        const nextY = mouseY - (mouseY - viewport.y) * (nextZoom / viewport.zoom);

        setViewport({
            x: Math.round(nextX),
            y: Math.round(nextY),
            zoom: Number(nextZoom.toFixed(3)),
        });
    };

    const transformStyle: CSSProperties = {
        position: 'absolute',
        inset: 0,
        transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        transformOrigin: '0 0',
    };

    // Sincronizar el fondo de puntos con el viewport y el nivel de zoom
    const canvasStyle: CSSProperties = {
        backgroundPosition: `${viewport.x}px ${viewport.y}px`,
        backgroundSize: `${20 * viewport.zoom}px ${20 * viewport.zoom}px`,
        cursor: isPanning ? 'grabbing' : 'default',
    };

    const handleZoomIn = () => {
        const nextZoom = Math.min(viewport.zoom * 1.2, 2.5);
        setViewport({ ...viewport, zoom: Number(nextZoom.toFixed(2)) });
    };

    const handleZoomOut = () => {
        const nextZoom = Math.max(viewport.zoom / 1.2, 0.25);
        setViewport({ ...viewport, zoom: Number(nextZoom.toFixed(2)) });
    };

    const handleResetView = () => {
        setViewport({ x: 0, y: 0, zoom: 1 });
    };

    return (
        <div
            ref={canvasRef}
            className="flow-canvas"
            style={canvasStyle}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onWheel={handleWheel}
        >
            <div className="flow-viewport" style={transformStyle}>
                <svg
                    className="flow-edges"
                    style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        overflow: 'visible',
                        pointerEvents: 'none',
                    }}
                >
                    <defs>
                        <marker
                            id="flow-arrow"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path
                                d="M0,0 L0,6 L9,3 z"
                                fill="#64748b"
                            />
                        </marker>
                        <marker
                            id="flow-arrow-connecting"
                            markerWidth="10"
                            markerHeight="10"
                            refX="9"
                            refY="3"
                            orient="auto"
                            markerUnits="strokeWidth"
                        >
                            <path
                                d="M0,0 L0,6 L9,3 z"
                                fill="#2563eb"
                            />
                        </marker>
                    </defs>

                    {edges.map((edge) => (
                        <FlowEdge
                            key={edge.id}
                            edge={edge}
                        />
                    ))}

                    <ConnectionLine />
                </svg>

                {nodes.map((node) => (
                    <FlowNode
                        key={node.id}
                        node={node}
                        nodeTypes={nodeTypes}
                    />
                ))}
            </div>

            {/* Controles de navegación y zoom */}
            <div className="flow-controls">
                <button
                    type="button"
                    className="flow-control-btn"
                    onClick={handleZoomIn}
                    title="Acercar (Zoom In)"
                    aria-label="Acercar"
                >
                    +
                </button>
                <button
                    type="button"
                    className="flow-control-btn"
                    onClick={handleZoomOut}
                    title="Alejar (Zoom Out)"
                    aria-label="Alejar"
                >
                    −
                </button>
                <button
                    type="button"
                    className="flow-control-btn"
                    onClick={handleResetView}
                    title="Restablecer vista (100%)"
                    aria-label="Restablecer vista"
                >
                    {Math.round(viewport.zoom * 100)}%
                </button>
            </div>
        </div>
    );
}