import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/utils/rate-limit'
import { buildUserContext } from '@/lib/utils/ai-context'
import Groq from 'groq-sdk'
import { Mistral } from '@mistralai/mistralai'
import Anthropic from '@anthropic-ai/sdk'

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })
const mistral = new Mistral({ apiKey: process.env.MISTRAL_API_KEY })
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(_request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { success } = await rateLimit(`ai:${user.id}`, 10, 86400)
    if (!success) return NextResponse.json({ error: 'Daily AI limit reached (10/day). Try again tomorrow.' }, { status: 429 })

    const context = await buildUserContext(supabase, user.id)

    const prompt = `${context}

=== YOUR TASK ===
Based on everything above, provide a personalized coaching insight in 3-4 sentences:
1. Acknowledge one specific achievement or positive pattern you notice
2. Identify the single most important thing to focus on right now (be specific, reference actual goal/habit names)
3. Give one concrete actionable tip for today or this week

Be warm, specific, and motivating. Reference actual data from their profile.`

    const encoder = new TextEncoder()

    if (process.env.GROQ_API_KEY) {
      try {
        const stream = await groq.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 250,
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
          messages: [{ role: 'user', content: prompt }],
          maxTokens: 250,
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
        max_tokens: 250,
        messages: [{ role: 'user', content: prompt }],
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

    return NextResponse.json({ error: 'No AI provider configured' }, { status: 503 })
  } catch (error) {
    console.error('AI coaching error:', error)
    return NextResponse.json({ error: 'AI service unavailable' }, { status: 500 })
  }
}
