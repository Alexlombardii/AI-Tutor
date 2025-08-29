import { RealtimeItem, tool } from '@openai/agents/realtime';
import { callSupervisor } from '../api/tutorSupervisor';


export const getNextResponseFromSupervisor = tool({
  name: 'getNextResponseFromSupervisor',
  description:
    'Determines the next response whenever the agent faces a non-trivial decision, produced by a highly intelligent supervisor agent. Returns a message describing what to do next.',
  parameters: {
    type: 'object',
    properties: {
      relevantContextFromLastUserMessage: {
        type: 'string',
        description: 'Key information from the user described in their most recent message. This is critical to provide as the supervisor agent with full context as the last message might not be available. Okay to omit if the user message didn\'t add any new information.',
      },
    },
    required: ['relevantContextFromLastUserMessage'],
    additionalProperties: false,
  },
  execute: async (input, details) => {
    const relevantContextFromLastUserMessage = (input as any).relevantContextFromLastUserMessage;
    const history: RealtimeItem[] = (details?.context as any)?.history ?? [];

    const addBreadcrumb = (details?.context as any)?.addTranscriptBreadcrumb as
      | ((title: string, data?: any) => void)
      | undefined;

    const filteredLogs = history.filter((log) => log.type === 'message');

    const response = await callSupervisor(relevantContextFromLastUserMessage, filteredLogs);

    // Process breadcrumbs from backend
    if (response.breadcrumbs && addBreadcrumb) {
      response.breadcrumbs.forEach((breadcrumb: any) => {
        addBreadcrumb(breadcrumb.title, breadcrumb.data);
      });
    }

    return { nextResponse: response.output_text };
  },
});
  