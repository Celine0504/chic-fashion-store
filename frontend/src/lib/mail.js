import nodemailer from "nodemailer";

// Singleton pooled transporter to avoid TLS renegotiation on every dispatch
let cachedTransporter = null;
let lastUser = "";
let lastPass = "";

function getTransporter() {
  const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || "").replace(/\s+/g, "");

  if (!user || !pass) return null;

  // Invalidate cache if credentials change
  if (cachedTransporter && (lastUser !== user || lastPass !== pass)) {
    try { cachedTransporter.close(); } catch (e) {}
    cachedTransporter = null;
  }

  if (!cachedTransporter) {
    lastUser = user;
    lastPass = pass;
    cachedTransporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      pool: true,
      maxConnections: 5,
      maxMessages: 100,
      auth: { user, pass },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
    });
  }

  return cachedTransporter;
}

export async function sendOtpEmail(email, otp, type = "register") {
  const isReset = type === "reset";
  const actionText = isReset ? "password reset" : "account verification";
  
  const user = (process.env.SMTP_USER || process.env.EMAIL_SERVER_USER || "").trim();
  const pass = (process.env.SMTP_PASS || process.env.EMAIL_SERVER_PASSWORD || "").replace(/\s+/g, "");
  const senderEmail = process.env.SMTP_FROM || user || "no-reply@chicfashionstore.com";

  const isConfigured = Boolean(user && pass);

  console.log(`\n==================================================`);
  console.log(`[CHIC FASHION STORE] RAPID OTP ATTEMPT FOR: ${email}`);
  console.log(`>>> OTP: ${otp} <<<`);
  console.log(`PURPOSE: ${actionText.toUpperCase()}`);
  console.log(`SMTP SENDER: ${isConfigured ? user : 'NOT CONFIGURED'}`);
  console.log(`==================================================\n`);

  if (!isConfigured) {
    return {
      sent: false,
      isConfigured: false,
      error: "Email delivery is not configured yet. Please add your SMTP_USER and SMTP_PASS to frontend/.env to send real emails.",
    };
  }

  const transporter = getTransporter();

  const html = `
    <!DOCTYPE html>
    <html>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f7f7f7; margin: 0; padding: 25px 15px;">
      <table width="100%" border="0" cellspacing="0" cellpadding="0">
        <tr>
          <td align="center">
            <div style="max-width: 480px; width: 100%; background: #ffffff; border: 1px solid #e2e2e2; border-radius: 6px; padding: 36px 28px; text-align: center; box-sizing: border-box;">
              <div style="font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #888888; margin-bottom: 12px; font-weight: 700;">CHIC FASHION STORE</div>
              <h2 style="font-size: 20px; font-family: 'Times New Roman', serif; letter-spacing: 0.1em; text-transform: uppercase; color: #111111; margin: 0 0 16px;">Email Verification</h2>
              <p style="font-size: 13px; line-height: 1.6; color: #444444; margin: 0 0 20px;">Use the following 6-digit one-time code to complete your ${actionText}:</p>
              
              <div style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 30px; font-weight: 700; letter-spacing: 0.25em; padding: 14px 28px; border-radius: 4px; margin: 10px 0 22px; font-family: monospace;">
                ${otp}
              </div>

              <p style="font-size: 12px; color: #777777; line-height: 1.5; margin: 0 0 24px;">
                This code is valid for <strong>10 minutes</strong>.<br>If you did not request this verification, you can safely ignore this email.
              </p>
              
              <div style="font-size: 11px; color: #aaaaaa; border-top: 1px solid #eeeeee; padding-top: 18px;">
                &copy; ${new Date().getFullYear()} CHIC FASHION STORE. All rights reserved.
              </div>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  try {
    const startTime = Date.now();
    const info = await transporter.sendMail({
      from: `"Chic Fashion Store" <${senderEmail}>`,
      to: email,
      subject: `Your Chic Fashion Store Verification Code: ${otp}`,
      text: `Your Chic Fashion Store verification code is: ${otp}\n\nUse this 6-digit code to complete your ${actionText}.\n\nThis code will expire in 10 minutes.\nIf you did not request this code, you can safely ignore this email.`,
      html,
    });
    const duration = Date.now() - startTime;
    console.log(`[EMAIL DISPATCHED IN ${duration}ms] Message ID: ${info.messageId} to ${email}`);
    return { sent: true, isConfigured: true, duration };
  } catch (error) {
    console.error("Nodemailer send error:", error);
    
    // Provide human-friendly error messages
    let message = "Failed to deliver email. Please check that this email address exists and try again.";
    if (error.responseCode === 550 || error.code === 'EENVELOPE') {
      message = `The email address "${email}" does not exist or was rejected by the mail server.`;
    } else if (error.code === 'EAUTH') {
      message = "SMTP authentication failed. Please check your Gmail App Password in .env.";
    }

    return {
      sent: false,
      isConfigured: true,
      error: message,
    };
  }
}
