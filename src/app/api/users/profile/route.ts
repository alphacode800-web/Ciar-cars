// =============================================================================
// CIAR Cars - User Profile API
// GET /api/users/profile - Get current user profile
// PUT /api/users/profile - Update current user profile
// =============================================================================

import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/api-auth';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { userService } from '@/services/user.service';
import { updateProfileSchema } from '@/validators/user.schema';
import { ValidationError } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const profile = await userService.getById(user.id);
    return apiSuccess(profile);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((e) => e.message).join(', '));
    }

    const profile = await userService.updateProfile(user.id, parsed.data);
    return apiSuccess(profile, { message: 'Profile updated successfully' });
  } catch (error) {
    return handleApiError(error);
  }
}
