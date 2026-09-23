import crypto from "crypto";
import { prisma } from "./prisma.js";

const RATE_LIMIT_COOLDOWN_MS = 60 * 1000; // 60 seconds cooldown between OTP requests

/**
 * Hashes a 6-digit numeric OTP using SHA-256
 */
export function hashOtp(otp) {
  return crypto.createHash("sha256").update(String(otp).trim()).digest("hex");
}

/**
 * Timing-safe comparison of entered OTP with stored hash
 */
export function verifyOtpHash(enteredOtp, storedHash) {
  if (!enteredOtp || !storedHash) return false;
  const enteredHash = hashOtp(enteredOtp);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(enteredHash, "hex"),
      Buffer.from(storedHash, "hex")
    );
  } catch (e) {
    return false;
  }
}

/**
 * Checks rate limiting for an identifier (email or phone)
 */
export async function checkRateLimit(identifier) {
  try {
    const existing = await prisma.verificationToken.findFirst({
      where: { identifier },
      orderBy: { createdAt: "desc" },
    });

    if (!existing || !existing.createdAt) {
      return { allowed: true };
    }

    const elapsedMs = Date.now() - new Date(existing.createdAt).getTime();
    if (elapsedMs < RATE_LIMIT_COOLDOWN_MS) {
      const waitSeconds = Math.ceil((RATE_LIMIT_COOLDOWN_MS - elapsedMs) / 1000);
      return {
        allowed: false,
        waitSeconds,
        reason: `Please wait ${waitSeconds} seconds before requesting a new verification code.`,
      };
    }

    return { allowed: true };
  } catch (error) {
    // If column or query fails, allow request to avoid locking user out
    return { allowed: true };
  }
}
