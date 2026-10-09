import { createClient } from "redis";

export function createCache({ url, onError }) {
  const client = createClient({
    url,
    socket: {
      connectTimeout: 5000,
      reconnectStrategy: false
    }
  });

  client.on("error", onError || (() => {}));

  return {
    async connect() {
      await client.connect();
    },

    async get(key) {
      const value = await client.get(key);
      return value === null ? null : JSON.parse(value);
    },

    async set(key, value, ttl) {
      await client.set(key, JSON.stringify(value), { EX: ttl });
    },

    async delete(key) {
      await client.del(key);
    },

    async disconnect() {
      if (client.isOpen) {
        await client.close();
      }
    }
  };
}
