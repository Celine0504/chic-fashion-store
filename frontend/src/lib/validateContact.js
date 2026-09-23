import dns from "dns/promises";

// Common disposable / fake email domains to block
const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com",
  "10minutemail.com",
  "mailinator.com",
  "guerrillamail.com",
  "throwawaymail.com",
  "yopmail.com",
  "sharklasers.com",
  "dispostable.com",
  "trashmail.com",
  "getairmail.com",
  "fakemailgenerator.com",
  "emailondeck.com",
  "generator.email",
]);

// Known verified major email providers
const POPULAR_DOMAINS = [
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "ymail.com",
  "outlook.com",
  "hotmail.com",
  "live.com",
  "msn.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "zoho.com",
  "zoho.in",
  "proton.me",
  "protonmail.com",
  "aol.com",
];

const KNOWN_VALID_DOMAINS = new Set(POPULAR_DOMAINS);

// Common misspelled domains
const COMMON_TYPOS = new Map([
  ["gamil.com", "gmail.com"],
  ["gmial.com", "gmail.com"],
  ["gmaill.com", "gmail.com"],
  ["gmai.com", "gmail.com"],
  ["gmil.com", "gmail.com"],
  ["gmaild.com", "gmail.com"],
  ["gemail.com", "gmail.com"],
  ["gnail.com", "gmail.com"],
  ["hotmial.com", "hotmail.com"],
  ["hotmai.com", "hotmail.com"],
  ["outlok.com", "outlook.com"],
  ["outloo.com", "outlook.com"],
  ["yaho.com", "yahoo.com"],
  ["yahooo.com", "yahoo.com"],
  ["yhaoo.com", "yahoo.com"],
  ["iclud.com", "icloud.com"],
  ["icoud.com", "icloud.com"],
]);

// Known parked or fake MX servers that accept and sinkhole mail
const PARKED_MX_HOSTS = new Set([
  "mail.gamil.com",
  "mail.gmial.com",
  "mail.gmaill.com",
  "localhost",
  "127.0.0.1",
]);

function levenshtein(a, b) {
  const m = a.length, n = b.length;
  const d = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(
        d[i - 1][j] + 1,
        d[i][j - 1] + 1,
        d[i - 1][j - 1] + cost
      );
    }
  }
  return d[m][n];
}

// Strict RFC 5322 regex
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * Validates Email Address with typo detection, MX resolution & disposable check
 */
export async function validateEmail(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Please enter an email address." };
  }

  const trimmed = email.trim().toLowerCase();

  if (!EMAIL_REGEX.test(trimmed)) {
    return { valid: false, reason: "Invalid email format. Please check your email and try again." };
  }

  const parts = trimmed.split("@");
  if (parts.length !== 2) {
    return { valid: false, reason: "Invalid email format." };
  }

  const [localPart, domain] = parts;

  if (localPart.length > 64) {
    return { valid: false, reason: "Email username is too long." };
  }

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable/temporary emails are not permitted. Please use a real email address." };
  }

  // Typo detection: Check known common typos
  if (COMMON_TYPOS.has(domain)) {
    const suggested = COMMON_TYPOS.get(domain);
    return {
      valid: false,
      reason: `The email domain "@${domain}" is invalid. Did you mean "@${suggested}"?`,
    };
  }

  // Levenshtein distance check to popular providers
  if (!KNOWN_VALID_DOMAINS.has(domain)) {
    for (const pop of POPULAR_DOMAINS) {
      if (levenshtein(domain, pop) <= 2) {
        return {
          valid: false,
          reason: `The email domain "@${domain}" appears to be a typo. Did you mean "@${pop}"?`,
        };
      }
    }
  }

  // Fast-path for trusted mail providers
  if (KNOWN_VALID_DOMAINS.has(domain)) {
    return { valid: true, normalized: trimmed, type: "email" };
  }

  // For unknown domains, check live DNS MX with a 3-second timeout
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("DNS_TIMEOUT")), 3000)
    );
    const mxRecords = await Promise.race([dns.resolveMx(domain), timeoutPromise]);
    if (!mxRecords || mxRecords.length === 0) {
      return {
        valid: false,
        reason: `The domain "@${domain}" cannot receive emails. Please enter a valid email address.`,
      };
    }

    const hasParkedMx = mxRecords.some(r => {
      const ex = (r.exchange || "").toLowerCase();
      return PARKED_MX_HOSTS.has(ex) || ex.includes("parking") || ex.includes("sinkhole");
    });

    if (hasParkedMx) {
      return {
        valid: false,
        reason: `The domain "@${domain}" is a parked/inactive domain. Please use a real email address.`,
      };
    }
  } catch (error) {
    return {
      valid: false,
      reason: `The domain "@${domain}" does not exist. Please check for typos and try again.`,
    };
  }

  return { valid: true, normalized: trimmed, type: "email" };
}

/**
 * Validates Indian Mobile Numbers
 */
export function validateIndiaMobile(phone) {
  if (!phone || typeof phone !== "string") {
    return { valid: false, reason: "Please enter a 10-digit mobile number." };
  }

  let cleaned = phone.replace(/[\s\-\(\)]/g, "");
  
  if (cleaned.startsWith("+91")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("91") && cleaned.length === 12) {
    cleaned = cleaned.substring(2);
  } else if (cleaned.startsWith("0") && cleaned.length === 11) {
    cleaned = cleaned.substring(1);
  }

  const INDIA_MOBILE_REGEX = /^[6-9]\d{9}$/;

  if (!INDIA_MOBILE_REGEX.test(cleaned)) {
    return {
      valid: false,
      reason: "Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).",
    };
  }

  return {
    valid: true,
    normalized: `+91${cleaned}`,
    rawNumber: cleaned,
    type: "phone",
  };
}

/**
 * Validates either Email or Phone based on contactType
 */
export async function validateContact(contactType, contactValue) {
  if (contactType === "phone") {
    return validateIndiaMobile(contactValue);
  }
  return await validateEmail(contactValue);
}
