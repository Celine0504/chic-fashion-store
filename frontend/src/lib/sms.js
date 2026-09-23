/**
 * Multi-Provider SMS Gateway for Indian Mobile Numbers (+91)
 * Supports:
 * 1. Fast2SMS (Free India SMS Gateway): Set FAST2SMS_API_KEY
 * 2. Twilio (Global SMS Gateway): Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER
 * 3. Dev Mode fallback: Logs OTP to terminal console & returns preview for testing
 */

export async function sendOtpSms(phoneNumber, otp, type = "register") {
  const isReset = type === "reset";
  const actionText = isReset ? "password reset" : "account verification";

  const fast2smsKey = process.env.FAST2SMS_API_KEY;
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const twilioFrom = process.env.TWILIO_PHONE_NUMBER;

  const raw10Digits = phoneNumber.replace(/\D/g, "").slice(-10);

  console.log(`\n==================================================`);
  console.log(`[CHIC FASHION STORE SMS GATEWAY]`);
  console.log(`RECIPIENT: ${phoneNumber} (${raw10Digits})`);
  console.log(`>>> VERIFICATION CODE: ${otp} <<<`);
  console.log(`PURPOSE: ${actionText.toUpperCase()}`);
  console.log(`PROVIDER: ${fast2smsKey ? 'Fast2SMS' : twilioSid ? 'Twilio' : 'Dev Console Mode'}`);
  console.log(`==================================================\n`);

  // Provider 1: Fast2SMS (India's leading instant SMS API)
  if (fast2smsKey) {
    try {
      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: fast2smsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          variables_values: otp,
          route: "otp",
          numbers: raw10Digits,
        }),
      });

      const data = await response.json();
      if (data.return) {
        console.log(`[SMS DELIVERED VIA FAST2SMS] to ${raw10Digits}`);
        return { sent: true, devMode: false };
      } else {
        console.error("Fast2SMS error:", data);
        return {
          sent: false,
          error: data.message ? (Array.isArray(data.message) ? data.message.join(", ") : data.message) : "Failed to deliver SMS.",
        };
      }
    } catch (err) {
      console.error("Fast2SMS network error:", err);
      return { sent: false, error: err.message };
    }
  }

  // Provider 2: Twilio
  if (twilioSid && twilioToken && twilioFrom) {
    try {
      const authHeader = Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64");
      const body = new URLSearchParams({
        To: phoneNumber,
        From: twilioFrom,
        Body: `Your Chic Fashion Store verification code is: ${otp}. Valid for 10 minutes.`,
      });

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: body.toString(),
        }
      );

      const data = await response.json();
      if (!response.ok) {
        return { sent: false, error: data.message || "Twilio failed to send SMS." };
      }

      console.log(`[SMS DELIVERED VIA TWILIO] SID: ${data.sid}`);
      return { sent: true, devMode: false };
    } catch (err) {
      return { sent: false, error: err.message };
    }
  }

  // Fallback: No SMS Gateway configured in .env yet
  return {
    sent: true,
    devMode: true,
    otp,
    message: "SMS logged in server console. Add FAST2SMS_API_KEY or Twilio to .env to deliver to real phones.",
  };
}
