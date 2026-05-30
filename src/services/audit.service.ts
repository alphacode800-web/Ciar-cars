import { db } from '@/lib/db';

export interface AuditLogInput {
  userId?: string;
  action: string;
  entity?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const auditService = {
  async log(input: AuditLogInput) {
    return db.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.entity,
        entityId: input.entityId,
        details: input.details ? JSON.stringify(input.details) : undefined,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
      },
    });
  },
};
