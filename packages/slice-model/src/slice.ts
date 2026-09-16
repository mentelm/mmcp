import { SliceTool } from './slice-tool.js';

export interface Slice {
  name: string;
  tools: SliceTool<any, any>[]
}
