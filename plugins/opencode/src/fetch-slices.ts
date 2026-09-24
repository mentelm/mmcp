export async function fetchMcpSlices(baseUrl: string, timeout: number): Promise<string[]> {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'User-Agent': 'MMCP-plugin-opencode/1.0.0'
  };

  const response: Response = await fetch(baseUrl, {
    headers,
    signal: AbortSignal.timeout(timeout)
  });

  if (!response.ok) {
    throw new Error(`Could not fetch slices: HTTP ${String(response.status)} ${response.statusText}`);
  }

  return await response.json() as string[];
}
