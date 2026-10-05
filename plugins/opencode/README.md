# MMCP OpenCode Plugin

Plugin for OpenCode. Auto-registers MMCP slices from a server as separate MCP servers on startup.

To use, put following in `opencode.json`:
```json
{
  "plugin": [
    [
      "@mentelm/mmcp-plugin-opencode@<version>",
      {
        "url": "url-to-your-mmcp-server",
        "sliceFetchTimeout": 2000
      }
    ]
  ]
}
```
`url` - base URL on which mmcpServer was registered (GET on this URL should respond with list of Slices)
`sliceFetchTimeout` - controls timeout (milliseconds) on initial request that fetches list of Slices. Optional. Default = 1500. 

**NOTE:** 
This plugin is compatible with OpenCode v1.
For OpenCode v2 use the separate package [`@mentelm/mmcp-plugin-opencode2`](../opencode2) - V1 plugin implementations do not run in V2.
