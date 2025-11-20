import { z } from "zod";

export const movieSearchSchema = z.object({
  q: z.string().min(1).max(200).optional(),
  genre: z.string().max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export const movieDetailsSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") {
        return undefined;
      }
      const num = Number(val);
      if (isNaN(num) || num < 1900 || num > 2100) {
        return undefined;
      }
      return Math.floor(num);
    },
    z.number().int().min(1900).max(2100).optional()
  ),
});

export const posterSchema = z.object({
  title: z.string().min(1).max(200),
  year: z.preprocess(
    (val) => {
      if (val === null || val === undefined || val === "" || val === "null" || val === "undefined") {
        return undefined;
      }
      const num = Number(val);
      if (isNaN(num) || num < 1900 || num > 2100) {
        return undefined;
      }
      return Math.floor(num);
    },
    z.number().int().min(1900).max(2100).optional()
  ),
});

export const recommendationsSchema = z.object({
  watchlist: z.array(z.any()).default([]),
  liked: z.array(z.any()).default([]),
});

export const userSearchSchema = z.object({
  q: z.string().min(1).max(100),
});

export const followSchema = z.object({
  targetUserId: z.string().min(1).max(128),
});

export const shareListSchema = z.object({
  listId: z.string().min(1).max(128),
  userIds: z.array(z.string().min(1).max(128)).min(1).max(50),
});

export const removeAccessSchema = z.object({
  listId: z.string().min(1).max(128),
  userId: z.string().min(1).max(128),
});

export function validateRequest<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation failed: ${error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ")}`);
    }
    throw error;
  }
}

