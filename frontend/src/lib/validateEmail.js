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

export async function validateEmailAddress(email) {
  if (!email || typeof email !== "string") {
    return { valid: false, reason: "Please provide an email address." };
  }

  const trimmed = email.trim().toLowerCase();

  // 1. Basic format check
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

  // 2. Check disposable email domain blacklist
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, reason: "Disposable or temporary emails are not permitted. Please use a real email address." };
  }

  // 3. Typo detection: Check common typos or edit distance to major email providers
  if (COMMON_TYPOS.has(domain)) {
    const suggested = COMMON_TYPOS.get(domain);
    return {
      valid: false,
      reason: `The email domain "@${domain}" is invalid. Did you mean "@${suggested}"?`,
    };
  }

  // If not an exact match for known domains, calculate edit distance
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

  // 4. Fast-path for trusted mail providers
  if (KNOWN_VALID_DOMAINS.has(domain)) {
    return { valid: true, normalizedEmail: trimmed };
  }

  // 5. DNS MX record validation for other custom/corporate domains with a 3-second timeout
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

    // Check if the MX record is a known parked or sinkhole host
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

  return { valid: true, normalizedEmail: trimmed };
}
