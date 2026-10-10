import type { BpmnPropertyDefinition } from '../types/bpmn-element.types';

export const commonBpmnProperties = [
    {
        key: 'label',
        label: 'Nombre',
        control: 'text',
        required: true,
        placeholder: 'Nombre del elemento',
    },
    {
        key: 'documentation',
        label: 'Documentación',
        control: 'textarea',
        placeholder: 'Describe el propósito de este elemento',
    },
] as const satisfies readonly BpmnPropertyDefinition[];
