// =============================================================================
// CIAR Cars - Platform Constants
// =============================================================================

// ============ CAR BRANDS ============

export const CAR_BRANDS = [
  "Toyota",
  "BMW",
  "Mercedes-Benz",
  "Audi",
  "Honda",
  "Hyundai",
  "Kia",
  "Nissan",
  "Chevrolet",
  "Ford",
  "Volkswagen",
  "Porsche",
  "Lexus",
  "Jeep",
  "Mazda",
  "Subaru",
  "Mitsubishi",
  "Volvo",
  "Land Rover",
  "Range Rover",
  "Mini",
  "Infiniti",
  "Acura",
  "Genesis",
  "Tesla",
  "BYD",
  "Peugeot",
  "Renault",
  "Fiat",
  "Skoda",
  "Seat",
  "Alfa Romeo",
  "Maserati",
  "Jaguar",
  "Bentley",
  "Rolls-Royce",
  "Lamborghini",
  "Ferrari",
  "Aston Martin",
  "Bugatti",
  "McLaren",
  "Suzuki",
  "Daihatsu",
  "Changan",
  "Geely",
  "Haval",
  "MG",
  "Chery",
  "Proton",
  "Tata",
  "Opel",
  "Citroen",
  "Dodge",
  "Ram",
  "GMC",
  "Lincoln",
  "Cadillac",
  "Buick",
  "Rivian",
  "Lucid",
  "Polestar",
] as const;

export type CarBrand = (typeof CAR_BRANDS)[number];

// ============ BODY TYPES ============

export const CAR_BODY_TYPES = [
  { value: "sedan", label: "Sedan", icon: "Car" },
  { value: "suv", label: "SUV", icon: "Mountain" },
  { value: "coupe", label: "Coupe", icon: "Zap" },
  { value: "truck", label: "Truck", icon: "Truck" },
  { value: "van", label: "Van / Minivan", icon: "Bus" },
  { value: "convertible", label: "Convertible", icon: "Sun" },
  { value: "hatchback", label: "Hatchback", icon: "CarFront" },
  { value: "wagon", label: "Wagon / Estate", icon: "Luggage" },
] as const;

// ============ FUEL TYPES ============

export const FUEL_TYPES = [
  { value: "petrol", label: "Petrol", icon: "Fuel" },
  { value: "diesel", label: "Diesel", icon: "Fuel" },
  { value: "electric", label: "Electric", icon: "Zap" },
  { value: "hybrid", label: "Hybrid", icon: "Leaf" },
] as const;

// ============ TRANSMISSION TYPES ============

export const TRANSMISSION_TYPES = [
  { value: "automatic", label: "Automatic" },
  { value: "manual", label: "Manual" },
  { value: "cvt", label: "CVT" },
] as const;

// ============ DRIVETRAIN TYPES ============

export const DRIVETRAIN_TYPES = [
  { value: "fwd", label: "Front-Wheel Drive (FWD)" },
  { value: "rwd", label: "Rear-Wheel Drive (RWD)" },
  { value: "awd", label: "All-Wheel Drive (AWD)" },
  { value: "4wd", label: "Four-Wheel Drive (4WD)" },
] as const;

// ============ CAR CONDITIONS ============

export const CAR_CONDITIONS = [
  { value: "new", label: "New", description: "Brand new from dealership" },
  { value: "used", label: "Used", description: "Pre-owned vehicles" },
] as const;

// ============ BOOKING STATUSES ============

export const BOOKING_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "confirmed", label: "Confirmed", color: "blue" },
  { value: "active", label: "Active", color: "green" },
  { value: "completed", label: "Completed", color: "emerald" },
  { value: "cancelled", label: "Cancelled", color: "red" },
  { value: "rejected", label: "Rejected", color: "red" },
] as const;

// ============ PAYMENT STATUSES ============

export const PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "completed", label: "Completed", color: "green" },
  { value: "failed", label: "Failed", color: "red" },
  { value: "refunded", label: "Refunded", color: "orange" },
] as const;

// ============ USER ROLES ============

export const USER_ROLES = [
  { value: "guest", label: "Guest", description: "Unauthenticated visitor" },
  { value: "user", label: "User", description: "Registered user" },
  {
    value: "seller",
    label: "Seller",
    description: "User who can list cars for sale/rent",
  },
  {
    value: "admin",
    label: "Admin",
    description: "Platform administrator",
  },
  {
    value: "super_admin",
    label: "Super Admin",
    description: "Full platform access with all permissions",
  },
] as const;

// ============ CURRENCY ============

// NOTE: This reads dynamically from localStorage so it reflects the user's
// selected currency. For reactive updates in components, use `useCurrencyStore`
// from `@/store/currency-store` instead.

const _STORAGE_KEY = 'ciar-currency';
const _DEFAULT = { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' };

function _getStored(): { code: string; symbol: string; name: string; locale: string } {
  if (typeof window === 'undefined') return _DEFAULT;
  try {
    const saved = localStorage.getItem(_STORAGE_KEY);
    if (saved) {
      const map: Record<string, { code: string; symbol: string; name: string; locale: string }> = {
        USD: { code: 'USD', symbol: '$', name: 'US Dollar', locale: 'en-US' },
        EUR: { code: 'EUR', symbol: '€', name: 'Euro', locale: 'de-DE' },
        GBP: { code: 'GBP', symbol: '£', name: 'British Pound', locale: 'en-GB' },
        SAR: { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal', locale: 'ar-SA' },
        AED: { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
        SDG: { code: 'SDG', symbol: 'ج.س', name: 'Sudanese Pound', locale: 'ar-SD' },
        SYP: { code: 'SYP', symbol: 'ل.س', name: 'Syrian Pound', locale: 'ar-SY' },
        KWD: { code: 'KWD', symbol: 'د.ك', name: 'Kuwaiti Dinar', locale: 'ar-KW' },
        QAR: { code: 'QAR', symbol: 'ر.ق', name: 'Qatari Riyal', locale: 'ar-QA' },
        BHD: { code: 'BHD', symbol: 'د.ب', name: 'Bahraini Dinar', locale: 'ar-BH' },
        OMR: { code: 'OMR', symbol: 'ر.ع', name: 'Omani Rial', locale: 'ar-OM' },
        TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', locale: 'tr-TR' },
      };
      return map[saved] ?? _DEFAULT;
    }
  } catch { /* ignore */ }
  return _DEFAULT;
}

export const CURRENCY: {
  readonly code: string;
  readonly symbol: string;
  readonly name: string;
  readonly locale: string;
} = {
  get code() { return _getStored().code; },
  get symbol() { return _getStored().symbol; },
  get name() { return _getStored().name; },
  get locale() { return _getStored().locale; },
};

// ============ CAR STATUS OPTIONS ============

export const CAR_STATUSES = [
  { value: "active", label: "Active", color: "green" },
  { value: "pending", label: "Pending Review", color: "yellow" },
  { value: "sold", label: "Sold", color: "blue" },
  { value: "archived", label: "Archived", color: "gray" },
] as const;

// ============ INSPECTION STATUSES ============

export const INSPECTION_STATUSES = [
  { value: "none", label: "Not Inspected", color: "gray" },
  { value: "pending", label: "Inspection Pending", color: "yellow" },
  { value: "passed", label: "Passed", color: "green" },
  { value: "failed", label: "Failed", color: "red" },
] as const;

// ============ PAYMENT TYPES ============

export const PAYMENT_TYPES = [
  { value: "listing_fee", label: "Listing Fee" },
  { value: "boost_fee", label: "Boost Fee" },
  { value: "rental", label: "Rental Payment" },
  { value: "wallet_topup", label: "Wallet Top-Up" },
  { value: "featured_fee", label: "Featured Fee" },
] as const;

// ============ PAYMENT METHODS ============

export const PAYMENT_METHODS = [
  { value: "stripe", label: "Credit/Debit Card" },
  { value: "wallet", label: "CIAR Wallet" },
  { value: "bank_transfer", label: "Bank Transfer" },
] as const;

// ============ WALLET TRANSACTION TYPES ============

export const WALLET_TRANSACTION_TYPES = [
  { value: "topup", label: "Top-Up", color: "green" },
  { value: "purchase", label: "Purchase", color: "red" },
  { value: "refund", label: "Refund", color: "blue" },
  { value: "earning", label: "Earning", color: "emerald" },
  { value: "withdrawal", label: "Withdrawal", color: "orange" },
] as const;

// ============ NOTIFICATION TYPES ============

export const NOTIFICATION_TYPES = [
  { value: "booking", label: "Booking Update" },
  { value: "message", label: "New Message" },
  { value: "payment", label: "Payment Update" },
  { value: "system", label: "System Notification" },
  { value: "review", label: "New Review" },
] as const;

// ============ RENTAL PAYMENT STATUSES ============

export const RENTAL_PAYMENT_STATUSES = [
  { value: "pending", label: "Pending", color: "yellow" },
  { value: "paid", label: "Paid", color: "green" },
  { value: "refunded", label: "Refunded", color: "orange" },
  { value: "partial_refund", label: "Partial Refund", color: "amber" },
] as const;

// ============ HOMEPAGE SECTION TYPES ============

export const HOMEPAGE_SECTION_TYPES = [
  { value: "hero", label: "Hero Banner" },
  { value: "featured_cars", label: "Featured Cars" },
  { value: "categories", label: "Browse by Category" },
  { value: "banner", label: "Promotional Banner" },
  { value: "testimonials", label: "Testimonials" },
  { value: "stats", label: "Platform Statistics" },
  { value: "cta", label: "Call to Action" },
] as const;

// ============ BANNER POSITIONS ============

export const BANNER_POSITIONS = [
  { value: "home", label: "Homepage" },
  { value: "listing", label: "Listing Page" },
  { value: "detail", label: "Car Detail Page" },
] as const;

// ============ NAVIGATION POSITIONS ============

export const NAVIGATION_POSITIONS = [
  { value: "navbar", label: "Navigation Bar" },
  { value: "footer", label: "Footer" },
] as const;

// ============ SPECIFICATION GROUPS ============

export const SPECIFICATION_GROUPS = [
  "Performance",
  "Safety",
  "Interior",
  "Exterior",
  "Comfort",
  "Technology",
] as const;

// ============ CHAT ROOM TYPES ============

export const CHAT_ROOM_TYPES = [
  { value: "private", label: "Private Chat" },
  { value: "support", label: "Support Chat" },
] as const;

// ============ MESSAGE TYPES ============

export const CHAT_MESSAGE_TYPES = [
  { value: "text", label: "Text Message" },
  { value: "image", label: "Image Message" },
  { value: "file", label: "File Attachment" },
  { value: "system", label: "System Message" },
] as const;

// ============ CAR COLORS ============

export const CAR_COLORS = [
  "White",
  "Black",
  "Silver",
  "Gray",
  "Red",
  "Blue",
  "Brown",
  "Beige",
  "Green",
  "Gold",
  "Orange",
  "Yellow",
  "Purple",
  "Bronze",
  "Maroon",
  "Navy",
] as const;

// ============ SORT OPTIONS ============

export const CAR_SORT_OPTIONS = [
  { value: "createdAt", label: "Newest First", order: "desc" },
  { value: "createdAt", label: "Oldest First", order: "asc" },
  { value: "price", label: "Price: Low to High", order: "asc" },
  { value: "price", label: "Price: High to Low", order: "desc" },
  { value: "year", label: "Year: Newest First", order: "desc" },
  { value: "year", label: "Year: Oldest First", order: "asc" },
  { value: "mileage", label: "Mileage: Low to High", order: "asc" },
  { value: "mileage", label: "Mileage: High to Low", order: "desc" },
  { value: "viewsCount", label: "Most Viewed", order: "desc" },
  { value: "horsepower", label: "Horsepower: High to Low", order: "desc" },
] as const;

// ============ PAGINATION ============

export const DEFAULT_PAGE_SIZE = 12;
export const PAGE_SIZE_OPTIONS = [12, 24, 36, 48] as const;

// ============ PLATFORM ============

export const PLATFORM_NAME = "CIAR Cars";
export const PLATFORM_TAGLINE = "The World's Premier Car Marketplace";
export const PLATFORM_DESCRIPTION =
  "Buy, sell, and rent cars with confidence on CIAR Cars — the world's most trusted automotive platform.";

// ============ FILE UPLOAD LIMITS ============

export const UPLOAD_LIMITS = {
  maxCarImages: 10,
  maxImageSizeMB: 5,
  maxFileSizeMB: 10,
  acceptedImageTypes: ["image/jpeg", "image/png", "image/webp", "image/avif"],
  acceptedFileTypes: [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
    "text/plain",
  ],
} as const;

// ============ RATING ============

export const RATING = {
  min: 1,
  max: 5,
  default: 0,
} as const;

// ============ BOOKING ============

export const BOOKING = {
  maxRentalDays: 90,
  minRentalDays: 1,
  advanceBookingDays: 365,
  platformFeePercent: 10,
} as const;

// ============ REVIEW ============

export const REVIEW = {
  minRating: 1,
  maxRating: 5,
  maxCommentLength: 1000,
} as const;
