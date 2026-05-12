import { createClient } from '@/lib/supabase/server'
import Groq from 'groq-sdk'
import { Mistral } from '@mistralai/mistralai'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/utils/rate-limit'
import { buildUserContext } from '@/lib/utils/ai-context'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

type Message = { role: 'user' | 'assistant'; content: string }

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { success } = await rateLimit(`ai-chat:${user.id}`, 50, 86400)
    if (!success) return new Response(JSON.stringify({ error: 'Daily limit reached (50 messages/day)' }), { status: 429 })

    const { messages }: { messages: Message[] } = await request.json()

    // Build rich context with all user data + current time
    const context = await buildUserContext(supabase, user.id)

    const systemPrompt = `You are an expert personal goal coach with full access to the user's data. Use this context to give highly personalized, specific advice.

${context}

=== COACHING GUIDELINES ===
- Always reference specific goal names, habit names, and real numbers from the data above
- Be aware of the current time and day — mention if it's a good time to work on specific habits
- If a goal is overdue, acknowledge it sensitively and help them get back on track
- If they ask about progress, give exact percentages and amounts from the data
- Keep responses concise (under 150 words) unless they ask for detail
- Be warm, encouraging, and action-oriented`

    const chatMessages = messages.map(m => ({ role: m.role, content: m.content }))
    const encoder = new TextEncoder()

    if (process.env.GROQ_API_KEY) {
      try {
        const stream = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          max_tokens: 400,
          stream: true,
        })
        const readable = new ReadableStream({
          async start(controller) {
            for await (const chunk of stream) {
              const text = chunk.choices[0]?.delta?.content
              if (text) controller.enqueue(encoder.encode(text))
            }
            controller.close()
          },
        })
        return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      } catch (e) { console.warn('Groq failed:', e) }
    }

    if (process.env.MISTRAL_API_KEY) {
      try {
        const stream = await mistral.chat.stream({
          model: 'mistral-small-latest',
          messages: [{ role: 'system', content: systemPrompt }, ...chatMessages],
          maxTokens: 400,
        })
        const readable = new ReadableStream({
          async start(controller) {
            for await (const chunk of stream) {
              const text = chunk.data.choices[0]?.delta?.content
              if (text && typeof text === 'string') controller.enqueue(encoder.encode(text))
            }
            controller.close()
          },
        })
        return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
      } catch (e) { console.warn('Mistral failed:', e) }
    }

    if (process.env.ANTHROPIC_API_KEY) {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 400,
        system: systemPrompt,
        messages: chatMessages,
      })
      const readable = new ReadableStream({
        async start(controller) {
          for await (const chunk of stream) {
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              controller.enqueue(encoder.encode(chunk.delta.text))
            }
          }
          controller.close()
        },
      })
      return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
    }

    return new Response(JSON.stringify({ error: 'No AI provider configured' }), { status: 503 })
  } catch (error) {
    console.error('Chat error:', error)
    return new Response(JSON.stringify({ error: 'AI service unavailable' }), { status: 500 })
  }
}
