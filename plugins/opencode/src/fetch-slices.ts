export async function fetchMcpSlices(baseUrl: string): Promise<string[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'MMCP-plugin-opencode/1.0.0'
  };

  const response: Response = await fetch(baseUrl + '/mcp', { headers });

  if (!response.ok) {
    throw new Error(`Could not fetch slices: HTTP ${String(response.status)} ${response.statusText}`);
  }

  return await response.json() as string[];
}
