// =============================================================================
// CIAR Cars - Enterprise Car Platform Type Definitions
// =============================================================================

// ============ ENUMS ============

export enum UserRole {
  GUEST = "guest",
  USER = "user",
  SELLER = "seller",
  ADMIN = "admin",
  SUPER_ADMIN = "super_admin",
}

export enum CarCondition {
  NEW = "new",
  USED = "used",
}

export enum FuelType {
  PETROL = "petrol",
  DIESEL = "diesel",
  ELECTRIC = "electric",
  HYBRID = "hybrid",
}

export enum TransmissionType {
  AUTOMATIC = "automatic",
  MANUAL = "manual",
  CVT = "cvt",
}

export enum DrivetrainType {
  FWD = "fwd",
  RWD = "rwd",
  AWD = "awd",
  FOURWD = "4wd",
}

export enum BodyType {
  SEDAN = "sedan",
  SUV = "suv",
  COUPE = "coupe",
  TRUCK = "truck",
  VAN = "van",
  CONVERTIBLE = "convertible",
  HATCHBACK = "hatchback",
  WAGON = "wagon",
}

export enum CarStatus {
  ACTIVE = "active",
  PENDING = "pending",
  SOLD = "sold",
  ARCHIVED = "archived",
}

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REJECTED = "rejected",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  REFUNDED = "refunded",
}

export enum RentalPaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  REFUNDED = "refunded",
  PARTIAL_REFUND = "partial_refund",
}

export enum InspectionStatus {
  NONE = "none",
  PENDING = "pending",
  PASSED = "passed",
  FAILED = "failed",
}

export enum ChatMessageType {
  TEXT = "text",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system",
}

export enum ChatRoomType {
  PRIVATE = "private",
  SUPPORT = "support",
}

export enum PaymentType {
  LISTING_FEE = "listing_fee",
  BOOST_FEE = "boost_fee",
  RENTAL = "rental",
  WALLET_TOPUP = "wallet_topup",
  FEATURED_FEE = "featured_fee",
}

export enum PaymentMethod {
  STRIPE = "stripe",
  WALLET = "wallet",
  BANK_TRANSFER = "bank_transfer",
}

export enum WalletTransactionType {
  TOPUP = "topup",
  PURCHASE = "purchase",
  REFUND = "refund",
  EARNING = "earning",
  WITHDRAWAL = "withdrawal",
}

export enum NotificationType {
  BOOKING = "booking",
  MESSAGE = "message",
  PAYMENT = "payment",
  SYSTEM = "system",
  REVIEW = "review",
}

export enum SettingType {
  STRING = "string",
  JSON = "json",
  NUMBER = "number",
  BOOLEAN = "boolean",
}

export enum HomepageSectionType {
  HERO = "hero",
  FEATURED_CARS = "featured_cars",
  CATEGORIES = "categories",
  BANNER = "banner",
  TESTIMONIALS = "testimonials",
  STATS = "stats",
  CTA = "cta",
}

export enum BannerPosition {
  HOME = "home",
  LISTING = "listing",
  DETAIL = "detail",
}

export enum NavigationPosition {
  NAVBAR = "navbar",
  FOOTER = "footer",
}

export enum SpecificationGroup {
  PERFORMANCE = "Performance",
  SAFETY = "Safety",
  INTERIOR = "Interior",
  EXTERIOR = "Exterior",
  COMFORT = "Comfort",
  TECHNOLOGY = "Technology",
}

// ============ VIEW / PAGE TYPES (SPA routing) ============

export type AppView =
  | "home"
  | "listing"
  | "detail"
  | "search"
  | "admin"
  | "admin-auth"
  | "dashboard"
  | "auth"
  | "chat"
  | "rental"
  | "profile"
  | "favorites"
  | "settings"
  | "checkout"
  | "my-listings"
  | "my-bookings"
  | "notifications"
  | "comparison"
  | "sell-car"
  | "wallet"
  | "about"
  | "contact";

// ============ USER TYPES ============

export interface User {
  id: string;
  email: string;
  password?: string | null;
  name?: string | null;
  phone?: string | null;
  avatar?: string | null;
  role: UserRole;
  emailVerified?: Date | null;
  isActive: boolean;
  isBanned: boolean;
  bannedReason?: string | null;

  // Wallet
  walletBalance: number;

  // Profile
  bio?: string | null;
  city?: string | null;
  country?: string | null;
  address?: string | null;

  // Seller specific
  businessName?: string | null;
  businessLicense?: string | null;
  rating: number;
  totalReviews: number;

  // Stats
  totalListings: number;
  totalSales: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, populated on demand)
  cars?: Car[];
  rentals?: RentalBooking[];
  chatRooms?: ChatRoomUser[];
  savedSearches?: SavedSearch[];
  reviews?: Review[];
  notifications?: Notification[];
  walletTransactions?: WalletTransaction[];
  payments?: Payment[];
}

export type UserPublic = Omit<
  User,
  | "password"
  | "emailVerified"
  | "isActive"
  | "isBanned"
  | "bannedReason"
  | "walletBalance"
  | "totalSales"
  | "payments"
>;

// ============ CAR TYPES ============

export interface Car {
  id: string;
  title: string;
  slug: string;
  description?: string | null;

  // Basic Info
  brand: string;
  model: string;
  year: number;
  condition: CarCondition;
  mileage?: number | null;
  exteriorColor?: string | null;
  interiorColor?: string | null;

  // Specs
  fuelType?: FuelType | null;
  transmission?: TransmissionType | null;
  engineSize?: string | null;
  horsepower?: number | null;
  drivetrain?: DrivetrainType | null;
  bodyType?: BodyType | null;
  doors?: number | null;
  seats?: number | null;

  // Location
  city: string;
  country: string;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;

  // Pricing
  price: number;
  currency: string;
  isNegotiable: boolean;

  // Status
  status: CarStatus;
  isFeatured: boolean;
  isBoosted: boolean;
  featuredUntil?: Date | null;
  boostedUntil?: Date | null;

  // Inspection
  inspectionStatus?: InspectionStatus | null;
  inspectionReport?: string | null;
  inspectedAt?: Date | null;

  // Rental
  isAvailableForRent: boolean;
  rentalPriceDaily?: number | null;
  rentalPriceWeekly?: number | null;
  rentalPriceMonthly?: number | null;

  // Ownership
  ownerId: string;
  ownershipCount: number;

  // Stats
  viewsCount: number;
  inquiriesCount: number;

  createdAt: Date;
  updatedAt: Date;

  // Relations (optional, populated on demand)
  owner?: User;
  images?: CarImage[];
  specifications?: CarSpecification[];
  rentalBookings?: RentalBooking[];
  reviews?: Review[];
  blockedDates?: RentalBlockedDate[];
}

export type CarListItem = Pick<
  Car,
  | "id"
  | "title"
  | "slug"
  | "brand"
  | "model"
  | "year"
  | "condition"
  | "price"
  | "currency"
  | "mileage"
  | "fuelType"
  | "transmission"
  | "bodyType"
  | "city"
  | "status"
  | "isFeatured"
  | "isBoosted"
  | "isNegotiable"
  | "isAvailableForRent"
  | "rentalPriceDaily"
  | "viewsCount"
  | "createdAt"
> & {
  primaryImage?: string | null;
  ownerName?: string | null;
  averageRating?: number | null;
  reviewCount?: number | null;
};

export type CarCreateInput = Omit<
  Car,
  | "id"
  | "slug"
  | "status"
  | "isFeatured"
  | "isBoosted"
  | "featuredUntil"
  | "boostedUntil"
  | "inspectionStatus"
  | "inspectionReport"
  | "inspectedAt"
  | "viewsCount"
  | "inquiriesCount"
  | "createdAt"
  | "updatedAt"
  | "owner"
  | "images"
  | "specifications"
  | "rentalBookings"
  | "reviews"
  | "blockedDates"
>;

export type CarUpdateInput = Partial<CarCreateInput> & {
  id: string;
};

// ============ CAR IMAGE ============

export interface CarImage {
  id: string;
  carId: string;
  url: string;
  alt?: string | null;
  isPrimary: boolean;
  order: number;
  createdAt: Date;

  car?: Car;
}

// ============ CAR SPECIFICATION ============

export interface CarSpecification {
  id: string;
  carId: string;
  key: string;
  value: string;
  group?: SpecificationGroup | string | null;

  car?: Car;
}

// ============ RENTAL TYPES ============

export interface RentalBooking {
  id: string;
  carId: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalPrice: number;
  status: BookingStatus;
  cancellationReason?: string | null;

  // Pricing breakdown
  dailyPrice: number;
  platformFee: number;
  ownerEarnings: number;

  // Delivery
  deliveryAddress?: string | null;
  deliveryFee: number;

  // Payment
  paymentStatus: RentalPaymentStatus;
  paymentId?: string | null;

  notes?: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  car?: Car;
  user?: User;
}

export interface RentalBlockedDate {
  id: string;
  carId: string;
  date: Date;
  reason?: string | null;
  createdAt: Date;

  car?: Car;
}

// ============ CHAT TYPES ============

export interface ChatRoom {
  id: string;
  carId?: string | null;
  type: ChatRoomType;

  // Metadata
  lastMessageAt?: Date | null;
  lastMessage?: string | null;
  isArchived: boolean;

  createdAt: Date;
  updatedAt: Date;

  // Relations
  participants?: (ChatRoomUser & { user?: User })[];
  messages?: ChatMessage[];
  car?: Car;
}

export interface ChatRoomUser {
  id: string;
  roomId: string;
  userId: string;
  lastReadAt?: Date | null;
  isMuted: boolean;

  room?: ChatRoom;
  user?: User;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  receiverId?: string | null;
  content: string;
  type: ChatMessageType;
  imageUrl?: string | null;
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;

  room?: ChatRoom;
  sender?: User;
  receiver?: User;
}

// ============ PAYMENT & WALLET ============

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  type: PaymentType;
  status: PaymentStatus;
  method?: PaymentMethod | null;

  // Stripe
  stripeSessionId?: string | null;
  stripePaymentIntentId?: string | null;

  // Related entities
  carId?: string | null;
  bookingId?: string | null;

  description?: string | null;
  metadata?: string | null; // JSON string

  createdAt: Date;
  updatedAt: Date;

  user?: User;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: WalletTransactionType;
  amount: number;
  balance: number;
  description?: string | null;
  referenceId?: string | null;
  createdAt: Date;

  user?: User;
}

// ============ REVIEW ============

export interface Review {
  id: string;
  carId: string;
  userId: string;
  rating: number; // 1-5
  comment?: string | null;
  createdAt: Date;

  car?: Car;
  user?: User;
}

// ============ SAVED SEARCH ============

export interface SavedSearch {
  id: string;
  userId: string;
  name?: string | null;
  filters: string; // JSON string of SearchFilters
  createdAt: Date;
  updatedAt: Date;

  user?: User;
}

// ============ NOTIFICATION ============

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: string | null; // JSON string
  isRead: boolean;
  readAt?: Date | null;
  createdAt: Date;

  user?: User;
}

// ============ CMS & SETTINGS ============

export interface SiteSetting {
  id: string;
  key: string;
  value: string;
  type: SettingType;
}

export interface HomepageSection {
  id: string;
  type: HomepageSectionType;
  title?: string | null;
  subtitle?: string | null;
  content?: string | null; // JSON string
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Banner {
  id: string;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  position: BannerPosition;
  order: number;
  isActive: boolean;
  startDate?: Date | null;
  endDate?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NavigationItem {
  id: string;
  label: string;
  url?: string | null;
  parentId?: string | null;
  icon?: string | null;
  order: number;
  isOpen: boolean; // Opens in new tab
  position: NavigationPosition;
  isActive: boolean;
  createdAt: Date;

  parent?: NavigationItem | null;
  children?: NavigationItem[];
}

// ============ AUDIT LOG ============

export interface AuditLog {
  id: string;
  userId?: string | null;
  action: string;
  entity?: string | null;
  entityId?: string | null;
  details?: string | null; // JSON string
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: Date;
}

// ============ FILTER TYPES ============

export interface SearchFilters extends CarSearchFilters {
  sortBy?: CarSortField;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface CarSearchFilters {
  // Text
  query?: string;

  // Basic
  brand?: string;
  model?: string;
  year?: { min?: number; max?: number };
  condition?: CarCondition;

  // Specs
  fuelType?: FuelType;
  transmission?: TransmissionType;
  drivetrain?: DrivetrainType;
  bodyType?: BodyType;
  engineSize?: string;
  horsepower?: { min?: number; max?: number };

  // Exterior
  exteriorColor?: string;
  interiorColor?: string;

  // Location
  city?: string;
  country?: string;

  // Pricing
  price?: { min?: number; max?: number };

  // Mileage
  mileage?: { min?: number; max?: number };

  // Status & flags
  status?: CarStatus;
  isFeatured?: boolean;
  isNegotiable?: boolean;
  isAvailableForRent?: boolean;

  // Seller
  ownerId?: string;

  // Rental pricing
  rentalPriceDaily?: { min?: number; max?: number };

  // Sorting
  sortBy?: CarSortField;
  sortOrder?: SortOrder;
}

export type CarSortField =
  | "price"
  | "createdAt"
  | "updatedAt"
  | "year"
  | "mileage"
  | "viewsCount"
  | "horsepower";

export type SortOrder = "asc" | "desc";

// ============ PAGINATION ============

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ============ API RESPONSE ============

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, unknown>;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

// ============ CHAT SOCKET EVENTS ============

export interface ChatSocketEvents {
  // Client -> Server
  "room:join": (roomId: string) => void;
  "room:leave": (roomId: string) => void;
  "message:send": (payload: {
    roomId: string;
    content: string;
    type?: ChatMessageType;
    imageUrl?: string;
  }) => void;
  "message:read": (payload: { roomId: string; messageId: string }) => void;
  "typing:start": (payload: { roomId: string }) => void;
  "typing:stop": (payload: { roomId: string }) => void;

  // Server -> Client
  "room:joined": (room: ChatRoom) => void;
  "room:left": (roomId: string) => void;
  "message:new": (message: ChatMessage) => void;
  "message:read:receipt": (payload: {
    roomId: string;
    messageId: string;
    readAt: Date;
  }) => void;
  "user:typing": (payload: { roomId: string; userId: string }) => void;
  "user:stop-typing": (payload: { roomId: string; userId: string }) => void;
  "room:updated": (room: ChatRoom) => void;
  "error": (error: { message: string }) => void;
}
