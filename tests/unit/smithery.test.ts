import { beforeEach, describe, expect, it, vi } from 'vitest';

import log from '@apify/log';

import * as toolsLoader from '../../src/utils/tools-loader.js';
import { ActorsMcpServer } from '../../src/mcp/server.js';
import smithery from '../../src/smithery.js';

// Silence logs in unit tests
log.setLevel(log.LEVELS.OFF);

describe('smithery entrypoint barrier behavior', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('calls blockListToolsUntil when apifyToken is present', async () => {
        // Arrange
        const blockSpy = vi.spyOn(ActorsMcpServer.prototype as any, 'blockListToolsUntil');
        const loadSpy = vi.spyOn(toolsLoader, 'loadToolsFromInput').mockResolvedValue([]);

        // Act
        const server = smithery({ config: { apifyToken: 'TEST_TOKEN', enableAddingActors: true } as any });

        // Assert
        expect(server).toBeTruthy();
        expect(blockSpy).toHaveBeenCalledTimes(1);
        expect(loadSpy).toHaveBeenCalledTimes(1);
    });

    it('does not call blockListToolsUntil when apifyToken is missing', async () => {
        // Arrange
        const blockSpy = vi.spyOn(ActorsMcpServer.prototype as any, 'blockListToolsUntil');
        const loadSpy = vi.spyOn(toolsLoader, 'loadToolsFromInput').mockResolvedValue([]);
        const originalToken = process.env.APIFY_TOKEN;
        delete process.env.APIFY_TOKEN;

        // Act
        const server = smithery({ config: { enableAddingActors: true } as any });

        // Assert
        expect(server).toBeTruthy();
        expect(blockSpy).not.toHaveBeenCalled();
        expect(loadSpy).not.toHaveBeenCalled();
        if (originalToken !== undefined) process.env.APIFY_TOKEN = originalToken;
    });
});
