import { Redis } from '@upstash/redis'

const url = process.env.UPSTASH_REDIS_REST_URL
const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.UPSTASH_API_KEY

let redis: Redis | null = null
if (url && token) {
  redis = new Redis({ url, token })
}

export async function rateLimit(
  identifier: string,
  limit: number = 60,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
  // If Redis not configured, allow all requests
  if (!redis) {
    return { success: true, remaining: limit, reset: Date.now() + window * 1000 }
  }

  const key = `rate_limit:${identifier}`
  const now = Date.now()
  const windowStart = now - window * 1000

  const pipeline = redis.pipeline()
  pipeline.zremrangebyscore(key, 0, windowStart)
  pipeline.zadd(key, { score: now, member: `${now}` })
  pipeline.zcard(key)
  pipeline.expire(key, window)

  const results = await pipeline.exec()
  const count = results[2] as number

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
    reset: Math.ceil((now + window * 1000) / 1000),
  }
}
