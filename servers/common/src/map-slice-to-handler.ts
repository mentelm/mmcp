import { Slice } from '@mentelm/mmcp-slice-model';
import { createMcpHandler, McpHttpHandler, McpServer } from '@modelcontextprotocol/server';

export function mapSliceToHandler(slice: Slice): McpHttpHandler {
  const server: McpServer = new McpServer({name: slice.name, version: '1.0.0'});

  slice.tools.forEach(tool => {
    server.registerTool(
      tool.name,
      {
        title: tool.name,
        description: tool.description,
        inputSchema: tool.inputSchema,
        outputSchema: tool.outputSchema,
      },
      tool.callback
    )
  });

  return createMcpHandler(() => server);
}
