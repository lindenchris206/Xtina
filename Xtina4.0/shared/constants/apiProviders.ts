/**
 * Comprehensive API Provider Configuration
 * Based on keyhacks repository and industry standards
 * Supports 80+ API providers with validation patterns and documentation
 */

export interface APIProvider {
  id: string;
  name: string;
  category: string;
  description: string;
  keyFormat: RegExp | null;
  keyPrefix?: string;
  documentationUrl: string;
  testEndpoint?: string;
  requiresSecret?: boolean;
  fields: {
    name: string;
    label: string;
    type: 'text' | 'password' | 'url';
    placeholder: string;
    required: boolean;
  }[];
}

export const API_PROVIDER_CATEGORIES = {
  AI_ML: 'AI & Machine Learning',
  ANALYTICS: 'Analytics & Tracking',
  CLOUD: 'Cloud Services',
  COMMUNICATION: 'Communication',
  DATABASE: 'Database',
  DEVOPS: 'DevOps & CI/CD',
  MARKETING: 'Marketing & Sales',
  MAPS: 'Maps & Location',
  MEDIA: 'Media & Content',
  MONITORING: 'Monitoring & Logging',
  PAYMENT: 'Payment Processing',
  PRODUCTIVITY: 'Productivity',
  SEARCH: 'Search & Discovery',
  SECURITY: 'Security & Auth',
  SOCIAL: 'Social Media',
  TESTING: 'Testing & QA',
  WEBHOOKS: 'Webhooks & Integration',
} as const;

export const API_PROVIDERS: APIProvider[] = [
  // ===== AI & MACHINE LEARNING =====
  {
    id: 'openai',
    name: 'OpenAI',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'GPT models, DALL-E, Whisper, and embeddings',
    keyFormat: /^sk-[a-zA-Z0-9]{48,}$/,
    keyPrefix: 'sk-',
    documentationUrl: 'https://platform.openai.com/docs',
    testEndpoint: 'https://api.openai.com/v1/models',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        required: true,
      },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic (Claude)',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Claude AI models for advanced reasoning',
    keyFormat: /^sk-ant-[a-zA-Z0-9\-_]{95,}$/,
    keyPrefix: 'sk-ant-',
    documentationUrl: 'https://docs.anthropic.com',
    testEndpoint: 'https://api.anthropic.com/v1/models',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-ant-...',
        required: true,
      },
    ],
  },
  {
    id: 'google_ai',
    name: 'Google AI (Gemini)',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Gemini models and Google AI services',
    keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
    keyPrefix: 'AIza',
    documentationUrl: 'https://ai.google.dev/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'AIza...',
        required: true,
      },
    ],
  },
  {
    id: 'huggingface',
    name: 'Hugging Face',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Open-source AI models and inference',
    keyFormat: /^hf_[a-zA-Z0-9]{38}$/,
    keyPrefix: 'hf_',
    documentationUrl: 'https://huggingface.co/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Token',
        type: 'password',
        placeholder: 'hf_...',
        required: true,
      },
    ],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Run ML models via API',
    keyFormat: null,
    documentationUrl: 'https://replicate.com/docs',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'r8_...',
        required: true,
      },
    ],
  },
  {
    id: 'stability',
    name: 'Stability AI',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Stable Diffusion image generation',
    keyFormat: /^sk-[a-zA-Z0-9]{40,}$/,
    documentationUrl: 'https://platform.stability.ai/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'sk-...',
        required: true,
      },
    ],
  },
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Text-to-speech and voice cloning',
    keyFormat: null,
    documentationUrl: 'https://elevenlabs.io/docs',
    testEndpoint: 'https://api.elevenlabs.io/v1/user',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'xi-api-key',
        required: true,
      },
      {
        name: 'voiceId',
        label: 'Default Voice ID',
        type: 'text',
        placeholder: 'EXAVITQu4vr4xnSDxMaL',
        required: false,
      },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: API_PROVIDER_CATEGORIES.AI_ML,
    description: 'Language AI for embeddings and generation',
    keyFormat: null,
    documentationUrl: 'https://docs.cohere.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter API key',
        required: true,
      },
    ],
  },

  // ===== CLOUD SERVICES =====
  {
    id: 'aws',
    name: 'Amazon Web Services',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'AWS cloud computing services',
    keyFormat: /^AKIA[0-9A-Z]{16}$/,
    keyPrefix: 'AKIA',
    documentationUrl: 'https://docs.aws.amazon.com',
    requiresSecret: true,
    fields: [
      {
        name: 'accessKeyId',
        label: 'Access Key ID',
        type: 'text',
        placeholder: 'AKIA...',
        required: true,
      },
      {
        name: 'secretAccessKey',
        label: 'Secret Access Key',
        type: 'password',
        placeholder: 'Enter secret key',
        required: true,
      },
      {
        name: 'region',
        label: 'Default Region',
        type: 'text',
        placeholder: 'us-east-1',
        required: false,
      },
    ],
  },
  {
    id: 'azure',
    name: 'Microsoft Azure',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Microsoft cloud services',
    keyFormat: null,
    documentationUrl: 'https://docs.microsoft.com/azure',
    fields: [
      {
        name: 'tenantId',
        label: 'Tenant ID',
        type: 'text',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        required: true,
      },
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx',
        required: true,
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter client secret',
        required: true,
      },
    ],
  },
  {
    id: 'gcp',
    name: 'Google Cloud Platform',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Google cloud computing services',
    keyFormat: null,
    documentationUrl: 'https://cloud.google.com/docs',
    fields: [
      {
        name: 'serviceAccountKey',
        label: 'Service Account JSON Key',
        type: 'password',
        placeholder: 'Paste entire JSON key',
        required: true,
      },
    ],
  },
  {
    id: 'firebase',
    name: 'Firebase',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Google Firebase backend services',
    keyFormat: null,
    documentationUrl: 'https://firebase.google.com/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'Web API Key',
        type: 'password',
        placeholder: 'Enter Firebase API key',
        required: true,
      },
      {
        name: 'projectId',
        label: 'Project ID',
        type: 'text',
        placeholder: 'my-project-id',
        required: true,
      },
    ],
  },
  {
    id: 'heroku',
    name: 'Heroku',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Platform as a Service (PaaS)',
    keyFormat: null,
    documentationUrl: 'https://devcenter.heroku.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Heroku API key',
        required: true,
      },
    ],
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'CDN and web security services',
    keyFormat: null,
    documentationUrl: 'https://developers.cloudflare.com',
    fields: [
      {
        name: 'apiKey',
        label: 'Global API Key',
        type: 'password',
        placeholder: 'Enter API key',
        required: true,
      },
      {
        name: 'email',
        label: 'Account Email',
        type: 'text',
        placeholder: 'user@example.com',
        required: true,
      },
    ],
  },

  // ===== DEVOPS & CI/CD =====
  {
    id: 'github',
    name: 'GitHub',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Git hosting and DevOps platform',
    keyFormat: /^(ghp_[a-zA-Z0-9]{36,}|github_pat_[a-zA-Z0-9_]{82})$/,
    keyPrefix: 'ghp_',
    documentationUrl: 'https://docs.github.com',
    testEndpoint: 'https://api.github.com/user',
    fields: [
      {
        name: 'personalAccessToken',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'ghp_... or github_pat_...',
        required: true,
      },
    ],
  },
  {
    id: 'gitlab',
    name: 'GitLab',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Complete DevOps platform',
    keyFormat: /^glpat-[a-zA-Z0-9\-_]{20}$/,
    keyPrefix: 'glpat-',
    documentationUrl: 'https://docs.gitlab.com',
    fields: [
      {
        name: 'personalAccessToken',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'glpat-...',
        required: true,
      },
      {
        name: 'runnerToken',
        label: 'Runner Registration Token (optional)',
        type: 'password',
        placeholder: 'GR1348941...',
        required: false,
      },
    ],
  },
  {
    id: 'circleci',
    name: 'CircleCI',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Continuous integration and delivery',
    keyFormat: null,
    documentationUrl: 'https://circleci.com/docs',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter CircleCI token',
        required: true,
      },
    ],
  },
  {
    id: 'travis',
    name: 'Travis CI',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Continuous integration service',
    keyFormat: null,
    documentationUrl: 'https://docs.travis-ci.com',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter Travis CI token',
        required: true,
      },
    ],
  },
  {
    id: 'buildkite',
    name: 'Buildkite',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Fast and scalable CI/CD',
    keyFormat: null,
    documentationUrl: 'https://buildkite.com/docs',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Buildkite token',
        required: true,
      },
    ],
  },
  {
    id: 'docker',
    name: 'Docker Hub',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Container registry and management',
    keyFormat: null,
    documentationUrl: 'https://docs.docker.com',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Docker username',
        required: true,
      },
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Docker token',
        required: true,
      },
    ],
  },

  // ===== MONITORING & LOGGING =====
  {
    id: 'datadog',
    name: 'Datadog',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Monitoring and analytics platform',
    keyFormat: null,
    documentationUrl: 'https://docs.datadoghq.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Datadog API key',
        required: true,
      },
      {
        name: 'appKey',
        label: 'Application Key',
        type: 'password',
        placeholder: 'Enter application key',
        required: true,
      },
    ],
  },
  {
    id: 'newrelic',
    name: 'New Relic',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Application performance monitoring',
    keyFormat: null,
    documentationUrl: 'https://docs.newrelic.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key (NerdGraph)',
        type: 'password',
        placeholder: 'Enter New Relic API key',
        required: true,
      },
      {
        name: 'licenseKey',
        label: 'License Key',
        type: 'password',
        placeholder: 'Enter license key',
        required: false,
      },
    ],
  },
  {
    id: 'sentry',
    name: 'Sentry',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Error tracking and monitoring',
    keyFormat: null,
    documentationUrl: 'https://docs.sentry.io',
    fields: [
      {
        name: 'dsn',
        label: 'DSN',
        type: 'password',
        placeholder: 'https://xxx@sentry.io/xxx',
        required: true,
      },
      {
        name: 'authToken',
        label: 'Auth Token (optional)',
        type: 'password',
        placeholder: 'Enter auth token',
        required: false,
      },
    ],
  },
  {
    id: 'grafana',
    name: 'Grafana',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Analytics and monitoring dashboards',
    keyFormat: null,
    documentationUrl: 'https://grafana.com/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Grafana API key',
        required: true,
      },
      {
        name: 'url',
        label: 'Grafana URL',
        type: 'url',
        placeholder: 'https://your-org.grafana.net',
        required: true,
      },
    ],
  },
  {
    id: 'opsgenie',
    name: 'OpsGenie',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Incident management and alerting',
    keyFormat: null,
    documentationUrl: 'https://docs.opsgenie.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter OpsGenie API key',
        required: true,
      },
    ],
  },
  {
    id: 'pagerduty',
    name: 'PagerDuty',
    category: API_PROVIDER_CATEGORIES.MONITORING,
    description: 'Incident response platform',
    keyFormat: null,
    documentationUrl: 'https://developer.pagerduty.com',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter PagerDuty token',
        required: true,
      },
    ],
  },

  // ===== ANALYTICS & TRACKING =====
  {
    id: 'amplitude',
    name: 'Amplitude',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Product analytics platform',
    keyFormat: null,
    documentationUrl: 'https://developers.amplitude.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Amplitude API key',
        required: true,
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'Enter secret key',
        required: true,
      },
    ],
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Advanced analytics for mobile and web',
    keyFormat: null,
    documentationUrl: 'https://developer.mixpanel.com',
    fields: [
      {
        name: 'projectToken',
        label: 'Project Token',
        type: 'password',
        placeholder: 'Enter project token',
        required: true,
      },
      {
        name: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Enter API secret',
        required: false,
      },
    ],
  },
  {
    id: 'segment',
    name: 'Segment',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Customer data platform',
    keyFormat: null,
    documentationUrl: 'https://segment.com/docs',
    fields: [
      {
        name: 'writeKey',
        label: 'Write Key',
        type: 'password',
        placeholder: 'Enter write key',
        required: true,
      },
    ],
  },
  {
    id: 'abtasty',
    name: 'AB Tasty',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'A/B testing and personalization',
    keyFormat: null,
    documentationUrl: 'https://developers.abtasty.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter AB Tasty API key',
        required: true,
      },
    ],
  },
  {
    id: 'google_analytics',
    name: 'Google Analytics',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Web analytics service',
    keyFormat: null,
    documentationUrl: 'https://developers.google.com/analytics',
    fields: [
      {
        name: 'measurementId',
        label: 'Measurement ID',
        type: 'text',
        placeholder: 'G-XXXXXXXXXX',
        required: true,
      },
      {
        name: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Enter API secret',
        required: false,
      },
    ],
  },

  // ===== COMMUNICATION =====
  {
    id: 'twilio',
    name: 'Twilio',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'SMS, voice, and video communications',
    keyFormat: null,
    documentationUrl: 'https://www.twilio.com/docs',
    requiresSecret: true,
    fields: [
      {
        name: 'accountSid',
        label: 'Account SID',
        type: 'text',
        placeholder: 'AC...',
        required: true,
      },
      {
        name: 'authToken',
        label: 'Auth Token',
        type: 'password',
        placeholder: 'Enter auth token',
        required: true,
      },
    ],
  },
  {
    id: 'sendgrid',
    name: 'SendGrid',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Email delivery service',
    keyFormat: /^SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}$/,
    keyPrefix: 'SG.',
    documentationUrl: 'https://docs.sendgrid.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'SG...',
        required: true,
      },
    ],
  },
  {
    id: 'mailgun',
    name: 'Mailgun',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Email automation service',
    keyFormat: null,
    documentationUrl: 'https://documentation.mailgun.com',
    fields: [
      {
        name: 'apiKey',
        label: 'Private API Key',
        type: 'password',
        placeholder: 'Enter Mailgun API key',
        required: true,
      },
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        placeholder: 'mg.example.com',
        required: true,
      },
    ],
  },
  {
    id: 'mailchimp',
    name: 'Mailchimp',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Email marketing platform',
    keyFormat: /^[a-f0-9]{32}-us[0-9]{1,2}$/,
    documentationUrl: 'https://mailchimp.com/developer',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us1',
        required: true,
      },
    ],
  },
  {
    id: 'slack',
    name: 'Slack',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Team collaboration platform',
    keyFormat: /^xox[baprs]-[a-zA-Z0-9-]+$/,
    keyPrefix: 'xox',
    documentationUrl: 'https://api.slack.com',
    fields: [
      {
        name: 'botToken',
        label: 'Bot Token',
        type: 'password',
        placeholder: 'xoxb-...',
        required: true,
      },
      {
        name: 'webhookUrl',
        label: 'Webhook URL (optional)',
        type: 'url',
        placeholder: 'https://hooks.slack.com/services/...',
        required: false,
      },
    ],
  },
  {
    id: 'discord',
    name: 'Discord',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Community chat platform',
    keyFormat: null,
    documentationUrl: 'https://discord.com/developers',
    fields: [
      {
        name: 'botToken',
        label: 'Bot Token',
        type: 'password',
        placeholder: 'Enter Discord bot token',
        required: true,
      },
      {
        name: 'webhookUrl',
        label: 'Webhook URL (optional)',
        type: 'url',
        placeholder: 'https://discord.com/api/webhooks/...',
        required: false,
      },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Messaging platform',
    keyFormat: /^[0-9]{8,10}:[a-zA-Z0-9_-]{35}$/,
    documentationUrl: 'https://core.telegram.org/bots/api',
    fields: [
      {
        name: 'botToken',
        label: 'Bot Token',
        type: 'password',
        placeholder: '123456:ABC-DEF...',
        required: true,
      },
    ],
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: API_PROVIDER_CATEGORIES.COMMUNICATION,
    description: 'Team collaboration from Microsoft',
    keyFormat: null,
    documentationUrl: 'https://docs.microsoft.com/microsoftteams',
    fields: [
      {
        name: 'webhookUrl',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://outlook.office.com/webhook/...',
        required: true,
      },
    ],
  },

  // ===== PAYMENT PROCESSING =====
  {
    id: 'stripe',
    name: 'Stripe',
    category: API_PROVIDER_CATEGORIES.PAYMENT,
    description: 'Online payment processing',
    keyFormat: /^(sk|pk)_(test|live)_[a-zA-Z0-9]{24,}$/,
    keyPrefix: 'sk_',
    documentationUrl: 'https://stripe.com/docs/api',
    testEndpoint: 'https://api.stripe.com/v1/balance',
    fields: [
      {
        name: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'sk_live_... or sk_test_...',
        required: true,
      },
      {
        name: 'publishableKey',
        label: 'Publishable Key',
        type: 'text',
        placeholder: 'pk_live_... or pk_test_...',
        required: false,
      },
    ],
  },
  {
    id: 'paypal',
    name: 'PayPal',
    category: API_PROVIDER_CATEGORIES.PAYMENT,
    description: 'Digital payments platform',
    keyFormat: null,
    documentationUrl: 'https://developer.paypal.com',
    requiresSecret: true,
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Enter PayPal client ID',
        required: true,
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter client secret',
        required: true,
      },
    ],
  },
  {
    id: 'square',
    name: 'Square',
    category: API_PROVIDER_CATEGORIES.PAYMENT,
    description: 'Payment processing and POS',
    keyFormat: null,
    documentationUrl: 'https://developer.squareup.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Square access token',
        required: true,
      },
    ],
  },
  {
    id: 'razorpay',
    name: 'Razorpay',
    category: API_PROVIDER_CATEGORIES.PAYMENT,
    description: 'Payment gateway for India',
    keyFormat: null,
    documentationUrl: 'https://razorpay.com/docs/api',
    requiresSecret: true,
    fields: [
      {
        name: 'keyId',
        label: 'Key ID',
        type: 'text',
        placeholder: 'rzp_test_... or rzp_live_...',
        required: true,
      },
      {
        name: 'keySecret',
        label: 'Key Secret',
        type: 'password',
        placeholder: 'Enter key secret',
        required: true,
      },
    ],
  },

  // ===== MAPS & LOCATION =====
  {
    id: 'google_maps',
    name: 'Google Maps',
    category: API_PROVIDER_CATEGORIES.MAPS,
    description: 'Maps, geocoding, and location services',
    keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
    keyPrefix: 'AIza',
    documentationUrl: 'https://developers.google.com/maps',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'AIza...',
        required: true,
      },
    ],
  },
  {
    id: 'mapbox',
    name: 'Mapbox',
    category: API_PROVIDER_CATEGORIES.MAPS,
    description: 'Custom maps and location data',
    keyFormat: /^pk\.[a-zA-Z0-9_-]{60,}$/,
    keyPrefix: 'pk.',
    documentationUrl: 'https://docs.mapbox.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'pk...',
        required: true,
      },
    ],
  },
  {
    id: 'bing_maps',
    name: 'Bing Maps',
    category: API_PROVIDER_CATEGORIES.MAPS,
    description: 'Microsoft mapping service',
    keyFormat: null,
    documentationUrl: 'https://docs.microsoft.com/bingmaps',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Bing Maps API key',
        required: true,
      },
    ],
  },
  {
    id: 'ipstack',
    name: 'IPStack',
    category: API_PROVIDER_CATEGORIES.MAPS,
    description: 'IP geolocation API',
    keyFormat: null,
    documentationUrl: 'https://ipstack.com/documentation',
    fields: [
      {
        name: 'accessKey',
        label: 'Access Key',
        type: 'password',
        placeholder: 'Enter IPStack access key',
        required: true,
      },
    ],
  },
  {
    id: 'loqate',
    name: 'Loqate',
    category: API_PROVIDER_CATEGORIES.MAPS,
    description: 'Address verification and geocoding',
    keyFormat: null,
    documentationUrl: 'https://www.loqate.com/resources/support/apis',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Loqate API key',
        required: true,
      },
    ],
  },

  // ===== SOCIAL MEDIA =====
  {
    id: 'facebook',
    name: 'Facebook',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'Facebook Graph API',
    keyFormat: null,
    documentationUrl: 'https://developers.facebook.com',
    requiresSecret: true,
    fields: [
      {
        name: 'appId',
        label: 'App ID',
        type: 'text',
        placeholder: 'Enter Facebook App ID',
        required: true,
      },
      {
        name: 'appSecret',
        label: 'App Secret',
        type: 'password',
        placeholder: 'Enter app secret',
        required: true,
      },
      {
        name: 'accessToken',
        label: 'Access Token (optional)',
        type: 'password',
        placeholder: 'User or page access token',
        required: false,
      },
    ],
  },
  {
    id: 'twitter',
    name: 'Twitter (X)',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'Twitter API v2',
    keyFormat: null,
    documentationUrl: 'https://developer.twitter.com',
    fields: [
      {
        name: 'bearerToken',
        label: 'Bearer Token',
        type: 'password',
        placeholder: 'Enter bearer token',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key (optional)',
        type: 'password',
        placeholder: 'Enter API key',
        required: false,
      },
      {
        name: 'apiSecret',
        label: 'API Secret (optional)',
        type: 'password',
        placeholder: 'Enter API secret',
        required: false,
      },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'Instagram Graph API',
    keyFormat: null,
    documentationUrl: 'https://developers.facebook.com/docs/instagram-api',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Instagram access token',
        required: true,
      },
    ],
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'LinkedIn API for professional networking',
    keyFormat: null,
    documentationUrl: 'https://docs.microsoft.com/linkedin',
    requiresSecret: true,
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Enter LinkedIn client ID',
        required: true,
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter client secret',
        required: true,
      },
    ],
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'YouTube Data API',
    keyFormat: /^AIza[a-zA-Z0-9_-]{35}$/,
    documentationUrl: 'https://developers.google.com/youtube',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'AIza...',
        required: true,
      },
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'Spotify Web API',
    keyFormat: null,
    documentationUrl: 'https://developer.spotify.com',
    requiresSecret: true,
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Enter Spotify client ID',
        required: true,
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter client secret',
        required: true,
      },
    ],
  },

  // ===== SEARCH & DISCOVERY =====
  {
    id: 'algolia',
    name: 'Algolia',
    category: API_PROVIDER_CATEGORIES.SEARCH,
    description: 'Search and discovery API',
    keyFormat: null,
    documentationUrl: 'https://www.algolia.com/doc',
    fields: [
      {
        name: 'applicationId',
        label: 'Application ID',
        type: 'text',
        placeholder: 'Enter application ID',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'Admin API Key',
        type: 'password',
        placeholder: 'Enter admin API key',
        required: true,
      },
    ],
  },
  {
    id: 'elasticsearch',
    name: 'Elasticsearch',
    category: API_PROVIDER_CATEGORIES.SEARCH,
    description: 'Distributed search and analytics',
    keyFormat: null,
    documentationUrl: 'https://www.elastic.co/guide',
    fields: [
      {
        name: 'cloudId',
        label: 'Cloud ID',
        type: 'text',
        placeholder: 'Enter Elastic Cloud ID',
        required: false,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter API key',
        required: true,
      },
    ],
  },

  // ===== TESTING & QA =====
  {
    id: 'browserstack',
    name: 'BrowserStack',
    category: API_PROVIDER_CATEGORIES.TESTING,
    description: 'Cross-browser testing platform',
    keyFormat: null,
    documentationUrl: 'https://www.browserstack.com/docs',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Enter BrowserStack username',
        required: true,
      },
      {
        name: 'accessKey',
        label: 'Access Key',
        type: 'password',
        placeholder: 'Enter access key',
        required: true,
      },
    ],
  },
  {
    id: 'saucelabs',
    name: 'Sauce Labs',
    category: API_PROVIDER_CATEGORIES.TESTING,
    description: 'Continuous testing platform',
    keyFormat: null,
    documentationUrl: 'https://docs.saucelabs.com',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Enter Sauce Labs username',
        required: true,
      },
      {
        name: 'accessKey',
        label: 'Access Key',
        type: 'password',
        placeholder: 'Enter access key',
        required: true,
      },
    ],
  },
  {
    id: 'cypress',
    name: 'Cypress',
    category: API_PROVIDER_CATEGORIES.TESTING,
    description: 'End-to-end testing framework',
    keyFormat: null,
    documentationUrl: 'https://docs.cypress.io',
    fields: [
      {
        name: 'recordKey',
        label: 'Record Key',
        type: 'password',
        placeholder: 'Enter Cypress record key',
        required: true,
      },
    ],
  },

  // ===== PRODUCTIVITY & PROJECT MANAGEMENT =====
  {
    id: 'asana',
    name: 'Asana',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Work and project management',
    keyFormat: null,
    documentationUrl: 'https://developers.asana.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Personal Access Token',
        type: 'password',
        placeholder: 'Enter Asana access token',
        required: true,
      },
    ],
  },
  {
    id: 'trello',
    name: 'Trello',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Visual project management',
    keyFormat: null,
    documentationUrl: 'https://developer.atlassian.com/cloud/trello',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Trello API key',
        required: true,
      },
      {
        name: 'token',
        label: 'Token',
        type: 'password',
        placeholder: 'Enter Trello token',
        required: true,
      },
    ],
  },
  {
    id: 'notion',
    name: 'Notion',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'All-in-one workspace',
    keyFormat: /^secret_[a-zA-Z0-9]{43}$/,
    keyPrefix: 'secret_',
    documentationUrl: 'https://developers.notion.com',
    fields: [
      {
        name: 'apiKey',
        label: 'Integration Token',
        type: 'password',
        placeholder: 'secret_...',
        required: true,
      },
    ],
  },
  {
    id: 'airtable',
    name: 'Airtable',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Spreadsheet-database hybrid',
    keyFormat: /^key[a-zA-Z0-9]{14}$/,
    keyPrefix: 'key',
    documentationUrl: 'https://airtable.com/developers/web/api',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'key...',
        required: true,
      },
    ],
  },
  {
    id: 'calendly',
    name: 'Calendly',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Scheduling automation',
    keyFormat: null,
    documentationUrl: 'https://developer.calendly.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Calendly API key',
        required: true,
      },
    ],
  },
  {
    id: 'pivotaltracker',
    name: 'Pivotal Tracker',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Agile project management',
    keyFormat: null,
    documentationUrl: 'https://www.pivotaltracker.com/help/api',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter Pivotal Tracker token',
        required: true,
      },
    ],
  },

  // ===== MARKETING & CRM =====
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'CRM and enterprise cloud',
    keyFormat: null,
    documentationUrl: 'https://developer.salesforce.com',
    fields: [
      {
        name: 'consumerKey',
        label: 'Consumer Key',
        type: 'text',
        placeholder: 'Enter consumer key',
        required: true,
      },
      {
        name: 'consumerSecret',
        label: 'Consumer Secret',
        type: 'password',
        placeholder: 'Enter consumer secret',
        required: true,
      },
      {
        name: 'instanceUrl',
        label: 'Instance URL',
        type: 'url',
        placeholder: 'https://your-instance.salesforce.com',
        required: true,
      },
    ],
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'CRM and marketing platform',
    keyFormat: null,
    documentationUrl: 'https://developers.hubspot.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter HubSpot API key',
        required: true,
      },
    ],
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Customer messaging platform',
    keyFormat: null,
    documentationUrl: 'https://developers.intercom.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Intercom access token',
        required: true,
      },
    ],
  },
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Customer service platform',
    keyFormat: null,
    documentationUrl: 'https://developer.zendesk.com',
    fields: [
      {
        name: 'subdomain',
        label: 'Subdomain',
        type: 'text',
        placeholder: 'your-subdomain',
        required: true,
      },
      {
        name: 'email',
        label: 'Email',
        type: 'text',
        placeholder: 'user@example.com',
        required: true,
      },
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter API token',
        required: true,
      },
    ],
  },
  {
    id: 'freshdesk',
    name: 'Freshdesk',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Customer support software',
    keyFormat: null,
    documentationUrl: 'https://developers.freshdesk.com',
    fields: [
      {
        name: 'domain',
        label: 'Domain',
        type: 'text',
        placeholder: 'your-domain.freshdesk.com',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Freshdesk API key',
        required: true,
      },
    ],
  },
  {
    id: 'helpscout',
    name: 'Help Scout',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Customer support platform',
    keyFormat: null,
    documentationUrl: 'https://developer.helpscout.com',
    fields: [
      {
        name: 'appId',
        label: 'App ID',
        type: 'text',
        placeholder: 'Enter app ID',
        required: true,
      },
      {
        name: 'appSecret',
        label: 'App Secret',
        type: 'password',
        placeholder: 'Enter app secret',
        required: true,
      },
    ],
  },

  // ===== MEDIA & CONTENT =====
  {
    id: 'cloudinary',
    name: 'Cloudinary',
    category: API_PROVIDER_CATEGORIES.MEDIA,
    description: 'Media management and optimization',
    keyFormat: null,
    documentationUrl: 'https://cloudinary.com/documentation',
    fields: [
      {
        name: 'cloudName',
        label: 'Cloud Name',
        type: 'text',
        placeholder: 'your-cloud-name',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'text',
        placeholder: 'Enter API key',
        required: true,
      },
      {
        name: 'apiSecret',
        label: 'API Secret',
        type: 'password',
        placeholder: 'Enter API secret',
        required: true,
      },
    ],
  },
  {
    id: 'contentful',
    name: 'Contentful',
    category: API_PROVIDER_CATEGORIES.MEDIA,
    description: 'Headless CMS',
    keyFormat: null,
    documentationUrl: 'https://www.contentful.com/developers/docs',
    fields: [
      {
        name: 'spaceId',
        label: 'Space ID',
        type: 'text',
        placeholder: 'Enter space ID',
        required: true,
      },
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter access token',
        required: true,
      },
    ],
  },
  {
    id: 'buttercms',
    name: 'ButterCMS',
    category: API_PROVIDER_CATEGORIES.MEDIA,
    description: 'API-first CMS',
    keyFormat: null,
    documentationUrl: 'https://buttercms.com/docs/api',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter ButterCMS API token',
        required: true,
      },
    ],
  },
  {
    id: 'imgix',
    name: 'imgix',
    category: API_PROVIDER_CATEGORIES.MEDIA,
    description: 'Real-time image processing',
    keyFormat: null,
    documentationUrl: 'https://docs.imgix.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter imgix API key',
        required: true,
      },
    ],
  },
  {
    id: 'vimeo',
    name: 'Vimeo',
    category: API_PROVIDER_CATEGORIES.MEDIA,
    description: 'Video hosting and streaming',
    keyFormat: null,
    documentationUrl: 'https://developer.vimeo.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Vimeo access token',
        required: true,
      },
    ],
  },

  // ===== SECURITY & INFRASTRUCTURE =====
  {
    id: 'sonarcloud',
    name: 'SonarCloud',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Code quality and security',
    keyFormat: null,
    documentationUrl: 'https://docs.sonarcloud.io',
    fields: [
      {
        name: 'token',
        label: 'Token',
        type: 'password',
        placeholder: 'Enter SonarCloud token',
        required: true,
      },
    ],
  },
  {
    id: 'snyk',
    name: 'Snyk',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Security and vulnerability scanning',
    keyFormat: null,
    documentationUrl: 'https://docs.snyk.io',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter Snyk API token',
        required: true,
      },
    ],
  },
  {
    id: 'shodan',
    name: 'Shodan',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Internet-connected device search',
    keyFormat: null,
    documentationUrl: 'https://developer.shodan.io',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Shodan API key',
        required: true,
      },
    ],
  },
  {
    id: 'infura',
    name: 'Infura',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Ethereum and IPFS infrastructure',
    keyFormat: null,
    documentationUrl: 'https://docs.infura.io',
    fields: [
      {
        name: 'projectId',
        label: 'Project ID',
        type: 'text',
        placeholder: 'Enter project ID',
        required: true,
      },
      {
        name: 'projectSecret',
        label: 'Project Secret',
        type: 'password',
        placeholder: 'Enter project secret',
        required: true,
      },
    ],
  },

  // ===== WEBHOOKS & AUTOMATION =====
  {
    id: 'zapier',
    name: 'Zapier',
    category: API_PROVIDER_CATEGORIES.WEBHOOKS,
    description: 'Workflow automation',
    keyFormat: null,
    documentationUrl: 'https://zapier.com/developer',
    fields: [
      {
        name: 'webhookUrl',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://hooks.zapier.com/hooks/catch/...',
        required: true,
      },
    ],
  },
  {
    id: 'ifttt',
    name: 'IFTTT',
    category: API_PROVIDER_CATEGORIES.WEBHOOKS,
    description: 'Connect apps and devices',
    keyFormat: null,
    documentationUrl: 'https://ifttt.com/docs',
    fields: [
      {
        name: 'webhookKey',
        label: 'Webhook Key',
        type: 'password',
        placeholder: 'Enter IFTTT webhook key',
        required: true,
      },
    ],
  },
  {
    id: 'n8n',
    name: 'n8n',
    category: API_PROVIDER_CATEGORIES.WEBHOOKS,
    description: 'Workflow automation platform',
    keyFormat: null,
    documentationUrl: 'https://docs.n8n.io',
    fields: [
      {
        name: 'webhookUrl',
        label: 'Webhook URL',
        type: 'url',
        placeholder: 'https://your-n8n-instance.com/webhook/...',
        required: true,
      },
      {
        name: 'apiKey',
        label: 'API Key (optional)',
        type: 'password',
        placeholder: 'Enter API key',
        required: false,
      },
    ],
  },

  // ===== OTHER SERVICES =====
  {
    id: 'bitly',
    name: 'Bitly',
    category: API_PROVIDER_CATEGORIES.WEBHOOKS,
    description: 'URL shortening and link management',
    keyFormat: null,
    documentationUrl: 'https://dev.bitly.com',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Bitly access token',
        required: true,
      },
    ],
  },
  {
    id: 'branch',
    name: 'Branch.io',
    category: API_PROVIDER_CATEGORIES.WEBHOOKS,
    description: 'Deep linking platform',
    keyFormat: null,
    documentationUrl: 'https://help.branch.io/developers-hub',
    fields: [
      {
        name: 'branchKey',
        label: 'Branch Key',
        type: 'password',
        placeholder: 'key_live_... or key_test_...',
        required: true,
      },
      {
        name: 'branchSecret',
        label: 'Branch Secret',
        type: 'password',
        placeholder: 'Enter branch secret',
        required: true,
      },
    ],
  },
  {
    id: 'recaptcha',
    name: 'Google reCAPTCHA',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Bot and spam protection',
    keyFormat: null,
    documentationUrl: 'https://developers.google.com/recaptcha',
    fields: [
      {
        name: 'siteKey',
        label: 'Site Key',
        type: 'text',
        placeholder: 'Enter site key',
        required: true,
      },
      {
        name: 'secretKey',
        label: 'Secret Key',
        type: 'password',
        placeholder: 'Enter secret key',
        required: true,
      },
    ],
  },
  {
    id: 'dropbox',
    name: 'Dropbox',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Cloud storage and file sharing',
    keyFormat: null,
    documentationUrl: 'https://www.dropbox.com/developers',
    fields: [
      {
        name: 'accessToken',
        label: 'Access Token',
        type: 'password',
        placeholder: 'Enter Dropbox access token',
        required: true,
      },
    ],
  },
  {
    id: 'wakatime',
    name: 'WakaTime',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Automatic time tracking for programmers',
    keyFormat: null,
    documentationUrl: 'https://wakatime.com/developers',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter WakaTime API key',
        required: true,
      },
    ],
  },
  {
    id: 'weglot',
    name: 'Weglot',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Website translation service',
    keyFormat: null,
    documentationUrl: 'https://developers.weglot.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'wg_...',
        required: true,
      },
    ],
  },
  {
    id: 'wpengine',
    name: 'WP Engine',
    category: API_PROVIDER_CATEGORIES.CLOUD,
    description: 'Managed WordPress hosting',
    keyFormat: null,
    documentationUrl: 'https://wpengineapi.com',
    fields: [
      {
        name: 'username',
        label: 'Username',
        type: 'text',
        placeholder: 'Enter WP Engine username',
        required: true,
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        placeholder: 'Enter password',
        required: true,
      },
    ],
  },
  {
    id: 'bazaarvoice',
    name: 'Bazaarvoice',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Ratings and reviews platform',
    keyFormat: null,
    documentationUrl: 'https://developer.bazaarvoice.com',
    fields: [
      {
        name: 'passkey',
        label: 'Passkey',
        type: 'password',
        placeholder: 'Enter Bazaarvoice passkey',
        required: true,
      },
    ],
  },
  {
    id: 'deviantart',
    name: 'DeviantArt',
    category: API_PROVIDER_CATEGORIES.SOCIAL,
    description: 'Art community and platform',
    keyFormat: null,
    documentationUrl: 'https://www.deviantart.com/developers',
    fields: [
      {
        name: 'clientId',
        label: 'Client ID',
        type: 'text',
        placeholder: 'Enter client ID',
        required: true,
      },
      {
        name: 'clientSecret',
        label: 'Client Secret',
        type: 'password',
        placeholder: 'Enter client secret',
        required: true,
      },
    ],
  },
  {
    id: 'delighted',
    name: 'Delighted',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Customer feedback and NPS',
    keyFormat: null,
    documentationUrl: 'https://app.delighted.com/docs/api',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Delighted API key',
        required: true,
      },
    ],
  },
  {
    id: 'iterable',
    name: 'Iterable',
    category: API_PROVIDER_CATEGORIES.MARKETING,
    description: 'Cross-channel marketing platform',
    keyFormat: null,
    documentationUrl: 'https://api.iterable.com/api/docs',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter Iterable API key',
        required: true,
      },
    ],
  },
  {
    id: 'jumpcloud',
    name: 'JumpCloud',
    category: API_PROVIDER_CATEGORIES.SECURITY,
    description: 'Directory-as-a-Service platform',
    keyFormat: null,
    documentationUrl: 'https://docs.jumpcloud.com',
    fields: [
      {
        name: 'apiKey',
        label: 'API Key',
        type: 'password',
        placeholder: 'Enter JumpCloud API key',
        required: true,
      },
    ],
  },
  {
    id: 'keen',
    name: 'Keen.io',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Event streaming platform',
    keyFormat: null,
    documentationUrl: 'https://keen.io/docs',
    fields: [
      {
        name: 'projectId',
        label: 'Project ID',
        type: 'text',
        placeholder: 'Enter project ID',
        required: true,
      },
      {
        name: 'writeKey',
        label: 'Write Key',
        type: 'password',
        placeholder: 'Enter write key',
        required: true,
      },
      {
        name: 'readKey',
        label: 'Read Key',
        type: 'password',
        placeholder: 'Enter read key',
        required: false,
      },
    ],
  },
  {
    id: 'lokalise',
    name: 'Lokalise',
    category: API_PROVIDER_CATEGORIES.PRODUCTIVITY,
    description: 'Translation management system',
    keyFormat: null,
    documentationUrl: 'https://developers.lokalise.com',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter Lokalise API token',
        required: true,
      },
    ],
  },
  {
    id: 'pendo',
    name: 'Pendo',
    category: API_PROVIDER_CATEGORIES.ANALYTICS,
    description: 'Product analytics and guidance',
    keyFormat: null,
    documentationUrl: 'https://developers.pendo.io',
    fields: [
      {
        name: 'integrationKey',
        label: 'Integration Key',
        type: 'password',
        placeholder: 'Enter Pendo integration key',
        required: true,
      },
    ],
  },
  {
    id: 'appcenter',
    name: 'Visual Studio App Center',
    category: API_PROVIDER_CATEGORIES.DEVOPS,
    description: 'Mobile app lifecycle management',
    keyFormat: null,
    documentationUrl: 'https://docs.microsoft.com/appcenter',
    fields: [
      {
        name: 'apiToken',
        label: 'API Token',
        type: 'password',
        placeholder: 'Enter App Center API token',
        required: true,
      },
    ],
  },
];

/**
 * Helper function to get provider by ID
 */
export function getProviderById(id: string): APIProvider | undefined {
  return API_PROVIDERS.find((p) => p.id === id);
}

/**
 * Helper function to get providers by category
 */
export function getProvidersByCategory(category: string): APIProvider[] {
  return API_PROVIDERS.filter((p) => p.category === category);
}

/**
 * Helper function to validate API key format
 */
export function validateKeyFormat(providerId: string, key: string): boolean {
  const provider = getProviderById(providerId);
  if (!provider || !provider.keyFormat) return true; // No validation if no format specified
  return provider.keyFormat.test(key);
}

/**
 * Helper function to get all categories
 */
export function getAllCategories(): string[] {
  return Object.values(API_PROVIDER_CATEGORIES);
}

/**
 * Helper function to search providers
 */
export function searchProviders(query: string): APIProvider[] {
  const lowerQuery = query.toLowerCase();
  return API_PROVIDERS.filter(
    (p) =>
      p.name.toLowerCase().includes(lowerQuery) ||
      p.description.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery)
  );
}
