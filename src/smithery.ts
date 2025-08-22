#!/usr/bin/env node
/*
 This file provides essential functions and tools for MCP servers, serving as a library.
 The ActorsMcpServer should be the only class exported from the package

 Also, it serves as the main entry point for smithery deployment.
*/
import type { z } from 'zod';

import { ActorsMcpServer } from './mcp/server.js';
import type { Input, ToolCategory } from './types';
import { serverConfigSchemaSmithery as configSchema } from './types.js';
import { loadToolsFromInput } from './utils/tools-loader.js';

// Export the config schema for Smithery. The export must be named configSchema
export { configSchema };

/**
 * Main entrypoint for Smithery deployment, do not change signature of this function.
 * @param param-1
 * @returns
 */
export default function ({ config: _config }: { config: z.infer<typeof configSchema> }) {
    try {
        let apifyToken = _config.apifyToken || process.env.APIFY_TOKEN || '';
        const enableAddingActors = _config.enableAddingActors ?? true;
        const actors = _config.actors || '';
        const actorList = actors ? actors.split(',').map((a: string) => a.trim()) : [];
        const toolCategoryKeys = _config.tools ? _config.tools.split(',').map((t: string) => t.trim()) : [];

        console.log(`Apify token ${apifyToken}`)
        process.env.APIFY_TOKEN = apifyToken; // Ensure token is set in the environment
        const server = new ActorsMcpServer({ enableAddingActors, enableDefaultActors: false });

        const input: Input = {
            actors: actorList.length ? actorList : [],
            enableAddingActors,
            tools: toolCategoryKeys as ToolCategory[],
        };

        // Start async tools loading and gate the first listTools (Smithery-only)
        // See docs/smithery.md for a brief overview of how this entrypoint works with Smithery
        const loadPromise = (async () => {
            try {
                const tools = await loadToolsFromInput(input, apifyToken, actorList.length === 0);
                server.upsertTools(tools);
            } catch (error) {
                // eslint-disable-next-line no-console
                console.error('Failed to load tools with provided token. Retrying with placeholder token, error', error);
                try {
                    const tools = await loadToolsFromInput(input, 'your-apify-token', actorList.length === 0);
                    server.upsertTools(tools);
                } catch (retryError) {
                    // eslint-disable-next-line no-console
                    console.error('Retry failed to load tools with placeholder token, error:', retryError);
                }
            }
        })();
        server.blockListToolsUntil(loadPromise);
        return server.server;

    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        throw e;
    }
}
