// =============================================================================
// CIAR Cars - Settings API
// GET /api/settings - Get all settings
// PUT /api/settings - Update settings (admin only)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";

// ============ GET: All Settings ============

export async function GET() {
  try {
    const settings = await db.siteSetting.findMany({
      orderBy: { key: "asc" },
    });

    // Convert to key-value map
    const settingsMap: Record<string, string> = {};
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }

    return NextResponse.json({
      success: true,
      data: settingsMap,
    });
  } catch (error) {
    console.error("[SETTINGS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

// ============ PUT: Update Settings ============

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAdmin(request);

    const body = await request.json();
    const { settings } = body;

    if (!settings || typeof settings !== "object") {
      return NextResponse.json(
        { success: false, error: "Settings object is required" },
        { status: 400 }
      );
    }

    // Upsert each setting
    const updates = Object.entries(settings).map(async ([key, value]) => {
      const strValue = typeof value === "string" ? value : JSON.stringify(value);
      const type = typeof value === "boolean" ? "boolean"
        : typeof value === "number" ? "number"
        : typeof value === "object" ? "json"
        : "string";

      return db.siteSetting.upsert({
        where: { key },
        update: { value: strValue, type },
        create: { key, value: strValue, type },
      });
    });

    await Promise.all(updates);

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error: unknown) {
    console.error("[SETTINGS_PUT]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
