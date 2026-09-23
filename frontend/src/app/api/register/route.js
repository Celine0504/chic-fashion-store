import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { 
  findUserByEmail, 
  getVerificationToken, 
  deleteVerificationToken, 
  createUser 
} from "@/lib/userStore";
import { validateEmail } from "@/lib/validateContact";
import { verifyOtpHash } from "@/lib/otpSecurity";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const rawEmail = body.email || body.contactValue;
    const { name, password, otp } = body;

    // 1. Validate inputs
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: "Please provide your full name." },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    if (!otp || String(otp).trim().length !== 6) {
      return NextResponse.json(
        { error: "Please enter the complete 6-digit verification code." },
        { status: 400 }
      );
    }

    // 2. Validate email syntax & DNS MX record
    const validation = await validateEmail(rawEmail);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const email = validation.normalized;

    // 3. Check for existing user
    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in instead." },
        { status: 409 }
      );
    }

    // 4. Retrieve stored token and verify SHA-256 hash
    const tokenRecord = await getVerificationToken(email);

    if (!tokenRecord) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new code." },
        { status: 400 }
      );
    }

    const isOtpValid = verifyOtpHash(otp, tokenRecord.token);
    if (!isOtpValid) {
      return NextResponse.json(
        { error: "Incorrect verification code. Please check and try again." },
        { status: 400 }
      );
    }

    // 5. Delete token (prevents replay attacks)
    await deleteVerificationToken(email);

    // 6. Securely hash password with bcrypt
    const hashedPassword = await bcrypt.hash(password, 12);

    // 7. Create verified user record
    const user = await createUser({
      name: name.trim(),
      email,
      password: hashedPassword,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account verified and created successfully.",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create account" },
      { status: 500 }
    );
  }
}