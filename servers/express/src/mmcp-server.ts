import { createMcpExpressApp, CreateMcpExpressAppOptions } from '@modelcontextprotocol/express';
import { Express } from 'express';
import { Slice } from '@mentelm/mmcp-server-common';
import registerAllMcpSlices from './registration.js';

export function mmcpServer(slices: Slice[], options?: CreateMcpExpressAppOptions): Express {
  const app: Express = createMcpExpressApp(options);
  registerAllMcpSlices(app, slices);
  return app;
}
