import { useFlowStore } from '../store/flow.store';

/**
 * Hook de conveniencia para interactuar con el estado del lienzo de flujo.
 */
export function useFlow() {
    const nodes = useFlowStore((state) => state.nodes);
    const edges = useFlowStore((state) => state.edges);
    const viewport = useFlowStore((state) => state.viewport);
    const connection = useFlowStore((state) => state.connection);

    const addNode = useFlowStore((state) => state.addNode);
    const addEdge = useFlowStore((state) => state.addEdge);
    const updateNodePosition = useFlowStore((state) => state.updateNodePosition);
    const removeNode = useFlowStore((state) => state.removeNode);
    const removeEdge = useFlowStore((state) => state.removeEdge);
    const setViewport = useFlowStore((state) => state.setViewport);
    const replaceFlow = useFlowStore((state) => state.replaceFlow);

    return {
        nodes,
        edges,
        viewport,
        connection,
        addNode,
        addEdge,
        updateNodePosition,
        removeNode,
        removeEdge,
        setViewport,
        replaceFlow,
    };
}
