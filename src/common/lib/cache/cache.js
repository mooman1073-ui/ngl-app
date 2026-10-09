import { createCache } from "../../pkg/cache/cache.js";
import { config } from "../config/config.js";
import { logger } from "../../logger/logger.js";

export const cache = createCache({
  url: config.redisUrl,
  onError: () => logger.error("Redis connection error")
});

export async function connectCache() {
  await cache.connect();
  logger.info("Redis connected");
}

export async function invalidateProfile(userId) {
  try {
    await cache.delete(`ngl:profile:${userId}`);
  } catch {
    logger.error("Could not clear cached profile");
  }
}
