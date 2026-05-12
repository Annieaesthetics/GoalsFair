import Groq from 'groq-sdk'
import Anthropic from '@anthropic-ai/sdk'
import { Mistral } from '@mistralai/mistralai'

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

// Ordered fallback chain — tries each in order until one succeeds
const FALLBACK_CHAIN = [
  { provider: 'groq',      model: 'llama-3.3-70b-versatile',  envKey: 'GROQ_API_KEY' },
  { provider: 'mistral',   model: 'mistral-small-latest',      envKey: 'MISTRAL_API_KEY' },
  { provider: 'anthropic', model: 'claude-3-5-haiku',          envKey: 'ANTHROPIC_API_KEY' },
  { provider: 'openai',    model: 'gpt-4o-mini',               envKey: 'OPENAI_API_KEY' },
]

async function* streamGroq(model: string, messages: Message[], maxTokens: number): AsyncGenerator<string> {
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
  const s = await groq.chat.completions.create({ model, messages, max_tokens: maxTokens, stream: true })
  for await (const chunk of s) {
    const text = chunk.choices[0]?.delta?.content
    if (text) yield text
  }
}

async function* streamMistral(model: string, messages: Message[], maxTokens: number): AsyncGenerator<string> {
  const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
  const s = await mistral.chat.stream({ model, messages, maxTokens })
  for await (const chunk of s) {
    const text = chunk.data.choices[0]?.delta?.content
    if (text && typeof text === 'string') yield text
  }
}

async function* streamAnthropic(model: string, messages: Message[], systemPrompt: string, maxTokens: number): AsyncGenerator<string> {
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  const modelId = model === 'claude-3-5-haiku' ? 'claude-3-5-haiku-20241022' : 'claude-3-5-sonnet-20241022'
  const s = await anthropic.messages.stream({
    model: modelId,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: messages.filter(m => m.role !== 'system').map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
  })
  for await (const chunk of s) {
    if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') yield chunk.delta.text
  }
}

async function* streamOpenAI(model: string, messages: Message[], maxTokens: number): AsyncGenerator<string> {
  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENAI_API_KEY}` },
    body: JSON.stringify({ model, messages, max_tokens: maxTokens, stream: true }),
  })
  if (!res.ok) throw new Error(`OpenAI ${res.status}`)
  const reader = res.body?.getReader()
  const dec = new TextDecoder()
  if (!reader) return
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]')) {
      try { const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content; if (text) yield text } catch { /* skip */ }
    }
  }
}

async function* streamXAI(messages: Message[], maxTokens: number): AsyncGenerator<string> {
  const res = await fetch('https://api.x.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.XAI_API_KEY}` },
    body: JSON.stringify({ model: 'grok-beta', messages, max_tokens: maxTokens, stream: true }),
  })
  if (!res.ok) throw new Error(`xAI ${res.status}`)
  const reader = res.body?.getReader()
  const dec = new TextDecoder()
  if (!reader) return
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]')) {
      try { const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content; if (text) yield text } catch { /* skip */ }
    }
  }
}

async function* streamOpenRouter(model: string, messages: Message[], maxTokens: number): AsyncGenerator<string> {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`, 'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000' },
    body: JSON.stringify({ model: model === 'auto' ? 'auto' : model, messages, max_tokens: maxTokens, stream: true }),
  })
  if (!res.ok) throw new Error(`OpenRouter ${res.status}`)
  const reader = res.body?.getReader()
  const dec = new TextDecoder()
  if (!reader) return
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    for (const line of dec.decode(value).split('\n').filter(l => l.startsWith('data: ') && l !== 'data: [DONE]')) {
      try { const text = JSON.parse(line.slice(6)).choices?.[0]?.delta?.content; if (text) yield text } catch { /* skip */ }
    }
  }
}

// Try a specific provider, throw on rate limit or error
async function tryProvider(
  provider: string,
  model: string,
  messages: Message[],
  systemPrompt: string,
  maxTokens: number
): Promise<AsyncGenerator<string>> {
  const allMessages = [{ role: 'system' as const, content: systemPrompt }, ...messages]

  switch (provider) {
    case 'groq':      return streamGroq(model, allMessages, maxTokens)
    case 'mistral':   return streamMistral(model, allMessages, maxTokens)
    case 'anthropic': return streamAnthropic(model, messages, systemPrompt, maxTokens)
    case 'openai':    return streamOpenAI(model, allMessages, maxTokens)
    case 'xai':       return streamXAI(allMessages, maxTokens)
    case 'openrouter':return streamOpenRouter(model, allMessages, maxTokens)
    default: throw new Error(`Unknown provider: ${provider}`)
  }
}

export async function callLLM(
  modelId: string,
  messages: Message[],
  systemPrompt: string,
  maxTokens = 800,
): Promise<Response> {
  const [provider] = modelId.split('/')
  const model = modelId.split('/').slice(1).join('/')
  const encoder = new TextEncoder()

  // Build fallback list: requested model first, then fallback chain
  const toTry = [
    { provider, model },
    ...FALLBACK_CHAIN.filter(f => f.provider !== provider && !!process.env[f.envKey]),
  ]

  let lastError: Error | null = null

  for (const candidate of toTry) {
    try {
      const generator = await tryProvider(candidate.provider, candidate.model, messages, systemPrompt, maxTokens)

      // Prefix with fallback notice if not the primary model
      const isFallback = candidate.provider !== provider
      const prefix = isFallback
        ? `[Using ${candidate.provider}/${candidate.model} — ${provider} rate limited]\n\n`
        : ''

      return new Response(
        new ReadableStream({
          async start(controller) {
            if (prefix) controller.enqueue(encoder.encode(prefix))
            try {
              for await (const text of generator) {
                controller.enqueue(encoder.encode(text))
              }
            } catch (e) {
              controller.enqueue(encoder.encode(`\n\n[Stream error: ${String(e)}]`))
            }
            controller.close()
          },
        }),
        { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
      )
    } catch (e) {
      const err = e as Error
      const isRateLimit = err.message?.includes('429') || err.message?.includes('rate') || err.message?.includes('Rate limit')
      console.warn(`[LLM] ${candidate.provider} failed (${isRateLimit ? 'rate limit' : 'error'}), trying next...`)
      lastError = err
      if (!isRateLimit) break // Only fallback on rate limits, not auth errors
    }
  }

  // All providers failed
  const errMsg = lastError?.message ?? 'All AI providers unavailable'
  return new Response(
    new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode(`Sorry, all AI providers are currently unavailable. Error: ${errMsg}`))
        controller.close()
      },
    }),
    { headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
  )
}
