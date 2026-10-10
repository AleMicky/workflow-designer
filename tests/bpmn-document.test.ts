import { describe, expect, test } from 'bun:test';

import {
    bpmnElementRegistry,
    createBpmnDocumentFromFlow,
    createFlowSnapshotFromBpmnDocument,
    parseBpmnDocument,
    serializeBpmnDocument,
} from '../src/lib/flow';

describe('BPMN JSON document', () => {
    test('round-trips the semantic model, diagram and editor state', () => {
        const start = bpmnElementRegistry.createNode('startEvent', {
            id: 'start',
            position: { x: 100, y: 120 },
        });
        const task = bpmnElementRegistry.createNode('userTask', {
            id: 'task',
            position: { x: 360, y: 120 },
            data: { assignee: '${requester}' },
        });
        const document = createBpmnDocumentFromFlow({
            process: {
                id: 'purchase-process',
                name: 'Purchase process',
            },
            nodes: [start, task],
            edges: [
                {
                    id: 'flow-1',
                    source: 'start',
                    target: 'task',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                },
            ],
            viewport: { x: 15, y: -20, zoom: 1.25 },
        });

        const restoredDocument = parseBpmnDocument(
            serializeBpmnDocument(document),
        );
        const flow = createFlowSnapshotFromBpmnDocument(restoredDocument);

        expect(restoredDocument).toEqual(document);
        expect(flow.nodes).toHaveLength(2);
        expect(flow.nodes[1]?.position).toEqual({ x: 360, y: 120 });
        expect(flow.nodes[1]?.data.assignee).toBe('${requester}');
        expect(flow.viewport).toEqual({ x: 15, y: -20, zoom: 1.25 });
    });

    test('rejects unsupported schema versions', () => {
        expect(() => parseBpmnDocument(JSON.stringify({
            schemaVersion: 99,
        }))).toThrow('Unsupported BPMN document version');
    });
});
