import { useFlowStore } from '../store/flow.store';

/**
 * Hook de conveniencia para interactuar con el estado del lienzo de flujo.
 */
export function useFlow() {
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const process = useFlowStore((state) => state.process);
    const viewport = useFlowStore((state) => state.viewport);
    const isDirty = useFlowStore((state) => state.isDirty);
    const connection = useFlowStore((state) => state.connection);

    const addNode = useFlowStore((state) => state.addNode);
    const addEdge = useFlowStore((state) => state.addEdge);
    const updateProcess = useFlowStore((state) => state.updateProcess);
    const updateEdgeData = useFlowStore((state) => state.updateEdgeData);
    const updateNodePosition = useFlowStore((state) => state.updateNodePosition);
    const removeNode = useFlowStore((state) => state.removeNode);
    const removeEdge = useFlowStore((state) => state.removeEdge);
    const setViewport = useFlowStore((state) => state.setViewport);
    const replaceFlow = useFlowStore((state) => state.replaceFlow);
    const markSaved = useFlowStore((state) => state.markSaved);

    return {
        nodes,
        edges,
        process,
        viewport,
        isDirty,
        connection,
        addNode,
        addEdge,
        updateProcess,
        updateEdgeData,
        updateNodePosition,
        removeNode,
        removeEdge,
        setViewport,
        replaceFlow,
        markSaved,
    };
}
