// =============================================================================
// CIAR Cars - Car Reviews API
// GET  /api/cars/[id]/reviews  - Get reviews for a car
// POST /api/cars/[id]/reviews  - Add a review (auth required)
// =============================================================================

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAuth } from "@/lib/api-auth";
import { REVIEW } from "@/lib/constants";

// ============ GET: List Reviews ============

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Verify car exists
    const car = await db.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "10")));
    const skip = (page - 1) * limit;

    const [reviews, total] = await Promise.all([
      db.review.findMany({
        where: { carId: id },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: { id: true, name: true, avatar: true },
          },
        },
      }),
      db.review.count({ where: { carId: id } }),
    ]);

    // Calculate average rating
    const allReviews = await db.review.findMany({
      where: { carId: id },
      select: { rating: true },
    });
    const avgRating =
      allReviews.length > 0
        ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
        : 0;

    return NextResponse.json({
      success: true,
      data: reviews,
      meta: {
        averageRating: Math.round(avgRating * 10) / 10,
        totalReviews: total,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("[REVIEWS_GET]", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// ============ POST: Add Review ============

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    // Verify car exists
    const car = await db.car.findUnique({ where: { id } });
    if (!car) {
      return NextResponse.json(
        { success: false, error: "Car not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { rating, comment } = body;

    // Validate rating
    if (!rating || rating < REVIEW.minRating || rating > REVIEW.maxRating) {
      return NextResponse.json(
        { success: false, error: `Rating must be between ${REVIEW.minRating} and ${REVIEW.maxRating}` },
        { status: 400 }
      );
    }

    // Validate comment length
    if (comment && comment.length > REVIEW.maxCommentLength) {
      return NextResponse.json(
        { success: false, error: `Comment must not exceed ${REVIEW.maxCommentLength} characters` },
        { status: 400 }
      );
    }

    // Check if user already reviewed this car
    const existingReview = await db.review.findUnique({
      where: { carId_userId: { carId: id, userId: user.id } },
    });

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this car" },
        { status: 409 }
      );
    }

    // Create review
    const review = await db.review.create({
      data: {
        carId: id,
        userId: user.id,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        user: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Update car owner rating
    const ownerReviews = await db.review.findMany({
      where: { userId: car.ownerId },
      select: { rating: true },
    });
    const ownerAvgRating =
      ownerReviews.length > 0
        ? ownerReviews.reduce((sum, r) => sum + r.rating, 0) / ownerReviews.length
        : 0;

    await db.user.update({
      where: { id: car.ownerId },
      data: {
        rating: Math.round(ownerAvgRating * 10) / 10,
        totalReviews: { increment: 1 },
      },
    });

    // Increment car inquiries count
    await db.car.update({
      where: { id },
      data: { inquiriesCount: { increment: 1 } },
    });

    return NextResponse.json(
      { success: true, data: review, message: "Review added successfully" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[REVIEWS_POST]", error);
    if (error instanceof Error && error.name === "AuthError") {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to add review" },
      { status: 500 }
    );
  }
}
