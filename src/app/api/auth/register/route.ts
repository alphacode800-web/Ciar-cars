import { createHandler } from '@/lib/api-handler';
import { apiSuccess } from '@/lib/api-response';
import { registerSchema } from '@/validators/auth.schema';
import { userService } from '@/services/user.service';
import { auditService } from '@/services/audit.service';

export const POST = createHandler(
  async (req, { body }) => {
    const user = await userService.register(body!);

    await auditService.log({
      userId: user.id,
      action: 'user.register',
      entity: 'User',
      entityId: user.id,
      ipAddress: req.headers.get('x-forwarded-for') ?? undefined,
      userAgent: req.headers.get('user-agent') ?? undefined,
    });

    return apiSuccess(user, {
      status: 201,
      message: 'Account created successfully',
    });
  },
  { auth: 'public', bodySchema: registerSchema }
);
