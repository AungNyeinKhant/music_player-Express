import { z } from "zod";

export const emailSchema = z.string().trim().email().min(1).max(255);
export const passwordSchema = z.string().trim().min(6).max(255);
export const verificationCodeSchema = z.string().trim().min(1).max(25);
export const mp3Schema = z.object({
  type: z.literal("audio/mpeg"),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 10MB max size
  name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine((name: string) => name.toLowerCase().endsWith(".mp3"), {
      message: "File must have .mp3 extension",
    }),
});
// For images (supporting common formats)
/*
export const imageSchema = z.object({
  type: z.enum([
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
    "image/svg+xml",
    "image/bmp",
    "image/tiff",
  ]),
  size: z
    .number()
    .int()
    .positive()
    .max(10 * 1024 * 1024), // 5MB max size
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  name: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine(
      (name: string) => {
        const ext = name.split(".").pop()?.toLowerCase();
        return [
          "jpg",
          "jpeg",
          "png",
          "gif",
          "webp",
          "svg",
          "bmp",
          "tiff",
        ].includes(ext || "");
      },
      {
        message: "File must have a valid image extension",
      }
    ),
});
*/

export const phoneNumberSchema = z.string().refine(
  (val) => /^\+?\d{1,15}$/.test(val), // Basic example: optional '+' and digits
  {
    message: "Invalid phone number format",
  }
);

export const registerUserSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  phone: phoneNumberSchema,
  password: passwordSchema,
  // image: imageSchema.optional(),
  dob: z.string().trim().min(1).max(50), //z.date(),
});

export const loginUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerArtistSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: emailSchema,
  phone: phoneNumberSchema,
  password: passwordSchema,
  // image: imageSchema.optional(),
  // bg_image: imageSchema.optional(),
  dob: z.string().trim().min(1).max(100), //z.date(),
  // nrc_front: imageSchema,
  // nrc_back: imageSchema.optional(),
});

export const loginArtistSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const registerAdminSchema = z.object({
  name: z.string().trim().min(1).max(100),
  staff_id: z.string().trim().min(1).max(100),
  email: emailSchema,
  phone: phoneNumberSchema,
  password: passwordSchema,
  // image: imageSchema.optional(),
  suspended: z.boolean().default(false),
});

export const loginAdminSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
