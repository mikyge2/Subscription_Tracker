// Import the WorkflowClient class from Upstash Workflow SDK
import { Client as WorkflowClient } from '@upstash/workflow';

// Import QStash token and URI from environment variables
import { QSTASH_TOKEN, QSTASH_URL } from "./env.js";

// Create a new instance of WorkflowClient with the QStash base URL and token for authentication
export const workflowClient = new WorkflowClient({
    baseUrl: QSTASH_URL, // The endpoint for QStash workflow API
    token: QSTASH_TOKEN, // Auth token to authorize requests
});

// Export the workflow client instance to be used when triggering workflows
export default workflowClient;
