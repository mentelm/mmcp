import { Slice, SliceTool } from '@mentelm/mmcp-server-common';
import {
  CallToolResult,
  Client,
  fromJsonSchema,
  JsonSchemaType,
  StreamableHTTPClientTransport,
  Tool
} from '@modelcontextprotocol/client';

export type Mapping = {
  sliceName: string;
}

export type ExactMapping = Mapping & {
  kind: 'exact',
  text: string;
}

export type PatternMapping = Mapping & {
  kind: 'pattern',
  pattern: string;
}

export type AnyMapping = ExactMapping | PatternMapping;

function matchesMapping(mapping: AnyMapping, toolName: string): boolean {
  if (mapping.kind === 'exact') {
    return toolName === mapping.text;
  }
  return new RegExp(mapping.pattern).test(toolName);
}

export async function createProxySlices(
  baseUrl: string | URL,
  mappings: AnyMapping[]
): Promise<Slice[]> {
  const client = new Client({ name: 'mmcp-proxy-slice', version: '0.0.1' });
  const transport = new StreamableHTTPClientTransport(new URL(baseUrl));

  await client.connect(transport);

  try {
    const { tools } = await client.listTools();

    return mappings.map((mapping) => ({
      name: mapping.sliceName,
      tools: tools
        .filter((tool) => matchesMapping(mapping, tool.name))
        .map((tool) => toSliceTool(client, tool))
    }));
  } catch (error) {
    await client.close();
    throw error;
  }
}

function toSliceTool(client: Client, tool: Tool): SliceTool<any, any> {
  return {
    name: tool.name,
    description: tool.description ?? '',
    inputSchema: fromJsonSchema(tool.inputSchema as JsonSchemaType),
    outputSchema: tool.outputSchema ? fromJsonSchema(tool.outputSchema as JsonSchemaType) : undefined,
    callback: async (input: any): Promise<CallToolResult> =>
      client.callTool({ name: tool.name, arguments: input })
  };
}
