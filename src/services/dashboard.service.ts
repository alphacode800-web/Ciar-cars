import { db } from '@/lib/db';
import type { AuthUser } from '@/lib/api-auth';

export const dashboardService = {
  async getUserDashboard(user: AuthUser) {
    const [
      totalListings,
      activeListings,
      totalViews,
      totalInquiries,
      pendingBookings,
      recentBookings,
      recentCars,
      unreadNotifications,
      walletBalance,
      myBookingsCount,
    ] = await Promise.all([
      db.car.count({ where: { ownerId: user.id } }),
      db.car.count({ where: { ownerId: user.id, status: 'active' } }),
      db.car.aggregate({ where: { ownerId: user.id }, _sum: { viewsCount: true } }),
      db.car.aggregate({ where: { ownerId: user.id }, _sum: { inquiriesCount: true } }),
      db.rentalBooking.count({
        where: { car: { ownerId: user.id }, status: 'pending' },
      }),
      db.rentalBooking.findMany({
        where: { OR: [{ userId: user.id }, { car: { ownerId: user.id } }] },
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          car: {
            select: {
              id: true,
              title: true,
              brand: true,
              model: true,
              year: true,
              images: { where: { isPrimary: true }, take: 1 },
              owner: { select: { id: true, name: true } },
            },
          },
          user: { select: { id: true, name: true, avatar: true } },
        },
      }),
      db.car.findMany({
        where: { ownerId: user.id },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          images: { where: { isPrimary: true }, take: 1 },
          _count: { select: { reviews: true } },
        },
      }),
      db.notification.count({ where: { userId: user.id, isRead: false } }),
      db.user.findUnique({
        where: { id: user.id },
        select: { walletBalance: true },
      }),
      db.rentalBooking.count({ where: { userId: user.id } }),
    ]);

    const recentActivities = await db.notification.findMany({
      where: { userId: user.id },
      take: 8,
      orderBy: { createdAt: 'desc' },
    });

    return {
      stats: {
        totalListings,
        activeListings,
        totalViews: totalViews._sum.viewsCount || 0,
        totalInquiries: totalInquiries._sum.inquiriesCount || 0,
        pendingBookings,
        walletBalance: walletBalance?.walletBalance ?? 0,
        myBookingsCount,
        unreadNotifications,
      },
      recentBookings,
      recentCars: recentCars.map((car) => ({
        id: car.id,
        title: car.title,
        brand: car.brand,
        year: car.year,
        price: car.price,
        status: car.status,
        isFeatured: car.isFeatured,
        views: car.viewsCount,
        inquiries: car.inquiriesCount,
        primaryImage: car.images[0]?.url ?? null,
        reviewCount: car._count.reviews,
      })),
      recentActivities,
    };
  },
};
