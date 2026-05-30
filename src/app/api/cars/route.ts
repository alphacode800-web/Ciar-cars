import { NextRequest } from 'next/server';
import { carListQuerySchema, createCarSchema } from '@/validators/car.schema';
import { carService } from '@/services/car.service';
import { auditService } from '@/services/audit.service';
import { createHandler } from '@/lib/api-handler';
import { apiSuccess, handleApiError } from '@/lib/api-response';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const queryObj: Record<string, string> = {};
    searchParams.forEach((v, k) => {
      queryObj[k] = v;
    });
    const query = carListQuerySchema.parse(queryObj);
    const result = await carService.list(query);
    return apiSuccess(result.cars, { pagination: result.pagination });
  } catch (error) {
    return handleApiError(error);
  }
}

export const POST = createHandler(
  async (req, { user, body }) => {
    const car = await carService.create(user!.id, body!);

    await auditService.log({
      userId: user!.id,
      action: 'car.create',
      entity: 'Car',
      entityId: car.id,
      details: { title: car.title, brand: car.brand },
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
    });

    return apiSuccess(car, { status: 201, message: 'Car listing created successfully' });
  },
  { auth: 'user', bodySchema: createCarSchema }
);
