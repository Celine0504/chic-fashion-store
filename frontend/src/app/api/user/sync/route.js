import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

    const user = await prisma.user.findUnique({
      where: { email: session.user.email.toLowerCase() },
      select: { cart: true, wishlist: true },
    });

    if (!user) {
      return NextResponse.json({
        authenticated: false,
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
    console.error("Error in GET /api/user/sync:", error);
    return NextResponse.json(
      { error: "Failed to fetch user cart/wishlist", cart: [], wishlist: [] },
      { status: 500 }
    );
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

    await prisma.user.update({
      where: { email: session.user.email.toLowerCase() },
      data: {
        cart: JSON.stringify(cart),
        wishlist: JSON.stringify(wishlist),
      },
    });

    return NextResponse.json({
      success: true,
      authenticated: true,
      cartCount: cart.length,
      wishlistCount: wishlist.length,
    });
  } catch (error) {
    console.error("Error in POST /api/user/sync:", error);
    return NextResponse.json(
      { error: error.message || "Failed to sync cart/wishlist to account" },
      { status: 500 }
    );
  }
}
