# MMCP

## What is MMCP
MMCP is a single-executable server, that exposes its tools in groups called Slices.
Each Slice can be registered and used by user's agent harness like a separate MCP server.

This makes it possible to enable/disable certain slices on session-by-session basis,
giving the user fine-grained control over which tools the agent has access to.

## Repository structure
This is a mono-repo TypeScript ecosystem, managed as workspaces with Yarn (4+).

Workspaces are divided in two main directories - `servers` and `plugins`

### servers
strictly server-side logic
- `common`  - contains components reusable across different backends
- `express` - code specific to servers based on `express.js`

planned - implementations for other backends supported by `@modelcontextprotocol` - `fastify` and `hono`

### plugins
client-side plugins allowing automatic registration of all Slices as MCP servers
- `opencode` - plugin for OpenCode (v1)

planned - plugins/extensions for `GitHub Copilot`, `Claude Code`, `OpenCode (v2)`
