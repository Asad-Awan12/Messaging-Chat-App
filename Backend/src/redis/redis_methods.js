// This file contains utility functions for interacting with Redis.
// It includes operations for handling Redis hashes, sets, and keys, such as adding, getting, deleting, and counting items,
// as well as managing time-to-live (TTL) for keys. The functions use Redis pipelines for optimized performance and support various patterns,
// including fetching and deleting keys by pattern, counting members in sets, and fetching data in ranges.

import redis from "./redis_client.js";

const parseJson = (data) => (data ? JSON.parse(data) : null);

export const addToHash = async (key, value, expire = 1) => {
  try {
    console.log("Setting to redis: ", key);
    const pipeline = redis.pipeline();
    pipeline.hset(key, "data", JSON.stringify(value));
    if (expire > 0) {
      pipeline.expire(key, expire * 60);
    }
    const [res] = await pipeline.exec();
    if (res) {
      console.log(`Data set successfully ${res}`);
    }
  } catch (err) {
    console.error(`Redis Error: ${err}`);
  }
};

export const getMemberFromHash = async (key) => {
  try {
    const data = await redis.hget(key, "data");
    return parseJson(data);
  } catch (err) {
    console.error(`Error getting data: ${err.message}`);
    return null;
  }
};

export const getTimeToLive = async (key) => {
  console.log("Getting time to live:", key);
  return await redis.ttl(key);
};

export const getSpecificList = async (pattern, keys) => {
  try {
    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.hget(`${pattern}:${key}`, "data"));
    const results = await pipeline.exec();
    const data = results.map(([err, res]) => parseJson(res));
    return data.length ? data : null;
  } catch (err) {
    console.error(`Error getting data: ${err.message}`);
    return null;
  }
};

export const getHashList = async (keyPattern, start = 0, end = -1) => {
  try {
    const keys = await redis.keys(`*${keyPattern}*`);
    if (!keys.length) return null;

    const validStart = Math.max(0, start);
    const validEnd =
      end === -1 ? keys.length - 1 : Math.min(keys.length - 1, end);
    const selectedKeys = keys.slice(validStart, validEnd + 1);

    const pipeline = redis.pipeline();
    selectedKeys.forEach((key) => pipeline.hget(key, "data"));
    const results = await pipeline.exec();

    const data = results.map(([err, res]) => (err ? null : parseJson(res)));
    return data.length ? data.filter((item) => item !== null) : null;
  } catch (err) {
    console.error(`Error getting data: ${err.message}`);
    return null;
  }
};

export const countFieldsInHash = async (key) => {
  try {
    const keys = await redis.keys(`*${key}*`);
    return keys.length;
  } catch (err) {
    console.error(`Error counting fields in hash: ${err.message}`);
    throw err;
  }
};

export const setHashList = async (field, values, expire = 60) => {
  if (values?.length === 0) return;

  try {
    console.log("Setting list to redis: ", field);
    const pipeline = redis.pipeline();
    values.forEach((value) => {
      const key = `${field}:${value._id}`;
      pipeline
        .hset(key, "data", JSON.stringify(value))
        .expire(key, expire * 60);
    });

    await pipeline.exec();
    console.log(`Data set successfully for ${values.length} items`);
  } catch (err) {
    console.error(`Error setting data: ${err.message}`);
  }
};

export const deleteFromHash = async (key) => {
  try {
    const deleted = await redis.hdel(key, "data");
    if (deleted) {
      console.log(`Data deleted successfully`);
      return deleted;
    } else {
      console.log(`No data found for ${key} to delete`);
      return deleted;
    }
  } catch (err) {
    console.error(`Error deleting data: ${err.message}`);
  }
};

export const deleteFromHashByPattern = async (keyPattern) => {
  try {
    const keys = await redis.keys(`*${keyPattern}*`);
    if (!keys.length) {
      console.log(`No keys found matching pattern: ${keyPattern}`);
      return;
    }
    const pipeline = redis.pipeline();
    keys.forEach((key) => pipeline.del(key));
    await pipeline.exec();

    console.log(`Deleted keys matching pattern: ${keyPattern}`);
  } catch (err) {
    console.error(`Error deleting keys by pattern: ${err.message}`);
    throw err;
  }
};

export const countKeysByPattern = async (pattern) => {
  let cursor = "0";
  let totalCount = 0;

  try {
    do {
      const result = await redis.scan(cursor, "MATCH", pattern, "COUNT", 1000);
      cursor = result[0];
      const keys = result[1];

      totalCount += keys.length;
    } while (cursor !== "0");

    return totalCount;
  } catch (err) {
    console.error(`Error counting keys by pattern: ${err.message}`);
    throw err;
  }
};

// ----------------------------------------------------------------
//? Set methods
export const addToSet = async (key, value) => {
  try {
    console.log("Adding to set in redis: ", key);
    await redis.sadd(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis Error: ${err}`);
  }
};

export const removeFromSet = async (key, value) => {
  try {
    console.log("Removing from set in redis: ", key);
    await redis.srem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Redis Error: ${err}`);
  }
};

export const getMembersFromSet = async (key) => {
  try {
    console.log("Getting members from set in redis: ", key);
    const members = await redis.smembers(key);
    return members.map((member) => parseJson(member));
  } catch (err) {
    console.error(`Redis Error: ${err}`);
  }
};

export const isMemberOfSet = async (key, value) => {
  redis.sismember(key, value, (err, reply) => {
    if (err) {
      console.error("Error checking value in set:", err);
      return false;
    }
    if (reply === 1) {
      console.log(`${valueToCheck} exists in the set ${key}`);
      return true;
    } else {
      console.log(`${valueToCheck} does not exist in the set ${key}`);
      return false;
    }
  });
};

export const countMembersInSet = async (key) => {
  try {
    console.log(`Counting members in set: ${key}`);
    return await redis.scard(key);
  } catch (err) {
    console.error(`Error counting members in set: ${err.message}`);
    throw err;
  }
};

export const getRangeFromRedis = async (key, count = 4) => {
  const allMembers = [];
  let cursor = "0";

  do {
    const { items, cursor: nextCursor } = await fetchRange(key, count, cursor);
    allMembers.push(...items);
    cursor = nextCursor;
  } while (cursor !== "0");

  return allMembers.map((item) => parseJson(item));
};

const fetchRange = async (key, count, cursor) => {
  try {
    const [nextCursor, items] = await redis.sscan(key, cursor, "COUNT", count);

    return { items, cursor: nextCursor };
  } catch (err) {
    console.error(`Redis Error while scanning ${key}: ${err}`);
    throw err;
  }
};
