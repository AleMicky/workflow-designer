import { BpmnElementRegistry } from '../registry/BpmnElementRegistry';
import { eventDefinitions } from './events';
import { gatewayDefinitions } from './gateways';
import { taskDefinitions } from './tasks';

export const standardBpmnElementDefinitions = [
    ...eventDefinitions,
    ...taskDefinitions,
    ...gatewayDefinitions,
] as const;

export function createStandardBpmnRegistry(): BpmnElementRegistry {
    return new BpmnElementRegistry(standardBpmnElementDefinitions);
}

export const bpmnElementRegistry = createStandardBpmnRegistry();

export { eventDefinitions } from './events';
export { gatewayDefinitions } from './gateways';
export { taskDefinitions } from './tasks';
