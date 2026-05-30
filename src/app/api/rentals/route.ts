import { NextRequest } from 'next/server';
import { rentalService } from '@/services/rental.service';
import { createHandler } from '@/lib/api-handler';
import { apiSuccess, handleApiError } from '@/lib/api-response';
import { bookingListQuerySchema, createBookingSchema } from '@/validators/rental.schema';
import { requireAuth } from '@/lib/api-auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      queryObj[k] = v;
    });
    const query = bookingListQuerySchema.parse(queryObj);
    const result = await rentalService.list(user, query);
    return apiSuccess(result.bookings, { pagination: result.pagination });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = createHandler(
  async (_req, { user, body }) => {
    const booking = await rentalService.create(user!.id, body!);
    return apiSuccess(booking, { status: 201, message: 'Booking created successfully' });
  },
  { auth: 'user', bodySchema: createBookingSchema }
);
