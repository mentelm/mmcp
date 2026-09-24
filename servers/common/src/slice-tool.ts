export interface SliceTool<OutputArgs, InputArgs> {
  name: string;
  description: string;
  inputSchema?: InputArgs;
  outputSchema?: OutputArgs;
  callback: (input: any) => Promise<any>;
}
