import { Redis } from "ioredis";

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

// If Upstash REST URL + token are provided, use the Upstash HTTP API for simple
// get/setex/del commands. Otherwise fall back to a normal ioredis client.
let client: any;

if (UPSTASH_URL && UPSTASH_TOKEN) {
  const base = UPSTASH_URL.replace(/\/+$/g, "");
  console.log("Using Upstash REST Redis at:", base);
  client = {
    async get(key: string) {
      const res = await fetch(`${base}/get/${encodeURIComponent(key)}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      if (!res.ok) throw new Error(`Upstash GET failed: ${res.status}`);
      const json = await res.json();
      // Upstash returns { result: <value> }
      return json?.result ?? null;
    },
    async set(key: string, value: string) {
      const res = await fetch(`${base}/set`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });
      if (!res.ok) throw new Error(`Upstash SET failed: ${res.status}`);
      return 'OK';
    },
    async setex(key: string, ttl: number, value: string) {
      // set value
      const setRes = await fetch(`${base}/set`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, value }),
      });
      if (!setRes.ok) throw new Error(`Upstash SET failed: ${setRes.status}`);
      // then set expiry
      const expRes = await fetch(`${base}/expire`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key, seconds: ttl }),
      });
      if (!expRes.ok) throw new Error(`Upstash EXPIRE failed: ${expRes.status}`);
      return 'OK';
    },
    async del(key: string) {
      const res = await fetch(`${base}/del`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${UPSTASH_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ key }),
      });
      if (!res.ok) throw new Error(`Upstash DEL failed: ${res.status}`);
      const json = await res.json();
      return json?.result ?? 0;
    },
    // Minimal event placeholder to keep compatibility with ioredis usage
    on(_ev: string, _fn: (...args: any[]) => void) {
      // no-op for Upstash REST
    },
    async ping() {
      // Use a harmless GET to ensure the REST endpoint is reachable.
      const res = await fetch(`${base}/get/__upstash_health_check__`, {
        method: "GET",
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
      if (!res.ok) throw new Error(`Upstash ping failed: ${res.status}`);
      return 'PONG';
    },
    async quit() {
      // no-op for REST client
      return 'OK';
    },
    disconnect() {
      // no-op for REST client
    },
    status: 'ready',
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