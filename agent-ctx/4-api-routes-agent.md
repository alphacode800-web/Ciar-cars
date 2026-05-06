# Task ID: 4 - API Routes Agent
## Work Log

### Summary
Created all API route handlers for the CIAR Cars enterprise platform. A total of **24 files** were created covering 8 major route groups.

### Files Created

#### Auth Helper
- `src/lib/api-auth.ts` - JWT-based auth helper with `getAuthUser()`, `requireAuth()`, `requireAdmin()` utilities. Supports Bearer token decoding and X-User-Id fallback for development.

#### 1. Car Routes (5 files)
- `src/app/api/cars/route.ts` - GET (list with 15+ filters, pagination, sorting) + POST (create with images & specs)
- `src/app/api/cars/[id]/route.ts` - GET (full detail + increment views) + PUT (update with ownership check) + DELETE (with ownership/admin check)
- `src/app/api/cars/[id]/reviews/route.ts` - GET (paginated reviews with avg rating) + POST (add review with validation, 1 per user)
- `src/app/api/cars/featured/route.ts` - GET (featured cars, limit 8, active only)
- `src/app/api/cars/[id]/availability/route.ts` - GET (blocked dates + existing booking date ranges)

#### 2. Rental Routes (2 files)
- `src/app/api/rentals/route.ts` - GET (list with role-based filtering) + POST (create with date validation, overlap checking, price calculation with weekly rates, 10% platform fee)
- `src/app/api/rentals/[id]/route.ts` - GET (detail with access control) + PUT (status transitions with validation, auto-pay owner on completion)

#### 3. User Routes (4 files)
- `src/app/api/users/profile/route.ts` - GET + PUT (profile management)
- `src/app/api/users/dashboard/route.ts` - GET (stats, recent bookings, recent cars, unread messages)
- `src/app/api/users/wallet/route.ts` - GET (balance + paginated transactions)
- `src/app/api/users/notifications/route.ts` - GET (paginated, filterable) + PUT (mark as read)

#### 4. Settings/CMS Routes (4 files)
- `src/app/api/settings/route.ts` - GET (key-value map) + PUT (upsert settings, admin only)
- `src/app/api/homepage/route.ts` - GET (active, ordered) + POST/PUT/DELETE (admin only)
- `src/app/api/banners/route.ts` - GET (filtered by position, date range) + POST (admin only)
- `src/app/api/navigation/route.ts` - GET (by position with nested children)

#### 5. Admin Routes (5 files)
- `src/app/api/admin/stats/route.ts` - GET (platform stats: users, listings, bookings, revenue, charts data)
- `src/app/api/admin/users/route.ts` - GET (list with filters, pagination, relation counts)
- `src/app/api/admin/users/[id]/route.ts` - GET (full detail) + PUT (role, ban, activate) + DELETE (with self-protection)
- `src/app/api/admin/cars/route.ts` - GET (all cars including pending, with filters)
- `src/app/api/admin/cars/[id]/route.ts` - PUT (approve/reject/feature) + DELETE
- `src/app/api/admin/bookings/route.ts` - GET (all bookings with car + user details)

#### 6. Chat Routes (2 files)
- `src/app/api/chat/rooms/route.ts` - GET (user's rooms with participants) + POST (create/find room, deduplication)
- `src/app/api/chat/rooms/[id]/messages/route.ts` - GET (paginated, auto-mark-read) + POST (send message, update room lastMessage)

#### 7. Search Route (1 file)
- `src/app/api/search/route.ts` - GET (instant search across title/brand/model/description, top 8, sorted by featured then views)

#### 8. Upload Route (1 file)
- `src/app/api/upload/route.ts` - POST (placeholder URL generation for sandbox, file type validation)

### Key Design Decisions
- All routes use `{ success: boolean, data?, error? }` response format
- Proper error handling with try/catch on every handler
- Auth middleware via `requireAuth()` and `requireAdmin()` helpers
- JWT Bearer token decoding with X-User-Id fallback for development
- Pagination with `page`, `limit`, `total`, `totalPages`, `hasNext`, `hasPrev`
- Car creation defaults to `status: "pending"` for admin review
- Rental pricing supports daily, weekly rates, and 10% platform fee
- Booking status transitions are validated against allowed paths
- ESLint passes cleanly with zero errors
