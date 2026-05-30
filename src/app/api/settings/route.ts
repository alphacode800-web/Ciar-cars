import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/api-auth";
import { apiSuccess, handleApiError } from "@/lib/api-response";

const PUBLIC_SETTING_KEYS = new Set([
  "site_name",
  "site_tagline",
  "support_email",
  "support_phone",
  "default_currency",
  "default_country",
  "social_facebook",
  "social_instagram",
  "social_twitter",
]);

// ============ GET: Settings (admin = all, public = safe subset) ============

export async function GET(request: NextRequest) {
  try {
    let settingsMap: Record<string, string> = {};

    try {
      await requireAdmin(request);
      const settings = await db.siteSetting.findMany({ orderBy: { key: "asc" } });
      for (const setting of settings) {
        settingsMap[setting.key] = setting.value;
      }
    } catch {
      const settings = await db.siteSetting.findMany({
        where: { key: { in: [...PUBLIC_SETTING_KEYS] } },
        orderBy: { key: "asc" },
      });
      for (const setting of settings) {
        settingsMap[setting.key] = setting.value;
      }
    }

    return apiSuccess(settingsMap);
  } catch (error) {
    return handleApiError(error);
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
