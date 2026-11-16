import { z } from "zod";

export const USER_TYPES = ["guest", "host", "associate"] as const;
export type UserType = (typeof USER_TYPES)[number];

export const USER_TYPE_LABELS: Record<UserType, string> = {
  guest: "Guest",
  host: "Host",
  associate: "Associate",
};

const email = z.string().trim().toLowerCase().email("Enter a valid email").max(254);

export const waitlistSchema = z.object({
  fullName: z.string().trim().min(1, "Name is required").max(120),
  email,
  country: z.string().trim().min(1, "Country is required").max(80),
  userType: z.enum(USER_TYPES),
});
export type WaitlistInput = z.infer<typeof waitlistSchema>;

export const newsletterSchema = z.object({ email });

/**
 * Hidden form field real visitors never see or fill in. Bots that auto-fill every input do,
 * and those submissions are acknowledged but silently dropped.
 */
export const HONEYPOT_FIELD = "website";

export function isHoneypotTripped(body: unknown): boolean {
  const value = (body as Record<string, unknown> | null)?.[HONEYPOT_FIELD];
  return typeof value === "string" && value.trim().length > 0;
}
export type NewsletterInput = z.infer<typeof newsletterSchema>;

export const MIN_PASSWORD_LENGTH = 12;
export const MAX_PASSWORD_LENGTH = 200;

export const profileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .max(120, "Name is too long")
    .transform((v) => v || null),
  email,
  currentPassword: z.string().max(MAX_PASSWORD_LENGTH).optional(),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password").max(MAX_PASSWORD_LENGTH),
    newPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, `New password must be at least ${MIN_PASSWORD_LENGTH} characters`)
      .max(MAX_PASSWORD_LENGTH),
  })
  .refine((v) => v.currentPassword !== v.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

// ---------- Auth ----------

const newPassword = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
  .max(MAX_PASSWORD_LENGTH);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(1).max(MAX_PASSWORD_LENGTH),
});

/** A 6-digit authenticator code or a recovery code (xxxxx-xxxxx). */
export const mfaCodeSchema = z.object({
  code: z.string().trim().min(6, "Enter the 6-digit code").max(20),
});

export const forgotPasswordSchema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });

export const tokenPasswordSchema = z.object({
  token: z.string().min(20).max(100),
  password: newPassword,
});

export const mfaDisableSchema = z.object({
  password: z.string().min(1, "Enter your password").max(MAX_PASSWORD_LENGTH),
  code: z.string().trim().min(6, "Enter a 2FA code").max(20),
});

export const inviteSchema = z.object({
  email,
  fullName: z
    .string()
    .trim()
    .max(120)
    .optional()
    .transform((v) => v || null),
  role: z.enum(["owner", "admin", "editor"]),
});

export const roleSchema = z.object({ role: z.enum(["owner", "admin", "editor"]) });
