import { Redis } from "ioredis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// If Upstash REST URL + token are provided, use the Upstash HTTP API for simple
// get/setex/del commands. Otherwise fall back to a normal ioredis client.
let client: any;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  const base = UPSTASH_URL.replace(/\/+$/g, "");
  console.log("Using Upstash REST Redis at:", base);

  async function upstashCmd(command: string[]) {
    const res = await fetch(`${base}/commands`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ command }),
    });
    const json = await res.json();
    if (!res.ok) {
      const err = (json && json.error) || `Upstash error: ${res.status}`;
      throw new Error(err);
    }
    return json;
  }

  client = {
    async get(key: string) {
      const r = await upstashCmd(["GET", key]);
      // Upstash returns result in `result` field
      return r?.result ?? null;
    },
    async set(key: string, value: string) {
      await upstashCmd(["SET", key, value]);
      return 'OK';
    },
    async setex(key: string, ttl: number, value: string) {
      await upstashCmd(["SET", key, value, "EX", String(ttl)]);
      return 'OK';
    },
    async del(key: string) {
      await upstashCmd(["DEL", key]);
      return 1;
    },
    // Minimal event placeholder to keep compatibility with ioredis usage
    on(_ev: string, _fn: (...args: any[]) => void) {
      // no-op for Upstash REST
    },
  };
} else {
  client = new Redis({
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
  });

  client.on("connect", () => {
    console.log("Redis Connected");
  });

  client.on("error", (err: any) => {
    console.log("Redis Error:", err);
  });
}

export default client;