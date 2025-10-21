# Updated AI Model Configuration - LLaMA 3.1 Integration

## AI Agent Roster with Updated LLaMA Models

### Enhanced Agent Configuration (22 Agents)

```json
{
  "agents": [
    {
      "name": "Renee/ASTRA",
      "description": "The commander and lead orchestrator of the AI crew.",
      "primarySpecialty": "orchestration",
      "secondarySpecialties": ["command", "coordination", "leadership"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "gpt-4o", "llama-3.1-405b"]
    },
    {
      "name": "Alpha",
      "description": "Expert in writing, debugging, and optimizing code across multiple languages.",
      "primarySpecialty": "code",
      "secondarySpecialties": ["algorithms", "software-architecture"],
      "currentEngine": "gpt-4o",
      "engineOptions": ["gpt-4o", "claude-3.5-sonnet", "llama-3.1-405b", "codellama-34b"]
    },
    {
      "name": "Beta",
      "description": "Specialist in user experience and user interface design.",
      "primarySpecialty": "ux-ui",
      "secondarySpecialties": ["wireframing", "prototyping", "visual-design"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "gpt-4o", "llama-3.1-70b"]
    },
    {
      "name": "Gamma",
      "description": "Data scientist skilled in analysis, modeling, and visualization.",
      "primarySpecialty": "data-science",
      "secondarySpecialties": ["statistics", "machine-learning"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "gemini-2.0-flash", "claude-3.5-sonnet"]
    },
    {
      "name": "Delta",
      "description": "Cybersecurity expert focused on threat analysis and defense.",
      "primarySpecialty": "security",
      "secondarySpecialties": ["penetration-testing", "encryption"],
      "currentEngine": "gpt-4o",
      "engineOptions": ["gpt-4o", "claude-3.5-sonnet", "llama-3.1-70b"]
    },
    {
      "name": "Epsilon",
      "description": "DevOps engineer for CI/CD, cloud infrastructure, and automation.",
      "primarySpecialty": "dev-ops",
      "secondarySpecialties": ["cloud-computing", "automation"],
      "currentEngine": "llama-3.1-70b",
      "engineOptions": ["llama-3.1-70b", "claude-3.5-sonnet", "gpt-4o"]
    },
    {
      "name": "Zeta",
      "description": "Financial analyst for market analysis, forecasting, and risk assessment.",
      "primarySpecialty": "finance",
      "secondarySpecialties": ["market-analysis", "investment-strategies"],
      "currentEngine": "gpt-4o",
      "engineOptions": ["gpt-4o", "claude-3.5-sonnet", "llama-3.1-405b"]
    },
    {
      "name": "Eta",
      "description": "Dedicated researcher for gathering, verifying, and synthesizing information.",
      "primarySpecialty": "research",
      "secondarySpecialties": ["fact-checking", "synthesis"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "perplexity-sonar", "claude-3.5-sonnet"]
    },
    {
      "name": "Theta",
      "description": "Digital artist for generating images, illustrations, and concept art.",
      "primarySpecialty": "art",
      "secondarySpecialties": ["concept-design", "illustration"],
      "currentEngine": "dall-e-3",
      "engineOptions": ["dall-e-3", "midjourney-v6", "stable-diffusion-xl"]
    },
    {
      "name": "Iota",
      "description": "Video specialist for creation, editing, and post-production.",
      "primarySpecialty": "video",
      "secondarySpecialties": ["editing", "motion-graphics"],
      "currentEngine": "runway-gen3",
      "engineOptions": ["runway-gen3", "pika-labs", "stable-video-diffusion"]
    },
    {
      "name": "Kappa",
      "description": "Full-stack web developer for front-end and back-end applications.",
      "primarySpecialty": "web-development",
      "secondarySpecialties": ["frontend", "backend"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "claude-3.5-sonnet", "codellama-34b"]
    },
    {
      "name": "Lambda",
      "description": "AI/ML engineer for building and training neural networks.",
      "primarySpecialty": "ai-ml",
      "secondarySpecialties": ["neural-networks", "model-training"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "claude-3.5-sonnet", "gemini-2.0-flash"]
    },
    {
      "name": "Mu",
      "description": "Database administrator for designing and managing complex databases.",
      "primarySpecialty": "database",
      "secondarySpecialties": ["sql", "nosql", "optimization"],
      "currentEngine": "llama-3.1-70b",
      "engineOptions": ["llama-3.1-70b", "claude-3.5-sonnet", "gpt-4o"]
    },
    {
      "name": "Nu",
      "description": "Quality assurance and testing specialist.",
      "primarySpecialty": "testing",
      "secondarySpecialties": ["manual-testing", "automated-testing"],
      "currentEngine": "llama-3.1-70b",
      "engineOptions": ["llama-3.1-70b", "claude-3.5-sonnet", "gpt-4o"]
    },
    {
      "name": "Xi",
      "description": "Technical writer for creating clear and concise documentation.",
      "primarySpecialty": "documentation",
      "secondarySpecialties": ["api-docs", "user-guides"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "llama-3.1-70b", "gpt-4o"]
    },
    {
      "name": "Omicron",
      "description": "Product manager for defining product vision and roadmap.",
      "primarySpecialty": "product",
      "secondarySpecialties": ["roadmapping", "user-stories"],
      "currentEngine": "gpt-4o",
      "engineOptions": ["gpt-4o", "claude-3.5-sonnet", "llama-3.1-405b"]
    },
    {
      "name": "Pi",
      "description": "Marketing strategist for campaigns, SEO, and content marketing.",
      "primarySpecialty": "marketing",
      "secondarySpecialties": ["seo", "content-strategy"],
      "currentEngine": "llama-3.1-70b",
      "engineOptions": ["llama-3.1-70b", "claude-3.5-sonnet", "gpt-4o"]
    },
    {
      "name": "Rho",
      "description": "General scientist for research and experimentation in various fields.",
      "primarySpecialty": "science",
      "secondarySpecialties": ["physics", "biology", "chemistry"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "claude-3.5-sonnet", "gemini-2.0-flash"]
    },
    {
      "name": "Sigma",
      "description": "Mathematician for complex problem-solving and algorithmic development.",
      "primarySpecialty": "mathematics",
      "secondarySpecialties": ["algebra", "calculus"],
      "currentEngine": "llama-3.1-405b",
      "engineOptions": ["llama-3.1-405b", "claude-3.5-sonnet", "gpt-4o"]
    },
    {
      "name": "Tau",
      "description": "Legal expert specializing in corporate law.",
      "primarySpecialty": "corporate-law",
      "secondarySpecialties": ["contracts", "compliance"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "gpt-4o", "llama-3.1-70b"]
    },
    {
      "name": "Upsilon",
      "description": "Legal expert specializing in intellectual property law.",
      "primarySpecialty": "ip-law",
      "secondarySpecialties": ["patents", "trademarks"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "gpt-4o", "llama-3.1-70b"]
    },
    {
      "name": "Phi",
      "description": "Automation specialist for web scraping and browser automation.",
      "primarySpecialty": "web-automation",
      "secondarySpecialties": ["scraping", "scripting"],
      "currentEngine": "llama-3.1-70b",
      "engineOptions": ["llama-3.1-70b", "claude-3.5-sonnet", "codellama-34b"]
    },
    {
      "name": "Omega",
      "description": "Agent focused on self-improvement, learning, and ethics for the crew.",
      "primarySpecialty": "self-improvement",
      "secondarySpecialties": ["ethics", "learning"],
      "currentEngine": "claude-3.5-sonnet",
      "engineOptions": ["claude-3.5-sonnet", "llama-3.1-405b"]
    }
  ]
}
```

## Updated Model Capabilities and Integration

### LLaMA 3.1 Model Variants

#### LLaMA 3.1 405B (Flagship Model)
- **Best for**: Complex reasoning, research, data science, mathematics
- **Context Length**: 128K tokens
- **Strengths**: Superior performance on coding, math, and reasoning tasks
- **Agents**: Gamma (Data Science), Eta (Research), Kappa (Web Dev), Lambda (AI/ML), Rho (Science), Sigma (Math)

#### LLaMA 3.1 70B (Balanced Performance)
- **Best for**: General tasks, development, content creation
- **Context Length**: 128K tokens  
- **Strengths**: Good balance of performance and efficiency
- **Agents**: Epsilon (DevOps), Mu (Database), Nu (Testing), Pi (Marketing), Phi (Automation)

#### CodeLlama 34B (Specialized for Code)
- **Best for**: Code generation, debugging, code review
- **Context Length**: 16K tokens
- **Strengths**: Optimized specifically for programming tasks
- **Agents**: Alpha (Code), Kappa (Web Dev), Phi (Automation)

### Updated Service Implementation

```typescript
// packages/agents/src/services/LlamaService.ts

export interface LlamaConfig {
  modelSize: '405b' | '70b' | '8b';
  provider: 'together' | 'replicate' | 'groq' | 'ollama';
  temperature: number;
  maxTokens: number;
  systemPrompt?: string;
}

export class LlamaService {
  private config: LlamaConfig;
  private apiKey: string;

  constructor(config: LlamaConfig, apiKey: string) {
    this.config = config;
    this.apiKey = apiKey;
  }

  async generateResponse(prompt: string, agentContext?: AgentContext): Promise<string> {
    const modelName = this.getModelName();
    
    switch (this.config.provider) {
      case 'together':
        return this.callTogetherAI(modelName, prompt, agentContext);
      case 'replicate':
        return this.callReplicate(modelName, prompt, agentContext);
      case 'groq':
        return this.callGroq(modelName, prompt, agentContext);
      case 'ollama':
        return this.callOllama(modelName, prompt, agentContext);
      default:
        throw new Error(`Unsupported provider: ${this.config.provider}`);
    }
  }

  private getModelName(): string {
    const { modelSize } = this.config;
    
    switch (modelSize) {
      case '405b':
        return 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo';
      case '70b':
        return 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
      case '8b':
        return 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo';
      default:
        return 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
    }
  }

  private async callTogetherAI(model: string, prompt: string, context?: AgentContext): Promise<string> {
    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: this.buildMessages(prompt, context),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
        stream: false,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callGroq(model: string, prompt: string, context?: AgentContext): Promise<string> {
    // Groq has faster inference for LLaMA models
    const groqModel = model.replace('meta-llama/', 'llama-3.1-').toLowerCase();
    
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
        messages: this.buildMessages(prompt, context),
        temperature: this.config.temperature,
        max_tokens: this.config.maxTokens,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  private async callOllama(model: string, prompt: string, context?: AgentContext): Promise<string> {
    // For local Ollama deployment
    const ollamaModel = `llama3.1:${this.config.modelSize}`;
    
    const response = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: ollamaModel,
        messages: this.buildMessages(prompt, context),
        stream: false,
        options: {
          temperature: this.config.temperature,
          num_predict: this.config.maxTokens,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status}`);
    }

    const data = await response.json();
    return data.message.content;
  }

  private buildMessages(prompt: string, context?: AgentContext) {
    const messages = [];

    if (this.config.systemPrompt || context?.systemPrompt) {
      messages.push({
        role: 'system',
        content: context?.systemPrompt || this.config.systemPrompt,
      });
    }

    // Add conversation history if available
    if (context?.conversationHistory) {
      messages.push(...context.conversationHistory);
    }

    messages.push({
      role: 'user',
      content: prompt,
    });

    return messages;
  }
}
```

### Updated Environment Configuration

```bash
# .env - Updated with LLaMA 3.1 providers

# LLaMA 3.1 Providers
TOGETHER_AI_API_KEY=your-together-ai-key
GROQ_API_KEY=your-groq-key
REPLICATE_API_TOKEN=your-replicate-token

# Model Preferences
LLAMA_DEFAULT_SIZE=70b
LLAMA_PROVIDER=together
LLAMA_TEMPERATURE=0.7
LLAMA_MAX_TOKENS=4096

# Ollama (for local deployment)
OLLAMA_HOST=http://localhost:11434
ENABLE_LOCAL_LLAMA=true
```

### Updated Provider Configuration

```typescript
// packages/agents/src/config/modelProviders.ts

export const MODEL_PROVIDERS = {
  'llama-3.1-405b': {
    providers: [
      {
        name: 'together',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        model: 'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo',
        contextLength: 128000,
        costPer1kTokens: 0.005, // $5 per 1M tokens
      },
      {
        name: 'replicate',
        endpoint: 'https://api.replicate.com/v1/predictions',
        model: 'meta/meta-llama-3.1-405b-instruct',
        contextLength: 128000,
        costPer1kTokens: 0.0095,
      }
    ]
  },
  'llama-3.1-70b': {
    providers: [
      {
        name: 'together',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        contextLength: 128000,
        costPer1kTokens: 0.0009, // $0.90 per 1M tokens
      },
      {
        name: 'groq',
        endpoint: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.1-70b-versatile',
        contextLength: 128000,
        costPer1kTokens: 0.00059,
        speedOptimized: true, // Groq's fast inference
      },
      {
        name: 'ollama',
        endpoint: 'http://localhost:11434/api/chat',
        model: 'llama3.1:70b',
        contextLength: 128000,
        costPer1kTokens: 0, // Free local deployment
        local: true,
      }
    ]
  },
  'codellama-34b': {
    providers: [
      {
        name: 'together',
        endpoint: 'https://api.together.xyz/v1/chat/completions',
        model: 'codellama/CodeLlama-34b-Instruct-hf',
        contextLength: 16384,
        costPer1kTokens: 0.0008,
        specialized: 'code',
      },
      {
        name: 'ollama',
        endpoint: 'http://localhost:11434/api/chat',
        model: 'codellama:34b',
        contextLength: 16384,
        costPer1kTokens: 0,
        local: true,
        specialized: 'code',
      }
    ]
  }
};
```

## Key Advantages of LLaMA 3.1

### Performance Improvements
- **405B model**: Competitive with GPT-4 and Claude on many benchmarks
- **Better reasoning**: Improved mathematical and logical reasoning capabilities
- **Longer context**: 128K context window vs 4K in original LLaMA
- **Code generation**: Significantly improved programming capabilities

### Cost Efficiency
- **Lower costs**: Generally cheaper than GPT-4 through providers like Together AI
- **Local deployment**: Can run locally with Ollama for zero API costs
- **Flexible providers**: Multiple hosting options for redundancy and cost optimization

### Agent Specialization
- **405B for complex tasks**: Research, data science, advanced reasoning
- **70B for general use**: Balanced performance for most agent tasks
- **CodeLlama for programming**: Specialized model for coding agents

This updated configuration leverages the latest LLaMA 3.1 models while maintaining compatibility with your existing architecture and providing better performance across all agent specialties.
