import { Config, Hooks, Plugin, PluginInput, PluginOptions } from '@opencode-ai/plugin';
import { fetchMcpSlices } from './fetch-slices';
import { mapToServerConfigs } from './map-to-server-configs';

export const plugin: Plugin = async (_: PluginInput, options?: PluginOptions): Promise<Hooks> => {
  if (!options || !(options['url'])) {
    throw new Error('MMCP plugin configuration missing');
  }

  const baseUrl: string = options['url'] as string ?? '';

  return {
    async config(cfg: Config): Promise<void> {
      const slices: string[] = await fetchMcpSlices(baseUrl);
      cfg.mcp = {
        ...(cfg.mcp ?? {}),
        ...mapToServerConfigs(baseUrl, slices)
      };
    }
  };
};
