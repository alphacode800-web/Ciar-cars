'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  getUserDashboard,
  getUserBookings,
  getUserWallet,
  getChatRooms,
  getUserProfile,
} from '@/lib/client-api';
import type { CarStatus, BookingStatus } from '@/types';

export interface DashboardListing {
  id: string;
  title: string;
  brand: string;
  year: number;
  price: number;
  status: CarStatus;
  isFeatured: boolean;
  views: number;
  inquiries: number;
  primaryImage: string | null;
}

export interface DashboardBooking {
  id: string;
  car: string;
  owner: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
}

export interface DashboardActivity {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  type: string;
}

export interface DashboardProfile {
  name: string;
  email: string;
  phone: string | null;
  bio: string | null;
  city: string | null;
  country: string | null;
}

export function useUserDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalListings: 0,
    activeListings: 0,
    totalViews: 0,
    totalInquiries: 0,
    pendingBookings: 0,
    walletBalance: 0,
    myBookingsCount: 0,
    unreadNotifications: 0,
  });
  const [listings, setListings] = useState<DashboardListing[]>([]);
  const [bookings, setBookings] = useState<DashboardBooking[]>([]);
  const [activities, setActivities] = useState<DashboardActivity[]>([]);
  const [transactions, setTransactions] = useState<
    Array<{ id: string; type: string; amount: number; description: string | null; createdAt: string }>
  >([]);
  const [chatRooms, setChatRooms] = useState<
    Array<{
      id: string;
      name: string;
      lastMessage: string | null;
      time: string;
      unread: number;
      carTitle: string | null;
    }>
  >([]);
  const [profile, setProfile] = useState<DashboardProfile | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, bookingsRes, walletRes, chatRes, profileRes] = await Promise.all([
        getUserDashboard(),
        getUserBookings({ limit: 10 }),
        getUserWallet(1, 10),
        getChatRooms(),
        getUserProfile(),
      ]);

      if (dashRes.success && dashRes.data) {
        const d = dashRes.data as {
          stats: typeof stats;
          recentCars: DashboardListing[];
          recentActivities: DashboardActivity[];
        };
        setStats(d.stats);
        setListings(d.recentCars ?? []);
        setActivities(
          (d.recentActivities ?? []).map((a) => ({
            id: a.id,
            title: a.title,
            message: a.message,
            createdAt: a.createdAt,
            type: a.type,
          }))
        );
      }

      if (bookingsRes.success && bookingsRes.data) {
        const raw = bookingsRes.data as Array<{
          id: string;
          startDate: string;
          endDate: string;
          totalDays: number;
          totalPrice: number;
          status: BookingStatus;
          car: { title: string; owner?: { name: string } };
        }>;
        setBookings(
          raw.map((b) => ({
            id: b.id,
            car: b.car?.title ?? 'Unknown',
            owner: b.car?.owner?.name ?? '—',
            startDate: new Date(b.startDate).toLocaleDateString(),
            endDate: new Date(b.endDate).toLocaleDateString(),
            totalDays: b.totalDays,
            totalPrice: b.totalPrice,
            status: b.status,
          }))
        );
      }

      if (walletRes.success && walletRes.data) {
        const w = walletRes.data as {
          balance: number;
          transactions: Array<{
            id: string;
            type: string;
            amount: number;
            description: string | null;
            createdAt: string;
          }>;
        };
        setStats((s) => ({ ...s, walletBalance: w.balance }));
        setTransactions(w.transactions ?? []);
      }

      if (chatRes.success && chatRes.data) {
        const rooms = chatRes.data as Array<{
          id: string;
          lastMessage: string | null;
          lastMessageAt: string | null;
          participants: Array<{ name: string | null }>;
          car: { title: string } | null;
          unreadCount: number;
        }>;
        setChatRooms(
          rooms.map((r) => ({
            id: r.id,
            name: r.participants[0]?.name ?? 'Chat',
            lastMessage: r.lastMessage,
            time: r.lastMessageAt
              ? new Date(r.lastMessageAt).toLocaleDateString()
              : '',
            unread: r.unreadCount ?? 0,
            carTitle: r.car?.title ?? null,
          }))
        );
      }

      if (profileRes.success && profileRes.data) {
        const p = profileRes.data as DashboardProfile;
        setProfile(p);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    loading,
    stats,
    listings,
    bookings,
    activities,
    transactions,
    chatRooms,
    profile,
    refresh,
  };
}
