import { create } from 'zustand';

import type {
    FlowNode,
    FlowEdge,
    FlowPosition,
    FlowViewport,
    FlowConnection,
    FlowNodeData,
    FlowHandleDefinition,
    FlowHandleType,
} from '../types/flow.types';

interface FlowState {
    nodes: FlowNode[];
    edges: FlowEdge[];
    viewport: FlowViewport;

    addNode: (node: FlowNode) => void;
    addEdge: (edge: FlowEdge) => void;

    updateNodePosition: (
        id: string,
        position: FlowPosition,
    ) => void;

    removeNode: (id: string) => void;
    removeEdge: (id: string) => void;

    setViewport: (viewport: FlowViewport) => void;

    connection: FlowConnection | null;

    startConnection: (connection: FlowConnection) => void;
    updateConnection: (position: FlowPosition) => void;
    endConnection: () => void;

    selectedNodeId: string | null;
    selectNode: (id: string | null) => void;

    updateNodeData: (
        id: string,
        data: Partial<FlowNodeData>,
    ) => void;

    handles: Record<string, FlowHandleDefinition>;

    registerHandle: (handle: FlowHandleDefinition) => void;

    unregisterHandle: (
        nodeId: string,
        type: FlowHandleType,
        handleId: string,
    ) => void;
}

const getHandleKey = (
    nodeId: string,
    type: FlowHandleType,
    handleId: string,
): string => `${nodeId}:${type}:${handleId}`;

export const useFlowStore = create<FlowState>((set) => ({
    nodes: [],
    edges: [],

    viewport: {
        x: 0,
        y: 0,
        zoom: 1,
    },

    // NODOS

    addNode: (node) =>
        set((state) => ({
            nodes: [...state.nodes, node],
        })),

    updateNodePosition: (id, position) =>
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id
                    ? { ...node, position }
                    : node,
            ),
        })),

    removeNode: (id) =>
        set((state) => {
            const handles = { ...state.handles };

            for (const [key, handle] of Object.entries(handles)) {
                if (handle.nodeId === id) {
                    delete handles[key];
                }
            }

            return {
                nodes: state.nodes.filter((node) => node.id !== id),

                edges: state.edges.filter(
                    (edge) =>
                        edge.source !== id &&
                        edge.target !== id,
                ),

                handles,

                selectedNodeId:
                    state.selectedNodeId === id
                        ? null
                        : state.selectedNodeId,
            };
        }),

    // CONEXIONES

    addEdge: (edge) =>
        set((state) => {
            if (edge.source === edge.target) {
                return state;
            }

            const sourceExists = state.nodes.some(
                (node) => node.id === edge.source,
            );

            const targetExists = state.nodes.some(
                (node) => node.id === edge.target,
            );

            if (!sourceExists || !targetExists) {
                return state;
            }

            const sourceHandle = edge.sourceHandle ?? 'output';
            const targetHandle = edge.targetHandle ?? 'input';

            const exists = state.edges.some(
                (item) =>
                    item.source === edge.source &&
                    item.target === edge.target &&
                    (item.sourceHandle ?? 'output') === sourceHandle &&
                    (item.targetHandle ?? 'input') === targetHandle,
            );

            if (exists) {
                return state;
            }

            return {
                edges: [...state.edges, edge],
            };
        }),

    removeEdge: (id) =>
        set((state) => ({
            edges: state.edges.filter(
                (edge) => edge.id !== id,
            ),
        })),

    // VIEWPORT

    setViewport: (viewport) =>
        set({ viewport }),

    // CONEXIÓN TEMPORAL

    connection: null,

    startConnection: (connection) =>
        set({ connection }),

    updateConnection: (position) =>
        set((state) => ({
            connection: state.connection
                ? {
                    ...state.connection,
                    end: position,
                }
                : null,
        })),

    endConnection: () =>
        set({ connection: null }),

    // SELECCIÓN

    selectedNodeId: null,

    selectNode: (id) =>
        set({ selectedNodeId: id }),

    // PROPIEDADES

    updateNodeData: (id, data) =>
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id
                    ? {
                        ...node,
                        data: {
                            ...node.data,
                            ...data,
                        },
                    }
                    : node,
            ),
        })),

    // HANDLES

    handles: {},

    registerHandle: (handle) =>
        set((state) => ({
            handles: {
                ...state.handles,

                [getHandleKey(
                    handle.nodeId,
                    handle.type,
                    handle.id,
                )]: handle,
            },
        })),

    unregisterHandle: (nodeId, type, handleId) =>
        set((state) => {
            const key = getHandleKey(
                nodeId,
                type,
                handleId,
            );

            if (!(key in state.handles)) {
                return state;
            }

            const handles = { ...state.handles };

            delete handles[key];

            return { handles };
        }),
}));