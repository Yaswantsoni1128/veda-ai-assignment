// Template: Upstash Redis client using @upstash/redis
// Install with: npm install @upstash/redis
// Add these env vars to your Backend/.env (do NOT commit .env):
// UPSTASH_REDIS_REST_URL=https://<your-upstash-id>.upstash.io
// UPSTASH_REDIS_REST_TOKEN=<your-token>

import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_REST_URL || "https://regular-drake-86569.upstash.io";
const token = process.env.UPSTASH_REDIS_REST_TOKEN || "gQAAAAAAAVIpAAIgcDExMjJlODhiYjFiOGU0ZTFkODAwMmQyYWZmODA5ZjkyYQ";

const client = new Redis({ url, token });

// Convenience wrappers used in this project (keeps calling code small)
export async function upstashGet(key: string) {
  // returns null if key not found
  return client.get(key) as Promise<string | null>;
}

export async function upstashSet(key: string, value: string) {
  return client.set(key, value);
}

export async function upstashSetEx(key: string, ttlSeconds: number, value: string) {
  // set value then set TTL
  await client.set(key, value);
  await client.expire(key, ttlSeconds);
  return 'OK';
}

export default client;

// Example usage (inside an async function):
// await upstashSet('foo', 'bar');
// const v = await upstashGet('foo');
// await upstashSetEx('paper:123', 3600, JSON.stringify(paper));
