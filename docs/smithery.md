# Smithery integration

- The Smithery entrypoint is `src/smithery.ts`.
- It exports `configSchema` and a default sync function returning the MCP server instance.
- On startup, if `apifyToken`/`APIFY_TOKEN` is provided, tools load asynchronously and the first `listTools` is gated via a one-time barrier (`blockListToolsUntil`).
- If no token is provided, actor loading is skipped; only internal tools are available.

Run with Smithery:

```bash
npx @smithery/cli build
# optional, recommended for actors
export APIFY_TOKEN="your-apify-token"
npx @smithery/cli dev
```

Notes:
- The barrier is used only by Smithery; stdio/SSE/HTTP flows are unaffected.
- Default actor `apify/rag-web-browser` loads when no actors specified and a token is present.
