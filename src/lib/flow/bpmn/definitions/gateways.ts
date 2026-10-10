import type { BpmnElementDefinition } from '../types/bpmn-element.types';
import { commonBpmnProperties } from './common';

const gatewayHandles = [
    { id: 'input', type: 'target', position: 'left' },
    { id: 'output', type: 'source', position: 'right' },
] as const;

export const gatewayDefinitions = [
    {
        type: 'exclusiveGateway',
        bpmnType: 'bpmn:exclusiveGateway',
        category: 'gateways',
        label: 'Compuerta exclusiva',
        description: 'Continúa por una única ruta según sus condiciones.',
        icon: '×',
        color: '#f59e0b',
        handles: gatewayHandles,
        properties: commonBpmnProperties,
        defaultData: { label: 'Compuerta exclusiva' },
    },
    {
        type: 'parallelGateway',
        bpmnType: 'bpmn:parallelGateway',
        category: 'gateways',
        label: 'Compuerta paralela',
        description: 'Divide o sincroniza rutas que se ejecutan en paralelo.',
        icon: '+',
        color: '#f97316',
        handles: gatewayHandles,
        properties: commonBpmnProperties,
        defaultData: { label: 'Compuerta paralela' },
    },
    {
        type: 'inclusiveGateway',
        bpmnType: 'bpmn:inclusiveGateway',
        category: 'gateways',
        label: 'Compuerta inclusiva',
        description: 'Continúa por una o varias rutas cuyas condiciones se cumplan.',
        icon: '○',
        color: '#eab308',
        handles: gatewayHandles,
        properties: commonBpmnProperties,
        defaultData: { label: 'Compuerta inclusiva' },
    },
] as const satisfies readonly BpmnElementDefinition[];
