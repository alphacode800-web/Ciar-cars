// =============================================================================
// CIAR Cars - Navigation API
// GET /api/navigation - Get navigation items by position (navbar/footer)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position") || "navbar";

    const items = await db.navigationItem.findMany({
      where: {
        position,
        isActive: true,
        parentId: null, // Top-level only
      },
      orderBy: { order: "asc" },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { order: "asc" },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("[NAVIGATION_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch navigation items" },
      { status: 500 }
    );
  }
}
