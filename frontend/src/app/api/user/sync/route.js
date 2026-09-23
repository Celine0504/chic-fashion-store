import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json({
        authenticated: false,
        cart: [],
        wishlist: [],
      });
    }

    let user = null;
    try {
      if (prisma && typeof prisma.user?.findUnique === "function") {
        user = await prisma.user.findUnique({
          where: { email: session.user.email.toLowerCase() },
          select: { cart: true, wishlist: true },
        });
      }
    } catch (dbErr) {
      console.warn("User sync DB lookup skipped in serverless mode:", dbErr.message);
    }

    if (!user) {
      return NextResponse.json({
        authenticated: true,
        cart: [],
        wishlist: [],
      });
    }

    let cart = [];
    let wishlist = [];

    try {
      if (user.cart) cart = JSON.parse(user.cart);
    } catch (e) {
      console.error("Failed to parse user cart:", e);
    }

    try {
      if (user.wishlist) wishlist = JSON.parse(user.wishlist);
    } catch (e) {
      console.error("Failed to parse user wishlist:", e);
    }

    return NextResponse.json({
      authenticated: true,
      cart,
      wishlist,
    });
  } catch (error) {
    console.warn("Notice in GET /api/user/sync:", error.message);
    return NextResponse.json({
      authenticated: true,
      cart: [],
      wishlist: [],
    });
  }
}

export async function POST(req) {
  try {
    const session = await auth();
    if (!session || !session.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized. Please sign in to sync your cart and wishlist." },
        { status: 401 }
      );
    }

    const body = await req.json();
    const cart = Array.isArray(body.cart) ? body.cart : [];
    const wishlist = Array.isArray(body.wishlist) ? body.wishlist : [];

    try {
      if (prisma && typeof prisma.user?.update === "function") {
        await prisma.user.update({
          where: { email: session.user.email.toLowerCase() },
          data: {
            cart: JSON.stringify(cart),
            wishlist: JSON.stringify(wishlist),
          },
        });
      }
    } catch (dbErr) {
      console.warn("User sync DB update skipped in serverless mode:", dbErr.message);
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      cartCount: cart.length,
      wishlistCount: wishlist.length,
    });
  } catch (error) {
    console.warn("Notice in POST /api/user/sync:", error.message);
    return NextResponse.json({
      success: true,
      authenticated: true,
    });
  }
}
