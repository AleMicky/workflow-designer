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
    FlowProcessMetadata,
    FlowStateSnapshot,
} from '../types/flow.types';

interface FlowState {
    process: FlowProcessMetadata;
    nodes: FlowNode[];
    edges: FlowEdge[];
    viewport: FlowViewport;
    isDirty: boolean;

    addNode: (node: FlowNode) => void;
    addEdge: (edge: FlowEdge) => void;
    updateProcess: (changes: Partial<FlowProcessMetadata>) => void;
    updateEdgeData: (
        id: string,
        data: Partial<Record<string, unknown>>,
    ) => void;

    updateNodePosition: (
        id: string,
        position: FlowPosition,
    ) => void;

    removeNode: (id: string) => void;
    removeEdge: (id: string) => void;

    setViewport: (viewport: FlowViewport) => void;
    replaceFlow: (snapshot: FlowStateSnapshot) => void;
    markSaved: () => void;

    connection: FlowConnection | null;

    startConnection: (connection: FlowConnection) => void;
    updateConnection: (position: FlowPosition) => void;
    endConnection: () => void;

    selectedNodeId: string | null;
    selectNode: (id: string | null) => void;
    selectedEdgeId: string | null;
    selectEdge: (id: string | null) => void;

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
    process: {
        id: 'process-1',
        name: 'Proceso sin título',
        targetNamespace: 'urn:miky-flow:process',
        version: '1.0',
        executable: true,
    },
    nodes: [],
    edges: [],

    viewport: {
        x: 0,
        y: 0,
        zoom: 1,
    },
    isDirty: false,

    // NODOS

    addNode: (node) =>
        set((state) => ({
            nodes: [...state.nodes, node],
            isDirty: true,
        })),

    updateProcess: (changes) =>
        set((state) => ({
            process: {
                ...state.process,
                ...changes,
            },
            isDirty: true,
        })),

    updateNodePosition: (id, position) =>
        set((state) => ({
            nodes: state.nodes.map((node) =>
                node.id === id
                    ? { ...node, position }
                    : node,
            ),
            isDirty: true,
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

                selectedEdgeId: state.edges.some(
                    (edge) =>
                        edge.id === state.selectedEdgeId
                        && (edge.source === id || edge.target === id),
                )
                    ? null
                    : state.selectedEdgeId,
                isDirty: true,
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
                isDirty: true,
            };
        }),

    removeEdge: (id) =>
        set((state) => ({
            edges: state.edges.filter(
                (edge) => edge.id !== id,
            ),
            selectedEdgeId:
                state.selectedEdgeId === id
                    ? null
                    : state.selectedEdgeId,
            isDirty: true,
        })),

    updateEdgeData: (id, changes) =>
        set((state) => ({
            edges: state.edges.map((edge) => {
                if (edge.id !== id) return edge;

                const data = {
                    ...edge.data,
                    ...changes,
                };
                const name = data.name;

                return {
                    ...edge,
                    data,
                    label:
                        typeof name === 'string' && name.trim()
                            ? name
                            : undefined,
                };
            }),
            isDirty: true,
        })),

    // VIEWPORT

    setViewport: (viewport) =>
        set({ viewport, isDirty: true }),

    replaceFlow: ({ process, nodes, edges, viewport }) =>
        set((state) => {
            const nodeIds = new Set(nodes.map((node) => node.id));
            const handles = Object.fromEntries(
                Object.entries(state.handles).filter(([, handle]) =>
                    nodeIds.has(handle.nodeId),
                ),
            );

            return {
                process: { ...process },
                nodes: [...nodes],
                edges: [...edges],
                viewport: { ...viewport },
                connection: null,
                selectedNodeId: null,
                selectedEdgeId: null,
                handles,
                isDirty: true,
            };
        }),

    markSaved: () =>
        set({ isDirty: false }),

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
    selectedEdgeId: null,

    selectNode: (id) =>
        set({
            selectedNodeId: id,
            selectedEdgeId: null,
        }),

    selectEdge: (id) =>
        set({
            selectedEdgeId: id,
            selectedNodeId: null,
        }),

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
            isDirty: true,
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
