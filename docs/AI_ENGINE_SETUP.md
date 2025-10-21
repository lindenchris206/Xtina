# AI Engine Setup Guide

This guide explains how to configure the AI engines used by your crew.

## Default Engine: Google Gemini

The AI Crew Commander is configured to use the Google Gemini API by default. It is powerful, versatile, and offers a generous free tier.

**To enable Gemini:**

1.  Ensure you have an `.env` file in the project root. If not, copy the example: `cp .env.example .env`.
2.  Obtain a free API key from the [Google AI Studio](https://aistudio.google.com/app/apikey).
3.  Open your `.env` file and paste the key:

    ```.env
    API_KEY="YOUR_GEMINI_API_KEY_HERE"
    ```
4.  Restart the application (`npm run dev`) for the changes to take effect.

The `geminiService.ts` file in `src/services/` handles all communication with the Gemini API.

## Other Supported Engines (Future Implementation)

The platform is designed to support a wide range of AI models. The configuration for these can be found in `src/config/aiEngines.ts`, and the agent-specific options are in `backend/agentsRegistry.json`.

### Cloud Engines
- **Copilot, DeepSeek, Groq, etc.:** Integrating these will require creating a new service similar to `geminiService.ts` and adding logic to the backend orchestrator to call the correct service based on the agent's `currentEngine`.

### Local Engines
- **LM Studio, Ollama, LLaMA, Mistral:** To use local models, you typically need to run their server locally. The backend can then be configured to make API calls to `http://localhost:PORT` instead of a cloud endpoint. See `installers/install-local-ai.sh` for a basic setup script.

### Image Engines
- **Craiyon, Pollinations, Stable Diffusion:** These require their own API keys and service handlers. The logic for image generation would be placed in the backend and called when a task is assigned to an `art`-specialized agent like Theta.
