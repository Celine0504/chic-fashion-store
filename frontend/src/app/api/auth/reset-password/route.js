import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { 
  findUserByEmail, 
  getVerificationToken, 
  deleteVerificationToken, 
  updateUserPassword 
} from "@/lib/userStore";
import { validateEmail } from "@/lib/validateContact";
import { verifyOtpHash } from "@/lib/otpSecurity";

export const dynamic = "force-dynamic";

export async function POST(req) {
  try {
    const body = await req.json();
    const rawEmail = body.email || body.contactValue;
    const { newPassword, otp } = body;

    if (!newPassword || newPassword.length < 6) {
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

    const validation = await validateEmail(rawEmail);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.reason },
        { status: 400 }
      );
    }

    const email = validation.normalized;

    // Check user existence
    const user = await findUserByEmail(email);

    if (!user) {
      return NextResponse.json(
        { error: "No account found with this email address." },
        { status: 404 }
      );
    }

    // Verify hashed OTP
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

    // Delete token
    await deleteVerificationToken(email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password
    await updateUserPassword(email, hashedPassword);

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully. You can now sign in with your email and new password!",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to reset password." },
      { status: 500 }
    );
  }
}
