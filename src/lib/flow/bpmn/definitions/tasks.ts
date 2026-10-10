import type { BpmnElementDefinition } from '../types/bpmn-element.types';
import { commonBpmnProperties } from './common';

const taskHandles = [
    { id: 'input', type: 'target', position: 'left' },
    { id: 'output', type: 'source', position: 'right' },
] as const;

export const taskDefinitions = [
    {
        type: 'userTask',
        bpmnType: 'bpmn:userTask',
        category: 'activities',
        label: 'Tarea de usuario',
        description: 'Actividad realizada por una persona.',
        icon: '▤',
        color: '#3b82f6',
        handles: taskHandles,
        properties: [
            ...commonBpmnProperties,
            {
                key: 'assignee',
                label: 'Responsable',
                control: 'text',
                placeholder: 'Usuario o expresión',
            },
            {
                key: 'candidateUsers',
                label: 'Usuarios candidatos',
                control: 'text',
                placeholder: 'usuario1, usuario2',
            },
            {
                key: 'candidateGroups',
                label: 'Grupos candidatos',
                control: 'text',
                placeholder: 'grupo1, grupo2',
            },
        ],
        defaultData: { label: 'Tarea de usuario' },
    },
    {
        type: 'serviceTask',
        bpmnType: 'bpmn:serviceTask',
        category: 'activities',
        label: 'Tarea de servicio',
        description: 'Ejecuta automáticamente una integración o servicio.',
        icon: '⚙',
        color: '#6366f1',
        handles: taskHandles,
        properties: [
            ...commonBpmnProperties,
            {
                key: 'implementation',
                label: 'Implementación',
                control: 'text',
                placeholder: 'Clase, delegado o expresión',
            },
        ],
        defaultData: { label: 'Tarea de servicio' },
    },
    {
        type: 'scriptTask',
        bpmnType: 'bpmn:scriptTask',
        category: 'activities',
        label: 'Tarea de script',
        description: 'Ejecuta un script dentro del motor de procesos.',
        icon: '</>',
        color: '#8b5cf6',
        handles: taskHandles,
        properties: [
            ...commonBpmnProperties,
            {
                key: 'scriptFormat',
                label: 'Formato del script',
                control: 'text',
                placeholder: 'groovy, javascript…',
            },
            {
                key: 'script',
                label: 'Script',
                control: 'textarea',
            },
        ],
        defaultData: { label: 'Tarea de script' },
    },
] as const satisfies readonly BpmnElementDefinition[];
