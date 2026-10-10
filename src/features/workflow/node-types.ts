import type {
    FlowNodeTypes,
} from '../../lib/flow/types/flow.types';

import { StartNode } from './nodes/StartNode';
import { TaskNode } from './nodes/TaskNode';
import { ApprovalNode } from './nodes/ApprovalNode';
import { ConditionNode } from './nodes/ConditionNode';
import { EndNode } from './nodes/EndNode';

export const workflowNodeTypes = {
    start: StartNode,
    task: TaskNode,
    approval: ApprovalNode,
    condition: ConditionNode,
    end: EndNode,
} satisfies FlowNodeTypes;