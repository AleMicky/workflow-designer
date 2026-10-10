import type { BpmnElementDefinition } from '../types/bpmn-element.types';
import { commonBpmnProperties } from './common';

export const eventDefinitions = [
    {
        type: 'startEvent',
        bpmnType: 'bpmn:startEvent',
        category: 'events',
        label: 'Evento de inicio',
        description: 'Inicia una nueva instancia del proceso.',
        icon: '○',
        color: '#10b981',
        handles: [
            { id: 'output', type: 'source', position: 'right' },
        ],
        properties: commonBpmnProperties,
        defaultData: { label: 'Evento de inicio' },
    },
    {
        type: 'intermediateCatchEvent',
        bpmnType: 'bpmn:intermediateCatchEvent',
        category: 'events',
        label: 'Evento intermedio',
        description: 'Espera a que ocurra un evento durante el proceso.',
        icon: '◎',
        color: '#0ea5e9',
        handles: [
            { id: 'input', type: 'target', position: 'left' },
            { id: 'output', type: 'source', position: 'right' },
        ],
        properties: commonBpmnProperties,
        defaultData: { label: 'Evento intermedio' },
    },
    {
        type: 'endEvent',
        bpmnType: 'bpmn:endEvent',
        category: 'events',
        label: 'Evento de fin',
        description: 'Finaliza una ruta del proceso.',
        icon: '●',
        color: '#ef4444',
        handles: [
            { id: 'input', type: 'target', position: 'left' },
        ],
        properties: commonBpmnProperties,
        defaultData: { label: 'Evento de fin' },
    },
] as const satisfies readonly BpmnElementDefinition[];
