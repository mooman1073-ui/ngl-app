import { config as loadEnv } from "dotenv";

loadEnv({ path: process.env.ENV_FILE || ".env", quiet: true });

const cacheTtl = Number(process.env.CACHE_TTL || 60);

if (!Number.isInteger(cacheTtl) || cacheTtl < 1) {
  throw new Error("CACHE_TTL must be a positive number of seconds");
}

export const config = {
  port: process.env.PORT || 3000,
  redisUrl: process.env.REDIS_URL || "redis://127.0.0.1:6379",
  cacheTtl
};
