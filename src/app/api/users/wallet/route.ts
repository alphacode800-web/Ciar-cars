// =============================================================================
// CIAR Cars - User Wallet API
// GET /api/users/wallet - Get wallet info (balance, transactions)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { DEFAULT_PAGE_SIZE } from "@/lib/constants";

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE))));
    const skip = (page - 1) * limit;

    // Get user balance
    const userProfile = await db.user.findUnique({
      where: { id: user.id },
      select: { walletBalance: true },
    });

    if (!userProfile) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // Get wallet transactions
    const [transactions, total] = await Promise.all([
      db.walletTransaction.findMany({
        where: { userId: user.id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      db.walletTransaction.count({ where: { userId: user.id } }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        balance: userProfile.walletBalance,
        transactions,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: skip + limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error: unknown) {
    console.error("[WALLET_GET]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}
