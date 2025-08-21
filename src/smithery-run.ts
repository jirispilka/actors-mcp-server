/**
 * Smithery MCP Server Entry Point
 * This file provides the default export that Smithery expects for MCP servers.
 */

import { ActorsMcpServer } from './mcp/server.js';
// import type { Input, ToolCategory } from './types.js';
// import { loadToolsFromInput } from './utils/tools-loader.js';

export default function createStatelessServer({ config }: { config: any }) {

    // Create the underlying ActorsMcpServer instance
    const server = new ActorsMcpServer({
        enableAddingActors: config.enableAddingActors !== false,
        enableDefaultActors: false,
    });

    // Extract configuration
    // const { apifyToken } = config;
    // const actors = config.actors || '';
    // const tools = config.tools || '';

    // // Parse actors list
    // const actorList = actors ? actors.split(',').map((a: string) => a.trim()) : [];
    //
    // // Parse tool categories
    // const toolCategoryKeys = tools ? tools.split(',').map((t: string) => t.trim()) : [];
    //
    // // Create Input object from config
    // const input: Input = {
    //     actors: actorList,
    //     enableAddingActors: config.enableAddingActors !== false,
    //     tools: toolCategoryKeys as ToolCategory[],
    // };
    //
    // // Load tools based on input configuration
    // loadToolsFromInput(input, apifyToken, actorList.length === 0)
    //     .then(serverTools => {
    //         server.upsertTools(serverTools);
    //     })
    //     .catch(error => {
    //         console.error('Failed to load tools:', error);
    //     });
    //
    // Return the server interface that Smithery expects
    return server.server;
}
