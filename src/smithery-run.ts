/**
 * Smithery MCP Server Entry Point
 * This file provides the named export that Smithery expects for MCP servers.
 */

import { ActorsMcpServer } from './mcp/server.js';
import type { Input, ServerConfig, ToolCategory } from './types.js';
import { loadToolsFromInput } from './utils/tools-loader.js';

export function createServer({ config }: { config: ServerConfig }) {
    // Create the underlying ActorsMcpServer instance
    const actorsServer = new ActorsMcpServer({
        enableAddingActors: config.enableAddingActors,
        enableDefaultActors: false,
    });

    // Extract configuration
    // const { apifyToken } = config;
    const actors = config.actors || '';
    const tools = config.tools || '';

    // if (!apifyToken) {
    //     throw new Error('APIFY_TOKEN is required in the configuration');
    // }
    const apifyToken = 'your-apify-token'; // Replace with your actual Apify token or fetch it from environment variables

    // Parse actors list
    const actorList = actors ? (actors as string).split(',').map((a: string) => a.trim()) : [];

    // Parse tool categories
    const toolCategoryKeys = tools ? (tools as string).split(',').map((t: string) => t.trim()) : [];

    // Create Input object from config
    const input: Input = {
        actors: actorList,
        enableAddingActors: config.enableAddingActors,
        tools: toolCategoryKeys as ToolCategory[],
    };

    // Load tools based on input configuration
    loadToolsFromInput(input, apifyToken, actorList.length === 0)
        .then((serverTools) => { actorsServer.upsertTools(serverTools); })
        // eslint-disable-next-line no-console
        .catch((error) => { console.error('Failed to load tools:', error); });

    // Return the server interface that Smithery expects
    return actorsServer.server;
}

// Default export that Smithery expects
// eslint-disable-next-line import/no-default-export
export default function ({ sessionId: _sessionId, config }: { sessionId: string; config: ServerConfig }) {
    return createServer({ config });
}
