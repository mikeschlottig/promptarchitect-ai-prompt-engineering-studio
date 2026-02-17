import OpenAI from 'openai';
import type { Message, ToolCall } from './types';
import { getToolDefinitions, executeTool } from './tools';
import { ChatCompletionMessageFunctionToolCall } from 'openai/resources/index.mjs';
export class ChatHandler {
  private client: OpenAI;
  private model: string;
  constructor(aiGatewayUrl: string, apiKey: string, model: string) {
    this.client = new OpenAI({
      baseURL: aiGatewayUrl,
      apiKey: apiKey
    });
    this.model = model;
  }
  updateConfig(baseUrl: string, apiKey: string, model: string) {
    if (baseUrl && apiKey) {
      this.client = new OpenAI({
        baseURL: baseUrl,
        apiKey: apiKey
      });
    }
    this.model = model;
  }
  async processMessage(
    message: string,
    conversationHistory: Message[],
    onChunk?: (chunk: string) => void
  ): Promise<{
    content: string;
    toolCalls?: ToolCall[];
  }> {
    const messages = this.buildConversationMessages(message, conversationHistory);
    const toolDefinitions = await getToolDefinitions();
    try {
      if (onChunk) {
        const stream = await this.client.chat.completions.create({
          model: this.model,
          messages,
          tools: toolDefinitions,
          tool_choice: 'auto',
          max_completion_tokens: 32768,
          stream: true,
        });
        return this.handleStreamResponse(stream, message, conversationHistory, onChunk);
      }
      const completion = await this.client.chat.completions.create({
        model: this.model,
        messages,
        tools: toolDefinitions,
        tool_choice: 'auto',
        max_tokens: 32768,
        stream: false
      });
      return this.handleNonStreamResponse(completion, message, conversationHistory);
    } catch (error: any) {
      console.error('OpenAI Completion Error:', error);
      const msg = error?.message || String(error);
      if (msg.includes('context_length_exceeded') || msg.includes('too many tokens')) {
        throw new Error('provider:context_overflow');
      }
      if (msg.includes('rate_limit') || error?.status === 429) {
        throw new Error('provider:rate_limited');
      }
      if (msg.includes('invalid_model') || msg.includes('model_not_found')) {
        throw new Error('provider:invalid_model');
      }
      throw error;
    }
  }
  private async handleStreamResponse(
    stream: AsyncIterable<OpenAI.Chat.Completions.ChatCompletionChunk>,
    message: string,
    conversationHistory: Message[],
    onChunk: (chunk: string) => void
  ) {
    let fullContent = '';
    const accumulatedToolCalls: ChatCompletionMessageFunctionToolCall[] = [];
    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta;
      if (delta?.content) {
        fullContent += delta.content;
        onChunk(delta.content);
      }
      if (delta?.tool_calls) {
        for (let i = 0; i < delta.tool_calls.length; i++) {
          const deltaToolCall = delta.tool_calls[i];
          if (!accumulatedToolCalls[i]) {
            accumulatedToolCalls[i] = {
              id: deltaToolCall.id || `tool_${Date.now()}_${i}`,
              type: 'function',
              function: {
                name: deltaToolCall.function?.name || '',
                arguments: deltaToolCall.function?.arguments || ''
              }
            };
          } else {
            if (deltaToolCall.function?.name && !accumulatedToolCalls[i].function.name) {
              accumulatedToolCalls[i].function.name = deltaToolCall.function.name;
            }
            if (deltaToolCall.function?.arguments) {
              accumulatedToolCalls[i].function.arguments += deltaToolCall.function.arguments;
            }
          }
        }
      }
    }
    if (accumulatedToolCalls.length > 0) {
      const executedTools = await this.executeToolCalls(accumulatedToolCalls);
      const finalResponse = await this.generateToolResponse(message, conversationHistory, accumulatedToolCalls, executedTools);
      return { content: finalResponse, toolCalls: executedTools };
    }
    return { content: fullContent };
  }
  private async handleNonStreamResponse(
    completion: OpenAI.Chat.Completions.ChatCompletion,
    message: string,
    conversationHistory: Message[]
  ) {
    const responseMessage = completion.choices[0]?.message;
    if (!responseMessage) {
      return { content: 'I apologize, but I encountered an issue processing your request.' };
    }
    if (!responseMessage.tool_calls) {
      return {
        content: responseMessage.content || 'I apologize, but I encountered an issue.'
      };
    }
    const toolCalls = await this.executeToolCalls(responseMessage.tool_calls as ChatCompletionMessageFunctionToolCall[]);
    const finalResponse = await this.generateToolResponse(
      message,
      conversationHistory,
      responseMessage.tool_calls,
      toolCalls
    );
    return { content: finalResponse, toolCalls };
  }
  private async executeToolCalls(openAiToolCalls: ChatCompletionMessageFunctionToolCall[]): Promise<ToolCall[]> {
    return Promise.all(
      openAiToolCalls.map(async (tc) => {
        try {
          const args = tc.function.arguments ? JSON.parse(tc.function.arguments) : {};
          const result = await executeTool(tc.function.name, args);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: args,
            result
          };
        } catch (error) {
          console.error(`Tool execution failed for ${tc.function.name}:`, error);
          return {
            id: tc.id,
            name: tc.function.name,
            arguments: {},
            result: { error: `Failed to execute ${tc.function.name}: ${error instanceof Error ? error.message : 'Unknown error'}` }
          };
        }
      })
    );
  }
  private async generateToolResponse(
    userMessage: string,
    history: Message[],
    openAiToolCalls: OpenAI.Chat.Completions.ChatCompletionMessageToolCall[],
    toolResults: ToolCall[]
  ): Promise<string> {
    const followUpCompletion = await this.client.chat.completions.create({
      model: this.model,
      messages: [
        { role: 'system', content: 'You are a helpful AI assistant. Respond naturally to the tool results.' },
        ...history.slice(-3).map(m => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMessage },
        {
          role: 'assistant',
          content: null,
          tool_calls: openAiToolCalls
        },
        ...toolResults.map((result, index) => ({
          role: 'tool' as const,
          content: JSON.stringify(result.result),
          tool_call_id: openAiToolCalls[index]?.id || result.id
        }))
      ],
      max_tokens: 32768
    });
    return followUpCompletion.choices[0]?.message?.content || 'Tool results processed successfully.';
  }
  private buildConversationMessages(userMessage: string, history: Message[]) {
    const isEngineered = userMessage.includes('You are a world-class Prompt Engineer') ||
                        userMessage.includes('USER INPUT:');
    const systemPrompt = isEngineered
      ? 'Follow the prompt engineering instructions provided in the user message precisely.'
      : 'You are a helpful AI assistant that helps users build and deploy web applications. You provide clear, concise guidance on development, deployment, and troubleshooting. Keep responses practical and actionable.';
    return [
      { role: 'system' as const, content: systemPrompt },
      ...history.slice(-10).map(m => ({
        role: m.role,
        content: m.content
      })),
      { role: 'user' as const, content: userMessage }
    ];
  }
  updateModel(newModel: string): void {
    this.model = newModel;
  }
}