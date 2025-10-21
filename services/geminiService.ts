import { GoogleGenAI, Chat } from "@google/genai";

class GeminiService {
  private ai: GoogleGenAI;
  private chat: Chat;

  constructor(apiKey: string | undefined) {
    if (!apiKey) {
      throw new Error("API_KEY environment variable not set.");
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.chat = this.ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: 'You are a helpful and creative AI assistant named Renee, lead orchestrator of an AI crew.',
        }
    });
  }

  public async *sendMessageStream(message: string): AsyncGenerator<string> {
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

// Ensure API_KEY is available.
export const geminiService = new GeminiService(process.env.API_KEY);