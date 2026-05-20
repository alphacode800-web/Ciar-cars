# Task: Create 2 admin section components

## Task ID: admin-sections
## Agent: Main Developer

## Work Log:
- Created `/src/components/admin/CarsSection.tsx` - Full cars management section
- Created `/src/components/admin/BookingsSection.tsx` - Full bookings management section
- Both components use real API calls from `@/lib/admin-api`
- Both use emerald/teal color scheme throughout
- Both have loading skeletons, error states with retry, and toast notifications
- Zero lint errors, dev server returns HTTP 200

## Files Created:
1. `src/components/admin/CarsSection.tsx`
2. `src/components/admin/BookingsSection.tsx`

## Stage Summary:
### CarsSection.tsx
- Header with gradient icon, title, total count, and refresh button
- Filters: search input with icon, status dropdown (all/active/pending/sold/archived), condition dropdown (all/new/used), clear button
- Responsive table with columns: Image (48x32 thumbnail with fallback), Title (brand model year), Owner (hidden on mobile), Price (emerald), Status (colored badge), Featured (star badge), Views (hidden on small), Actions dropdown
- Actions per row: View Details (uses `useAppStore().setView('detail', {carId, slug})`), Approve/Reject (pending only), Feature/Unfeature (toggles with 30-day featuredUntil), Mark as Sold, Archive, Delete (AlertDialog confirmation)
- Smart pagination with ellipsis for large page counts
- Full TypeScript types (AdminCar, CarOwner, CarCount, PaginationInfo)
- Helper functions: formatPrice (uses CURRENCY), statusColor, formatDate, fallbackImage (deterministic Unsplash hash)

### BookingsSection.tsx
- Header with gradient icon, title, total count, and refresh button
- 4 summary cards: Pending (yellow), Active (emerald), Completed (green), Total Revenue (teal, sums completed bookings)
- Filters: Status dropdown (all/pending/confirmed/active/completed/cancelled), Payment Status dropdown, clear button
- Responsive table: ID (truncated), User (name + email), Car (hidden on mobile), Dates (hidden on small), Duration, Amount (emerald), Status badge, Payment badge, Actions dropdown
- Actions per row: View Details (dialog with full booking info - renter, vehicle, dates, financial summary, notes), Approve (pending→confirmed), Start Rental (confirmed→active), Complete (active→completed), Cancel (AlertDialog with policy warning, destructive styling), Add/Edit Notes (dialog with textarea)
- Smart pagination with ellipsis
- Full TypeScript types (AdminBooking, BookingCar, BookingUser)
- Helper functions: formatPrice, formatDate, getDurationDays, bookingStatusStyle, paymentStatusStyle
