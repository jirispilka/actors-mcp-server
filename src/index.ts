#!/usr/bin/env node
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';

export const configSchema = z.object({
    notionApiKey: z
        .string()
        .describe(
            'Notion API key, obtained from https://www.notion.so/profile/integrations/',
        ),
});

export default function ({ config: _config }: { config: z.infer<typeof configSchema> }) {
    try {
        const server = new McpServer({
            name: 'Notion',
            version: '1.0.0',
        });

        // Tool: Echo Query
        server.tool(
            'echo_query',
            'A dummy tool that echoes back any query sent to it. Useful for testing.',
            {
                query: z
                    .string()
                    .describe(
                        'Any text query that will be echoed back.',
                    ),
            },
            async ({ query }) => {
                try {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Echo: ${query}`,
                            },
                        ],
                    };
                } catch (e: unknown) {
                    return {
                        content: [
                            {
                                type: 'text',
                                text: `Error: ${e instanceof Error ? e.message : 'Unknown error'}`,
                            },
                        ],
                    };
                }
            },
        );

        return server.server;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        throw e;
    }
}
