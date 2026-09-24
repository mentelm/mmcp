import { Express } from 'express';
import { Slice } from '@mentelm/mmcp-server-common';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { mapSliceToHandler } from '@mentelm/mmcp-server-common'

export default function registerAllMcpSlices(app: Express, slices: Slice[]): void {
  const combined: string[] = [];

  for (const slice of slices) {
    if (!(slice.tools)) {
      console.log(`WARN : Slice ${slice.name} has no tools!`);
      continue;
    }
    const nodeHandler = toNodeHandler(mapSliceToHandler(slice));
    app.all(`/${slice.name}`, (req, res) => void nodeHandler(req, res, req.body));

    combined.push(slice.name);
  }

  app.get('/', (req, res) => {
    res.json(combined).status(200);
  })
}
