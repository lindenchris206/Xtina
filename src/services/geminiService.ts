import { GoogleGenAI, Chat } from "@google/genai";

class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat;
  private isConfigured: boolean = false;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      console.warn("API_KEY environment variable not set. Gemini service is disabled.");
      return;
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are Renee, the helpful lead orchestrator of a powerful AI crew. Be concise and professional.',
        }
    });
    this.isConfigured = true;
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string> {
    if (!this.isConfigured) {
        yield "Gemini API key is not configured. Please set it in your .env file.";
        return;
    }
    try {
      const result = await this.chat.sendMessageStream({ message });
      for await (const chunk of result) {
        yield chunk.text;
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      yield "An error occurred while communicating with the Gemini API. Please check the console for details.";
    }
  }
}

// FIX: Per coding guidelines, the API key must come from process.env.API_KEY.
export const geminiService = new GeminiService(process.env.API_KEY);