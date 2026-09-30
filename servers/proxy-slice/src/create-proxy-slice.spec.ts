import { describe, it, expect } from 'vitest';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { Slice, mapSliceToHandler } from '@mentelm/mmcp-server-common';
import { fromJsonSchema } from '@modelcontextprotocol/client';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { createProxySlices } from './create-proxy-slice.js';

async function withSlices(slices: Slice[], fn: (url: string) => Promise<void>): Promise<void> {
  const handlers = new Map(
    slices.map((slice) => [`/${slice.name}`, toNodeHandler(mapSliceToHandler(slice))])
  );

  const server = createServer((req, res) => {
    const handler = handlers.get(req.url);
    if (!handler) {
      res.writeHead(404);
      res.end();
      return;
    }
    void handler(req, res);
  });
  server.listen(0);

  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  const url = `http://localhost:${address.port}`;

  try {
    await fn(url);
  } finally {
    await new Promise<void>((resolve, reject) => server.close((err) => (err ? reject(err) : resolve())));
  }
}

function remoteSlices(): Slice[] {
  return [
    {
      name: 'math',
      tools: [
        {
          name: 'add',
          description: 'Adds two numbers',
          inputSchema: fromJsonSchema({
            type: 'object',
            properties: { a: {}, b: {} },
            required: ['a', 'b'],
          }),
          callback: async ({ a, b }: { a: number; b: number }) => ({
            content: [{ type: 'text' as const, text: String(a + b) }],
          }),
        },
        {
          name: 'multiply',
          description: 'Multiplies two numbers',
          callback: async ({ a, b }: { a: number; b: number }) => ({
            content: [{ type: 'text' as const, text: String(a * b) }],
          }),
        },
      ],
    },
    {
      name: 'text',
      tools: [
        {
          name: 'uppercase',
          description: 'Converts text to uppercase',
          inputSchema: fromJsonSchema({
            type: 'object',
            properties: { str: { type: 'string' } },
            required: ['str'],
          }),
          callback: async ({ str }: { str: string }) => ({
            content: [{ type: 'text' as const, text: str.toUpperCase() }],
          }),
        },
        {
          name: 'lowercase',
          description: 'Converts text to lowercase',
          callback: async ({ str }: { str: string }) => ({
            content: [{ type: 'text' as const, text: str.toLowerCase() }],
          }),
        },
      ],
    },
  ];
}

describe('createProxySlices', () => {
  it('should create a slice per mapping, filtering tools by exact name', async () => {
    await withSlices(remoteSlices(), async (url) => {
      const slices = await createProxySlices(`${url}/math`, [
        { kind: 'exact', sliceName: 'addition', text: 'add' },
      ]);

      expect(slices).toHaveLength(1);
      expect(slices[0].name).toBe('addition');
      expect(slices[0].tools.map((t) => t.name)).toEqual(['add']);
      expect(slices[0].tools[0].description).toBe('Adds two numbers');
      expect(slices[0].tools[0].inputSchema['~standard'].jsonSchema.input()).toEqual({
        type: 'object',
        properties: { a: {}, b: {} },
        required: ['a', 'b'],
      });
      expect(() => mapSliceToHandler(slices[0])).not.toThrow();
    });
  });

  it('should create a slice per mapping, filtering tools by pattern', async () => {
    await withSlices(remoteSlices(), async (url) => {
      const slices = await createProxySlices(`${url}/math`, [
        { kind: 'pattern', sliceName: 'all-math', pattern: '^(add|multiply)$' },
        { kind: 'pattern', sliceName: 'no-matches', pattern: '^nothing-here$' },
      ]);

      expect(slices).toHaveLength(2);
      expect(slices[0].name).toBe('all-math');
      expect(slices[0].tools.map((t) => t.name)).toEqual(['add', 'multiply']);
      expect(slices[1].name).toBe('no-matches');
      expect(slices[1].tools).toHaveLength(0);
    });
  });

  it('should mix exact and pattern mappings across multiple remote slices', async () => {
    await withSlices(remoteSlices(), async (url) => {
      const math = await createProxySlices(`${url}/math`, [
        { kind: 'pattern', sliceName: 'links', pattern: '.*' },
      ]);
      const text = await createProxySlices(`${url}/text`, [
        { kind: 'exact', sliceName: 'capitals', text: 'uppercase' },
      ]);

      expect(math[0].tools.map((t) => t.name)).toEqual(['add', 'multiply']);
      expect(text[0].tools.map((t) => t.name)).toEqual(['uppercase']);
    });
  });

  it('should proxy tool calls to the connected server', async () => {
    await withSlices(remoteSlices(), async (url) => {
      const slices = await createProxySlices(`${url}/math`, [
        { kind: 'exact', sliceName: 'addition', text: 'add' },
      ]);

      const result = await slices[0].tools[0].callback({ a: 2, b: 3 });
      expect(result).toEqual({ content: [{ type: 'text', text: '5' }] });
    });
  });

  it('should forward the input arguments when proxying', async () => {
    await withSlices(remoteSlices(), async (url) => {
      const slices = await createProxySlices(`${url}/text`, [
        { kind: 'exact', sliceName: 'shout', text: 'uppercase' },
      ]);

      const result = await slices[0].tools[0].callback({ str: 'hello' });
      expect(result).toEqual({ content: [{ type: 'text', text: 'HELLO' }] });
    });
  });

  it('should reject when the server cannot be reached', async () => {
    await expect(createProxySlices('http://127.0.0.1:1', [])).rejects.toThrow();
  });
});