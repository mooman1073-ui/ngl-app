import { cache } from "./cache.js";
import { config } from "../config/config.js";
import { logger } from "../../logger/logger.js";

export function withCache(createKey, ttl = config.cacheTtl) {
  return async (req, res, next) => {
    if (req.method !== "GET") {
      return next();
    }

    let key;

    try {
      key = createKey(req);
      const cachedData = await cache.get(key);

      if (cachedData !== null) {
        res.set("X-Cache", "HIT");
        return res.json(cachedData);
      }
    } catch {
      logger.error("Could not read cached data");
      return next();
    }

    res.set("X-Cache", "MISS");
    const sendJson = res.json.bind(res);

    res.json = async (data) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          await cache.set(key, data, ttl);
        } catch {
          logger.error("Could not save cached data");
        }
      }

      return sendJson(data);
    };

    next();
  };
}
