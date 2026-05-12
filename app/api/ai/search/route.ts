import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { query } = await request.json()
  if (!query) return NextResponse.json({ error: 'Query required' }, { status: 400 })

  try {
    if (process.env.BRAVE_API_KEY) {
      const res = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`, {
        headers: { 'Accept': 'application/json', 'X-Subscription-Token': process.env.BRAVE_API_KEY },
      })
      const data = await res.json()
      const results = (data.web?.results ?? []).map((r: { title: string; url: string; description: string }) => ({
        title: r.title, url: r.url, snippet: r.description,
      }))
      return NextResponse.json({ results, source: 'brave' })
    }

    // Fallback: DuckDuckGo (no key needed)
    const res = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`)
    const data = await res.json()
    const results = []
    if (data.AbstractText) results.push({ title: data.Heading, url: data.AbstractURL, snippet: data.AbstractText })
    for (const topic of (data.RelatedTopics ?? []).slice(0, 4)) {
      if (topic.Text && topic.FirstURL) results.push({ title: topic.Text.split(' - ')[0], url: topic.FirstURL, snippet: topic.Text })
    }
    return NextResponse.json({ results, source: 'duckduckgo' })
  } catch (error) {
    return NextResponse.json({ error: 'Search failed', details: String(error) }, { status: 500 })
  }
}
