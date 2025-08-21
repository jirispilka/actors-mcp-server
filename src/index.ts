#!/usr/bin/env node
import { z } from 'zod';
import { ActorsMcpServer } from './mcp/server.js';
import type {Input, ToolCategory} from "./types";
import {loadToolsFromInput} from "./utils/tools-loader";

export const configSchema = z.object({
    apifyToken: z
        .string()
        .describe(
            'Apify token, learn more: https://docs.apify.com/platform/integrations/api#api-token',
        ),
    actors: z
        .string()
        .optional()
        .describe('Comma-separated list of Actor full names to add to the server'),
    enableAddingActors: z
        .boolean()
        .default(true)
        .describe('Enable dynamically adding Actors as tools based on user requests'),
    tools: z
        .string()
        .optional()
        .describe('Comma-separated list of specific tool categories to enable (docs,runs,storage,preview)'),
});

export default function ({ config: _config }: { config: z.infer<typeof configSchema> }) {
    try {
        // const server = new McpServer({
        //     name: 'Notion',
        //     version: '1.0.0',
        // });

        const apifyToken = _config.apifyToken || process.env.APIFY_TOKEN || '';
        const enableAddingActors = _config.enableAddingActors ?? true;
        const actors = _config.actors || '';
        const actorList = actors ? actors.split(',').map((a: string) => a.trim()) : [];
        const toolCategoryKeys = _config.tools ? _config.tools.split(',').map((t: string) => t.trim()) : [];

        const server = new ActorsMcpServer({ enableAddingActors, enableDefaultActors: false });

        const input: Input = {
            actors: actorList.length ? actorList : [],
            enableAddingActors,
            tools: toolCategoryKeys as ToolCategory[],
        };

        // Load tools asynchronously but don't wait
        loadToolsFromInput(input, apifyToken, actorList.length === 0)
            .then((tools) => {
                server.upsertTools(tools);
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Failed to load tools:', error);
            });

        return server.server;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        throw e;
    }
}
