import type { Mcp } from '@opencode/plugin';

export function mapToServerConfigs(baseUrl: string, sliceNames: string[]): Record<string, Mcp.ServerConfig> {
  const result: Record<string, Mcp.ServerConfig> = {};

  sliceNames.forEach((sliceName) => {
    result[sliceName] = ({
      'type': 'remote',
      url: baseUrl + '/' + sliceName,
      timeout: { catalog: 2500 }
    })
  });

  return result;
}
