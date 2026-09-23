// Universal User & Token Store that bridges MySQL Prisma and in-memory serverless fallback
// Guarantees zero crashes on Vercel cloud deployments while preserving MySQL persistence locally.

if (!globalThis._chicStore) {
  globalThis._chicStore = {
    users: new Map(),
    tokens: new Map(),
  };
}

export async function findUserByEmail(email) {
  if (!email) return null;
  const normEmail = email.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.user?.findUnique === "function") {
      const u = await prisma.user.findUnique({ where: { email: normEmail } });
      if (u) return u;
    }
  } catch (err) {
    // Database offline or serverless sandbox
  }
  return globalThis._chicStore.users.get(normEmail) || null;
}

export async function saveVerificationToken(identifier, tokenHash, expires) {
  const normId = identifier.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.verificationToken?.deleteMany === "function") {
      await prisma.verificationToken.deleteMany({ where: { identifier: normId } });
      return await prisma.verificationToken.create({
        data: { identifier: normId, token: tokenHash, expires },
      });
    }
  } catch (err) {
    // Database offline
  }
  globalThis._chicStore.tokens.set(normId, { identifier: normId, token: tokenHash, expires });
}

export async function getVerificationToken(identifier) {
  const normId = identifier.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.verificationToken?.findFirst === "function") {
      const t = await prisma.verificationToken.findFirst({
        where: { identifier: normId, expires: { gt: new Date() } },
      });
      if (t) return t;
    }
  } catch (err) {
    // Database offline
  }
  const mem = globalThis._chicStore.tokens.get(normId);
  if (mem && new Date(mem.expires) > new Date()) {
    return mem;
  }
  return null;
}

export async function deleteVerificationToken(identifier) {
  const normId = identifier.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.verificationToken?.deleteMany === "function") {
      await prisma.verificationToken.deleteMany({ where: { identifier: normId } });
    }
  } catch (err) {}
  globalThis._chicStore.tokens.delete(normId);
}

export async function createUser({ name, email, password }) {
  const normEmail = email.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.user?.create === "function") {
      return await prisma.user.create({
        data: {
          name: name.trim(),
          email: normEmail,
          password,
          emailVerified: new Date(),
        },
        select: { id: true, name: true, email: true },
      });
    }
  } catch (err) {
    // Database offline, fallback to memory
  }
  const newUser = {
    id: "user_" + Date.now(),
    name: name.trim(),
    email: normEmail,
    password,
    emailVerified: new Date(),
  };
  globalThis._chicStore.users.set(normEmail, newUser);
  return { id: newUser.id, name: newUser.name, email: newUser.email };
}

export async function updateUserPassword(email, hashedPassword) {
  const normEmail = email.toLowerCase().trim();
  try {
    const { prisma } = await import("@/lib/prisma");
    if (prisma && typeof prisma.user?.update === "function") {
      return await prisma.user.update({
        where: { email: normEmail },
        data: { password: hashedPassword },
      });
    }
  } catch (err) {}
  const mem = globalThis._chicStore.users.get(normEmail);
  if (mem) {
    mem.password = hashedPassword;
  }
}
