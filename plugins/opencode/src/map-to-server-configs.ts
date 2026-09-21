import { McpRemoteConfig } from '@opencode-ai/sdk';

export function mapToServerConfigs(baseUrl: string, sliceNames: string[]): Record<string, McpRemoteConfig> {
  const result: Record<string, McpRemoteConfig> = {};

  sliceNames.forEach((sliceName) => {
    result[sliceName] = ({
      'type': 'remote',
      url: baseUrl + '/' + sliceName,
      timeout: 2500
    })
  });

  return result;
}
