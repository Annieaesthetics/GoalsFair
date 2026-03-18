import { Redis } from '@upstash/redis'

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function rateLimit(
  identifier: string,
  limit: number = 60,
  window: number = 60
): Promise<{ success: boolean; remaining: number; reset: number }> {
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

  const success = count <= limit
  const remaining = Math.max(0, limit - count)
  const reset = Math.ceil((now + window * 1000) / 1000)

  return { success, remaining, reset }
}
