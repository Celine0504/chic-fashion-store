import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { sendOtpEmail } from "@/lib/mail";
import { validateEmail } from "@/lib/validateContact";
import { hashOtp, checkRateLimit } from "@/lib/otpSecurity";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const rawEmail = body.email || body.contactValue;
    const rawType = (body.type || body.purpose || "register").toLowerCase();
    const type = rawType.includes("reset") ? "reset" : "register";

    // 1. Deep Email Validation (RFC Syntax, Disposable Email Check, Live DNS MX Record Lookup)
    const validation = await validateEmail(rawEmail);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const email = validation.normalized;

    // 2. Check user existence based on operation type
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (type === "register" && existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    if (type === "reset" && !existingUser) {
      return NextResponse.json(
        { error: "No account found with this email address. Please check your email or register." },
        { status: 404 }
      );
    }

    // 3. Enforce Rate Limiting (60-second cooldown between requests)
    const rateLimit = await checkRateLimit(email);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: rateLimit.reason, waitSeconds: rateLimit.waitSeconds },
        { status: 429 }
      );
    }

    // 4. Generate cryptographically secure 6-digit numeric OTP
    const rawOtp = crypto.randomInt(100000, 999999).toString();
    const hashedOtp = hashOtp(rawOtp);
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // 5. Dispatch real email via SMTP
    const mailResult = await sendOtpEmail(email, rawOtp, type);

    if (!mailResult.sent && !mailResult.devMode) {
      return NextResponse.json(
        { error: mailResult.error || "Unable to send verification code to this email address. Please verify your email exists." },
        { status: 400 }
      );
    }

    // 6. Store ONLY the SHA-256 hashed OTP in MySQL
    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: hashedOtp,
        expires,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `A 6-digit verification code has been sent to ${email}.`,
        devOtp: mailResult.devMode ? rawOtp : undefined,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("send-otp error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process verification code." },
      { status: 500 }
    );
  }
}
