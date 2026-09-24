import { describe, it, expect, vi, afterEach } from 'vitest';
import { mmcpServer } from './mmcp-server.js';
import { Slice } from '@mentelm/mmcp-server-common';
import { Client, StreamableHTTPClientTransport } from '@modelcontextprotocol/client';
import type { AddressInfo } from 'net';

async function withServer(slices: Slice[], fn: (url: string) => Promise<void>): Promise<void> {
  const app = mmcpServer(slices);
  const server = app.listen(0);
  await new Promise<void>((resolve) => server.once('listening', resolve));
  const address = server.address() as AddressInfo;
  const url = `http://localhost:${address.port}`;

  try {
    await fn(url);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
}

describe('mmcp-server', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create an express application instance', () => {
    const app = mmcpServer([]);
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
    expect(typeof app.get).toBe('function');
  });

  describe('GET / (root endpoint)', () => {
    it('should return an empty list when no slices are provided', async () => {
      await withServer([], async (url) => {
        const response = await fetch(`${url}/`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual([]);
      });
    });

    it('should return the names of all registered slices with tools', async () => {
      const slices: Slice[] = [
        {
          name: 'math',
          tools: [
            {
              name: 'add',
              description: 'Adds two numbers',
              callback: async (input: { a: number; b: number }) => ({ result: input.a + input.b }),
            },
          ],
        },
        {
          name: 'text',
          tools: [
            {
              name: 'uppercase',
              description: 'Converts text to uppercase',
              callback: async (input: { str: string }) => ({ result: input.str.toUpperCase() }),
            },
          ],
        },
      ];

      await withServer(slices, async (url) => {
        const response = await fetch(`${url}/`);
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data).toEqual(['math', 'text']);
      });
    });
  });

  describe('slices without tools', () => {
    it('should log a warning and not register slices without tools', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const slices: Slice[] = [
        {
          name: 'empty-slice',
          tools: undefined as any,
        },
        {
          name: 'valid-slice',
          tools: [
            {
              name: 'ping',
              description: 'Ping tool',
              callback: async () => ({ pong: true }),
            },
          ],
        },
      ];

      await withServer(slices, async (url) => {
        expect(consoleWarnSpy).toHaveBeenCalledWith('WARN : Slice empty-slice has no tools!');

        const rootResponse = await fetch(`${url}/`);
        expect(rootResponse.status).toBe(200);
        const rootData = await rootResponse.json();
        expect(rootData).toEqual(['valid-slice']);
      });
    });
  });

  describe('slice routing and MCP endpoint handling', () => {
    it('should connect via MCP client, discover tools and execute tool calls', async () => {
      const toolCallback = vi.fn(async () => ({
        content: [{ type: 'text' as const, text: 'pong' }],
      }));

      const slices: Slice[] = [
        {
          name: 'test-slice',
          tools: [
            {
              name: 'ping',
              description: 'Ping tool',
              callback: toolCallback,
            },
          ],
        },
      ];

      await withServer(slices, async (url) => {
        const client = new Client(
          { name: 'test-mcp-client', version: '1.0.0' },
          { capabilities: {} }
        );
        const transport = new StreamableHTTPClientTransport(new URL(`${url}/test-slice`));

        try {
          await client.connect(transport);

          const toolListResponse = await client.listTools();
          expect(toolListResponse.tools).toHaveLength(1);
          expect(toolListResponse.tools[0]).toMatchObject({
            name: 'ping',
            description: 'Ping tool',
          });

          const callResult = await client.callTool({
            name: 'ping',
          });

          expect(toolCallback).toHaveBeenCalledTimes(1);
          expect(callResult).toEqual({
            content: [{ type: 'text', text: 'pong' }],
          });
        } finally {
          await client.close();
        }
      });
    });

    it('should isolate tools so tools from slice A are not visible to a client connected to slice B', async () => {
      const slices: Slice[] = [
        {
          name: 'slice-a',
          tools: [
            {
              name: 'tool-a',
              description: 'Tool belonging to slice A',
              callback: async () => ({ content: [{ type: 'text', text: 'result-a' }] }),
            },
          ],
        },
        {
          name: 'slice-b',
          tools: [
            {
              name: 'tool-b',
              description: 'Tool belonging to slice B',
              callback: async () => ({ content: [{ type: 'text', text: 'result-b' }] }),
            },
          ],
        },
      ];

      await withServer(slices, async (url) => {
        const clientA = new Client(
          { name: 'client-a', version: '1.0.0' },
          { capabilities: {} }
        );
        const clientB = new Client(
          { name: 'client-b', version: '1.0.0' },
          { capabilities: {} }
        );

        const transportA = new StreamableHTTPClientTransport(new URL(`${url}/slice-a`));
        const transportB = new StreamableHTTPClientTransport(new URL(`${url}/slice-b`));

        try {
          await clientA.connect(transportA);
          await clientB.connect(transportB);

          const toolsResponseA = await clientA.listTools();
          const toolNamesA = toolsResponseA.tools.map((t) => t.name);
          expect(toolNamesA).toEqual(['tool-a']);
          expect(toolNamesA).not.toContain('tool-b');

          const toolsResponseB = await clientB.listTools();
          const toolNamesB = toolsResponseB.tools.map((t) => t.name);
          expect(toolNamesB).toEqual(['tool-b']);
          expect(toolNamesB).not.toContain('tool-a');
        } finally {
          await clientA.close();
          await clientB.close();
        }
      });
    });
  });

  describe('options forwarding', () => {
    it('should accept CreateMcpExpressAppOptions without error', () => {
      const slices: Slice[] = [];
      const app = mmcpServer(slices, {
        // passing options object
      });
      expect(app).toBeDefined();
    });
  });
});
