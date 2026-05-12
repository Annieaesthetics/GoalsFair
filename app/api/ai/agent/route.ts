import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/utils/rate-limit'
import { buildAgentSystemPrompt, parseToolCalls } from '@/lib/ai/agent'
import { getToolByName } from '@/lib/ai/tools'
import { callLLM } from '@/lib/ai/llm'
import { getDefaultModel } from '@/lib/ai/models'
import { NextResponse } from 'next/server'

type Message = { role: 'user' | 'assistant' | 'system'; content: string }

const MAX_ITERATIONS = 5

// Execute a tool server-side and return result string
async function runTool(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _supabase: any,
  _userId: string,
  tool: string,
  params: Record<string, unknown>,
  conversationId: string | undefined,
  baseUrl: string,
  cookie: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${baseUrl}/api/ai/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie },
      body: JSON.stringify({ tool, params, conversationId }),
    })
    const data = await res.json()
    return { success: res.ok && data.success !== false, message: data.message ?? data.error ?? 'Done' }
  } catch (e) {
    return { success: false, message: String(e) }
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return new Response('Unauthorized', { status: 401 })

    const { success } = await rateLimit(`agent:${user.id}`, 100, 86400)
    if (!success) return NextResponse.json({ error: 'Daily limit reached (100 messages/day)' }, { status: 429 })

    const {
      messages: initialMessages,
      conversationId,
      mode = 'chat',
      modelId,
      // Tool result injected from client after user confirms an action
      toolResult,
    }: {
      messages: Message[]
      conversationId?: string
      mode: 'chat' | 'agent'
      modelId?: string
      toolResult?: { tool: string; result: string; success: boolean }
    } = await request.json()

    const selectedModel = modelId ?? getDefaultModel()
    const systemPrompt = await buildAgentSystemPrompt(supabase, user.id, mode)
    const cookie = request.headers.get('cookie') ?? ''
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

    // Save user message to history (only on first call, not tool-result follow-ups)
    if (conversationId && !toolResult) {
      const lastUserMsg = initialMessages[initialMessages.length - 1]
      if (lastUserMsg?.role === 'user') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (supabase.from('ai_messages') as any).insert({
          conversation_id: conversationId,
          user_id: user.id,
          role: 'user',
          content: lastUserMsg.content,
        })
      }
    }

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        const send = (text: string) => controller.enqueue(encoder.encode(text))

        // Build message history — if this is a tool-result follow-up, inject it
        let messages: Message[] = toolResult
          ? [
              ...initialMessages,
              {
                role: 'assistant' as const,
                content: `[Tool result for ${toolResult.tool}]: ${toolResult.success ? '✓' : '✗'} ${toolResult.result}`,
              },
            ]
          : initialMessages

        let iteration = 0

        while (iteration < MAX_ITERATIONS) {
          iteration++

          const llmResponse = await callLLM(selectedModel, messages.slice(-10), systemPrompt, 600)
          if (!llmResponse.ok) {
            send(`\n\n__ERROR__LLM call failed__END_ERROR__`)
            break
          }

          // Stream this turn's text to client
          const reader = llmResponse.body?.getReader()
          if (!reader) break

          const decoder = new TextDecoder()
          let fullText = ''

          // Send turn separator for iterations > 1 so client knows a new response is starting
          if (iteration > 1) {
            send(`\n\n__NEW_TURN__`)
          }

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value)
            fullText += chunk
            // Stream text but hold back tool_calls block
            if (!fullText.includes('<tool_calls>')) {
              send(chunk)
            }
          }

          const { cleanText, toolCalls } = parseToolCalls(fullText)

          // If we held back streaming due to tool_calls, send the clean text now
          if (fullText.includes('<tool_calls>')) {
            send(cleanText)
          }

          // Save this assistant turn to history
          if (conversationId) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (supabase.from('ai_messages') as any).insert({
              conversation_id: conversationId,
              user_id: user.id,
              role: 'assistant',
              content: cleanText || fullText,
              tool_call: toolCalls.length > 0 ? toolCalls : null,
            })
          }

          // No tool calls — agent is done
          if (toolCalls.length === 0 || mode !== 'agent') break

          // Classify tools: silent/auto-execute vs needs confirmation
          const autoTools = toolCalls.filter(tc => {
            const def = getToolByName(tc.tool)
            return def?.requiresConfirmation === 'silent'
          })
          const confirmTools = toolCalls.filter(tc => {
            const def = getToolByName(tc.tool)
            return def?.requiresConfirmation !== 'silent'
          })

          // Execute silent tools immediately and feed results back
          const toolResultMessages: string[] = []
          for (const tc of autoTools) {
            send(`\n\n__TOOL_RUNNING__${tc.tool}__END_TOOL_RUNNING__`)
            const res = await runTool(supabase, user.id, tc.tool, tc.params, conversationId, baseUrl, cookie)
            const resultLine = `[Tool: ${tc.tool}] ${res.success ? '✓' : '✗'} ${res.message}`
            toolResultMessages.push(resultLine)
            send(`\n\n__TOOL_RESULT__${JSON.stringify({ tool: tc.tool, ...res })}__END_TOOL_RESULT__`)
          }

          // If there are tools needing confirmation, send them to client and stop looping
          if (confirmTools.length > 0) {
            const pendingActions = confirmTools.map(tc => {
              const toolDef = getToolByName(tc.tool)
              return {
                tool: tc.tool,
                params: tc.params,
                reason: tc.reason,
                requiresConfirmation: toolDef?.requiresConfirmation ?? 'always_allow',
                description: toolDef?.description ?? tc.tool,
                agentName: toolDef?.agent ?? 'action',
              }
            })
            send(`\n\n__PENDING_ACTIONS__${JSON.stringify(pendingActions)}__END_ACTIONS__`)
            break
          }

          // If only silent tools ran, inject results and loop for agent to continue
          if (toolResultMessages.length > 0) {
            messages = [
              ...messages,
              { role: 'assistant' as const, content: cleanText },
              { role: 'user' as const, content: `Tool results:\n${toolResultMessages.join('\n')}\n\nContinue based on these results. If everything succeeded, summarize what was done and suggest next steps. If something failed, explain and self-correct.` },
            ]
            continue
          }

          break
        }

        // Update conversation timestamp
        if (conversationId) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (supabase.from('ai_conversations') as any)
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId)
        }

        controller.close()
      },
    })

    return new Response(readable, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } })
  } catch (error) {
    console.error('Agent error:', error)
    return NextResponse.json({ error: 'Agent unavailable' }, { status: 500 })
  }
}
