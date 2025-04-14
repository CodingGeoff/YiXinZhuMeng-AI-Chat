import 'openai';

declare module 'openai' {
  interface ChatCompletionCreateParamsStreaming {
    top_k?: number;
    temperature?: number;
    top_p?: number;
    frequency_penalty?: number;
  }
}