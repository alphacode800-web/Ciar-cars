# Task 12 - Admin Section Components

## Status: COMPLETED

## Work Log
- Created `/home/z/my-project/src/components/admin/OverviewSection.tsx`
- Created `/home/z/my-project/src/components/admin/UsersSection.tsx`
- Both components fetch REAL data from `/api/admin/stats` and `/api/admin/users` APIs
- Zero lint errors confirmed
- Dev server compiles successfully (HTTP 200)

## OverviewSection.tsx Features
- Fetches real stats via `getStats()` from `@/lib/admin-api`
- 4 animated stat cards (Total Users, Total Listings, Active Rentals, Revenue) with:
  - Real API values with compact number formatting
  - % change indicators with emerald/red badges
  - Mini sparkline bar animations using framer-motion
- Revenue AreaChart with emerald gradient fill (weekly mock data derived from API totals)
- New Users BarChart (monthly distribution from recentSignups data)
- Listings by Condition PieChart (donut style) using `cars.byCondition` data
- Bookings by Status PieChart (donut style) using `bookings.byStatus` data
- Recent Activity feed showing recentSignups with time-ago formatting
- Quick Actions panel with 6 navigation buttons (Pending Cars, Bookings, Users, Payments, Settings, Reports)
- Full loading skeleton state matching the real layout
- Error state with retry button
- Emerald/teal primary color scheme throughout
- Framer Motion staggered entrance animations
- Uses ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent from shadcn/ui chart
- Uses recharts: Area, AreaChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Pie, PieChart, Cell, ResponsiveContainer
- Responsive grid layouts (1-col mobile → 2-col tablet → 4-col desktop for stats)

## UsersSection.tsx Features
- Fetches real users via `getUsers()` with pagination from `@/lib/admin-api`
- Header with "Users Management" title and total user count
- Search input with 400ms debounce + Role filter dropdown + Status filter (All/Active/Banned)
- Responsive table with columns: Name (avatar+name+mobile email), Email (hidden on mobile), Role, Status, Joined (hidden on small), Actions
- Full pagination with page numbers, prev/next, and "Showing X–Y of Z" text
- Actions dropdown per row with 5 options:
  1. **View Details** → Opens Dialog with full user profile (avatar, info, wallet balance, stats grid, business info, recent cars, recent rentals)
  2. **Change Role** → Opens Dialog with Select dropdown (user, seller, admin, super_admin), calls `updateUser()` API
  3. **Ban User** → Opens Dialog with textarea for reason, calls `updateUser(id, {isBanned: true, bannedReason})`
  4. **Unban User** → Direct API call with `updateUser(id, {isBanned: false})`
  5. **Delete User** → Opens AlertDialog confirmation, calls `deleteUser()` API
- RoleBadge component: admin=red, super_admin=purple, seller=blue, user=gray
- StatusBadge component: active=emerald, banned=red, inactive=yellow
- Toast notifications for all actions (success/error) using `toast` from sonner
- Loading skeletons while data loads (initial + per-dialog)
- Error state with retry button
- After each action (role change, ban, unban, delete), refetches the users list
- All loading states on buttons during async operations
- Responsive: table columns hide on mobile, email shows as subtitle under name

## Shared Props
Both components accept `onNavigate: (section: string) => void` prop for quick action navigation.
