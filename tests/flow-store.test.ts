import { describe, expect, test } from 'bun:test';

import { useFlowStore } from '../src/lib/flow';

describe('flow store document editing', () => {
    test('selects and updates sequence flows without selecting a node', () => {
        const store = useFlowStore.getState();

        store.replaceFlow({
            process: {
                id: 'process',
                name: 'Process',
                targetNamespace: 'urn:test',
                executable: true,
            },
            nodes: [
                {
                    id: 'start',
                    type: 'startEvent',
                    position: { x: 0, y: 0 },
                    data: { label: 'Start' },
                },
                {
                    id: 'end',
                    type: 'endEvent',
                    position: { x: 200, y: 0 },
                    data: { label: 'End' },
                },
            ],
            edges: [
                {
                    id: 'flow',
                    source: 'start',
                    target: 'end',
                },
            ],
            viewport: { x: 0, y: 0, zoom: 1 },
        });

        useFlowStore.getState().selectEdge('flow');
        useFlowStore.getState().updateEdgeData('flow', {
            name: 'Complete',
            conditionExpression: '${ready}',
            isDefault: true,
        });

        let state = useFlowStore.getState();
        expect(state.selectedEdgeId).toBe('flow');
        expect(state.selectedNodeId).toBeNull();
        expect(state.edges[0]?.label).toBe('Complete');
        expect(state.edges[0]?.data).toEqual({
            name: 'Complete',
            conditionExpression: '${ready}',
            isDefault: true,
        });
        expect(state.isDirty).toBe(true);

        state.markSaved();
        expect(useFlowStore.getState().isDirty).toBe(false);

        state.selectNode('start');
        state = useFlowStore.getState();
        expect(state.selectedNodeId).toBe('start');
        expect(state.selectedEdgeId).toBeNull();
    });
});
