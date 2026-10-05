import type { Mcp, Plugin } from '@opencode/plugin';
import { fetchMcpSlices } from './fetch-slices.js';
import { mapToServerConfigs } from './map-to-server-configs.js';

const plugin: Plugin.Plugin = {
  id: 'mentelm.mmcp',
  async setup(ctx): Promise<void> {
    const baseUrl: unknown = ctx.options['url'];
    if (typeof baseUrl !== 'string' || baseUrl.length === 0) {
      throw new Error('MMCP plugin configuration missing');
    }

    const sliceFetchTimeout: number = (ctx.options['sliceFetchTimeout'] as number | undefined) ?? 1500;

    const slices: string[] = await fetchMcpSlices(baseUrl, sliceFetchTimeout);
    const serverConfigs: Record<string, Mcp.ServerConfig> = mapToServerConfigs(baseUrl, slices);

    await ctx.mcp.transform((editor) => {
      Object.entries(serverConfigs).forEach(([name, config]) => {
        editor.set(name, config);
      });
    });
  }
};

export default plugin;
