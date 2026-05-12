export type ModelProvider = {
  id: string
  name: string
  provider: string
  envKey: string
  description: string
  maxTokens: number
  supportsTools: boolean
}

export const ALL_MODELS: ModelProvider[] = [
  { id: 'groq/llama-3.3-70b-versatile',     name: 'Llama 3.3 70B',         provider: 'Groq',        envKey: 'GROQ_API_KEY',        description: 'Fast & powerful',      maxTokens: 8192,  supportsTools: true },
  { id: 'groq/llama-3.1-8b-instant',        name: 'Llama 3.1 8B Instant',  provider: 'Groq',        envKey: 'GROQ_API_KEY',        description: 'Ultra fast',           maxTokens: 8192,  supportsTools: true },
  { id: 'groq/mixtral-8x7b-32768',          name: 'Mixtral 8x7B',          provider: 'Groq',        envKey: 'GROQ_API_KEY',        description: 'Balanced',             maxTokens: 32768, supportsTools: false },
  { id: 'anthropic/claude-3-5-haiku',       name: 'Claude 3.5 Haiku',      provider: 'Anthropic',   envKey: 'ANTHROPIC_API_KEY',   description: 'Fast & smart',         maxTokens: 8192,  supportsTools: true },
  { id: 'anthropic/claude-3-5-sonnet',      name: 'Claude 3.5 Sonnet',     provider: 'Anthropic',   envKey: 'ANTHROPIC_API_KEY',   description: 'Most intelligent',     maxTokens: 8192,  supportsTools: true },
  { id: 'mistral/mistral-small-latest',     name: 'Mistral Small',         provider: 'Mistral',     envKey: 'MISTRAL_API_KEY',     description: 'Efficient',            maxTokens: 8192,  supportsTools: true },
  { id: 'mistral/mistral-large-latest',     name: 'Mistral Large',         provider: 'Mistral',     envKey: 'MISTRAL_API_KEY',     description: 'High quality',         maxTokens: 8192,  supportsTools: true },
  { id: 'openai/gpt-4o-mini',               name: 'GPT-4o Mini',           provider: 'OpenAI',      envKey: 'OPENAI_API_KEY',      description: 'Fast & affordable',    maxTokens: 16384, supportsTools: true },
  { id: 'openai/gpt-4o',                    name: 'GPT-4o',                provider: 'OpenAI',      envKey: 'OPENAI_API_KEY',      description: 'Most capable',         maxTokens: 16384, supportsTools: true },
  { id: 'xai/grok-beta',                    name: 'Grok Beta',             provider: 'xAI',         envKey: 'XAI_API_KEY',         description: 'Real-time knowledge',  maxTokens: 8192,  supportsTools: true },
  { id: 'openrouter/auto',                  name: 'OpenRouter Auto',       provider: 'OpenRouter',  envKey: 'OPENROUTER_API_KEY',  description: 'Best model auto-pick', maxTokens: 8192,  supportsTools: true },
  { id: 'cohere/command-r-plus',            name: 'Command R+',            provider: 'Cohere',      envKey: 'COHERE_API_KEY',      description: 'RAG optimized',        maxTokens: 4096,  supportsTools: true },
  { id: 'together/meta-llama/Llama-3-70b',  name: 'Llama 3 70B',           provider: 'Together AI', envKey: 'TOGETHER_API_KEY',    description: 'Open source power',    maxTokens: 8192,  supportsTools: false },
  { id: 'google/gemini-1.5-flash',          name: 'Gemini 1.5 Flash',      provider: 'Google',      envKey: 'GOOGLE_AI_API_KEY',   description: 'Multimodal fast',      maxTokens: 8192,  supportsTools: true },
  { id: 'perplexity/llama-3.1-sonar-large', name: 'Sonar Large',           provider: 'Perplexity',  envKey: 'PERPLEXITY_API_KEY',  description: 'Web search built-in',  maxTokens: 8192,  supportsTools: false },
]

export function getAvailableModels(): (ModelProvider & { available: boolean })[] {
  return ALL_MODELS.map(m => ({ ...m, available: !!process.env[m.envKey] }))
}

export function getDefaultModel(): string {
  const available = ALL_MODELS.find(m => !!process.env[m.envKey])
  return available?.id ?? 'groq/llama-3.3-70b-versatile'
}
