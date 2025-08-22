#!/usr/bin/env node
/*
 This file provides essential functions and tools for MCP servers, serving as a library.
 The ActorsMcpServer should be the only class exported from the package

 Also, it serves as the main entry point for smithery deployment.
*/
import { z } from 'zod';

import { ActorsMcpServer } from './mcp/server.js';
import type { Input, ToolCategory } from './types';
import { serverConfigSchemaSmithery as configSchema } from './types.js';
import { loadToolsFromInput } from './utils/tools-loader.js';

// Export the config schema for Smithery. The export must be named configSchema
export { configSchema };

export { ActorsMcpServer };


// eslint-disable-next-line
/**
 * Main entrypoint for Smithery deployment, do not change signature of this function. 
 * @param param0 
 * @returns 
 */
export default function ({ config: _config }: { config: z.infer<typeof configSchema> }) {
    try {
        const apifyToken = _config.apifyToken || process.env.APIFY_TOKEN || '';
        const enableAddingActors = _config.enableAddingActors ?? true;
        const actors = _config.actors || '';
        const actorList = actors ? actors.split(',').map((a: string) => a.trim()) : [];
        const toolCategoryKeys = _config.tools ? _config.tools.split(',').map((t: string) => t.trim()) : [];

        // Validate environment
        if (!apifyToken) {
            // eslint-disable-next-line no-console
            console.warn('APIFY_TOKEN is required but not set in the environment variables or config. Some tools may not work properly.');
        } else {
            process.env.APIFY_TOKEN = apifyToken; // Ensure token is set in the environment
        }

        const server = new ActorsMcpServer({ enableAddingActors, enableDefaultActors: false });

        const input: Input = {
            actors: actorList.length ? actorList : [],
            enableAddingActors,
            tools: toolCategoryKeys as ToolCategory[],
        };

        // NOTE: This is a workaround for Smithery's requirement of a synchronous function
        // We load tools asynchronously and attach the promise to the server
        // However, this approach is NOT 100% reliable - the external library may still
        // try to use the server before tools are fully loaded
        loadToolsFromInput(input, apifyToken, actorList.length === 0)
            .then((tools) => {
                server.upsertTools(tools);
                return true;
            })
            .catch((error) => {
                // eslint-disable-next-line no-console
                console.error('Failed to load tools:', error);
                return false;
            });
        return server.server;
    } catch (e) {
        // eslint-disable-next-line no-console
        console.error(e);
        throw e;
    }
}