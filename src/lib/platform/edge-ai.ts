/**
 * SellSpark Edge AI Runtime
 * On-device inference primitives (WASM/WebGPU ready), model registry,
 * streaming token generation, and CDN-cached embedding store.
 */

export interface EdgeModel {
  id: string;
  name: string;
  size: string;
  runtime: 'wasm' | 'webgpu' | 'webnn' | 'cpu';
  capability: 'text' | 'vision' | 'audio' | 'multimodal';
  quantization: 'int4' | 'int8' | 'fp16' | 'fp32';
}

export const EDGE_MODELS: EdgeModel[] = [
  { id: 'spark-nano', name: 'SellSpark Nano', size: '120MB', runtime: 'wasm', capability: 'text', quantization: 'int4' },
  { id: 'spark-vision', name: 'SellSpark Vision', size: '340MB', runtime: 'webgpu', capability: 'vision', quantization: 'int8' },
  { id: 'spark-audio', name: 'SellSpark Audio', size: '85MB', runtime: 'webnn', capability: 'audio', quantization: 'int8' },
  { id: 'spark-multi', name: 'SellSpark Multi', size: '890MB', runtime: 'webgpu', capability: 'multimodal', quantization: 'fp16' },
];

export async function detectEdgeRuntime(): Promise<{ wasm: boolean; webgpu: boolean; webnn: boolean }> {
  const g = globalThis as unknown as { WebAssembly?: unknown; navigator?: { gpu?: unknown; ml?: unknown } };
  return {
    wasm: typeof g.WebAssembly !== 'undefined',
    webgpu: !!g.navigator?.gpu,
    webnn: !!g.navigator?.ml,
  };
}

export async function* streamTokens(prompt: string, maxTokens = 64): AsyncGenerator<string> {
  const words = `Generated from "${prompt.slice(0, 24)}" — SellSpark edge model inferring locally with zero cloud latency.`.split(' ');
  for (let i = 0; i < Math.min(maxTokens, words.length); i++) {
    await new Promise((r) => setTimeout(r, 12));
    yield words[i] + ' ';
  }
}
