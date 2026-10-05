# MMCP OpenCode Plugin (v2)

Plugin for OpenCode v2. Auto-registers MMCP slices from a server as separate MCP servers on startup.

To use, put following in `opencode.json`:
```json
{
  "plugins": [
    {
      "package": "@mentelm/mmcp-plugin-opencode2@<version>",
      "options": {
        "url": "url-to-your-mmcp-server",
        "sliceFetchTimeout": 2000
      }
    }
  ]
}
```
`url` - base URL on which mmcpServer was registered (GET on this URL should respond with list of Slices)
`sliceFetchTimeout` - controls timeout (milliseconds) on initial request that fetches list of Slices. Optional. Default = 1500.

**NOTE:**
This package is the OpenCode v2 port of [`@mentelm/mmcp-plugin-opencode`](../opencode), which targets OpenCode v1.
They are separate packages - V1 plugin implementations do not run in V2, so pick the one matching your OpenCode version.

## Differences from the v1 plugin

Behaviour is the same: the plugin fetches the slice list once during setup and registers each slice as its own remote
MCP server. Only the OpenCode plugin API differs.

| v1 | v2 |
| --- | --- |
| exported plugin function returning `Hooks` | `Plugin.define({ id, setup })` |
| `plugin` config key with `[package, options]` tuple | `plugins` config key with `{ package, options }` object |
| options passed as the second function argument | `ctx.options` |
| `config` hook mutating `cfg.mcp` | `ctx.mcp.transform((editor) => editor.set(name, config))` |
| `McpRemoteConfig.timeout: number` | `Mcp.TimeoutConfig` with `startup` / `catalog` / `execution` |

v1's single `timeout` capped MCP discovery (`tools/list`), so the equivalent v2 field is `catalog`. `startup` and
`execution` keep their OpenCode defaults.

The plugin ID is `mentelm.mmcp`, which is also the prefix to use when [disabling it via config](https://opencode.ai/v2/docs/plugins/#control).
