import { db } from '@/lib/db';

export const statsService = {
  async getAdminStats() {
    const [
      totalUsers,
      activeUsers,
      totalListings,
      activeListings,
      pendingListings,
      totalBookings,
      activeBookings,
      totalRevenue,
      paymentRevenue,
      recentSignups,
      carsByCondition,
      bookingsByStatus,
      topBrands,
    ] = await Promise.all([
      db.user.count(),
      db.user.count({ where: { isActive: true, isBanned: false } }),
      db.car.count(),
      db.car.count({ where: { status: 'active' } }),
      db.car.count({ where: { status: 'pending' } }),
      db.rentalBooking.count(),
      db.rentalBooking.count({
        where: { status: { in: ['pending', 'confirmed', 'active'] } },
      }),
      db.rentalBooking.aggregate({
        where: { status: 'completed' },
        _sum: { totalPrice: true },
      }),
      db.payment.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      db.user.findMany({
        where: {
          createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
      db.car.groupBy({ by: ['condition'], _count: true }),
      db.rentalBooking.groupBy({ by: ['status'], _count: true }),
      db.car.groupBy({
        by: ['brand'],
        where: { status: 'active' },
        _count: true,
        orderBy: { _count: { brand: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      users: { total: totalUsers, active: activeUsers, recentSignups },
      listings: { total: totalListings, active: activeListings, pending: pendingListings },
      bookings: {
        total: totalBookings,
        active: activeBookings,
        byStatus: bookingsByStatus.map((b) => ({ status: b.status, count: b._count })),
      },
      revenue: {
        rentals: totalRevenue._sum.totalPrice || 0,
        payments: paymentRevenue._sum.amount || 0,
        total: (totalRevenue._sum.totalPrice || 0) + (paymentRevenue._sum.amount || 0),
      },
      cars: {
        byCondition: carsByCondition.map((c) => ({
          condition: c.condition,
          count: c._count,
        })),
        topBrands: topBrands.map((b) => ({ brand: b.brand, count: b._count })),
      },
    };
  },
};
