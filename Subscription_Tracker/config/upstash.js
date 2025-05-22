import { Client as WorkflowClient} from '@upstash/workflow';

import { QSTASH_TOKEN, QSTASH_URI} from "./env.js";

export const workflowClient = new WorkflowClient( {
    baseUrl: QSTASH_URI,
    token: QSTASH_TOKEN,
});

export default workflowClient;