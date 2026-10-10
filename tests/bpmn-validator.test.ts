import { describe, expect, test } from 'bun:test';

import {
    bpmnElementRegistry,
    createBpmnDocumentFromFlow,
    createStandardBpmnValidator,
} from '../src/lib/flow';

const validator = createStandardBpmnValidator(bpmnElementRegistry);

describe('BPMN validator', () => {
    test('accepts a connected start, task and end process', () => {
        const document = createBpmnDocumentFromFlow({
            process: { id: 'process', name: 'Valid process' },
            nodes: [
                bpmnElementRegistry.createNode('startEvent', {
                    id: 'start',
                    position: { x: 0, y: 0 },
                }),
                bpmnElementRegistry.createNode('userTask', {
                    id: 'task',
                    position: { x: 220, y: 0 },
                }),
                bpmnElementRegistry.createNode('endEvent', {
                    id: 'end',
                    position: { x: 440, y: 0 },
                }),
            ],
            edges: [
                {
                    id: 'flow-1',
                    source: 'start',
                    target: 'task',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                },
                {
                    id: 'flow-2',
                    source: 'task',
                    target: 'end',
                    sourceHandle: 'output',
                    targetHandle: 'input',
                },
            ],
            viewport: { x: 0, y: 0, zoom: 1 },
        });

        const report = validator.validate(document);

        expect(report.valid).toBe(true);
        expect(report.issues).toHaveLength(0);
    });

    test('reports missing starts, unknown handles and dangling references', () => {
        const document = createBpmnDocumentFromFlow({
            process: { id: 'invalid', name: 'Invalid process' },
            nodes: [
                bpmnElementRegistry.createNode('userTask', {
                    id: 'task',
                    position: { x: 0, y: 0 },
                }),
            ],
            edges: [
                {
                    id: 'broken-flow',
                    source: 'task',
                    target: 'missing',
                    sourceHandle: 'unknown-output',
                    targetHandle: 'input',
                },
            ],
            viewport: { x: 0, y: 0, zoom: 1 },
        });

        const codes = validator.validate(document).issues.map(
            (item) => item.code,
        );

        expect(codes).toContain('START_EVENT_REQUIRED');
        expect(codes).toContain('TARGET_ELEMENT_NOT_FOUND');
        expect(codes).toContain('SOURCE_HANDLE_NOT_FOUND');
    });

    test('requires conditions on non-default exclusive gateway paths', () => {
        const document = createBpmnDocumentFromFlow({
            process: { id: 'gateway', name: 'Gateway process' },
            nodes: [
                bpmnElementRegistry.createNode('startEvent', {
                    id: 'start',
                    position: { x: 0, y: 0 },
                }),
                bpmnElementRegistry.createNode('exclusiveGateway', {
                    id: 'gateway',
                    position: { x: 220, y: 0 },
                }),
                bpmnElementRegistry.createNode('endEvent', {
                    id: 'end-a',
                    position: { x: 440, y: -80 },
                }),
                bpmnElementRegistry.createNode('endEvent', {
                    id: 'end-b',
                    position: { x: 440, y: 80 },
                }),
            ],
            edges: [
                { id: 'in', source: 'start', target: 'gateway' },
                { id: 'path-a', source: 'gateway', target: 'end-a' },
                { id: 'path-b', source: 'gateway', target: 'end-b' },
            ],
            viewport: { x: 0, y: 0, zoom: 1 },
        });

        const report = validator.validate(document);

        expect(report.valid).toBe(false);
        expect(report.errors.filter(
            (item) => item.code === 'GATEWAY_FLOW_CONDITION_REQUIRED',
        )).toHaveLength(2);
    });
});
