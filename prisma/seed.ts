// =============================================================================
// CIAR Cars - Database Seed Script
// Run with: npx tsx prisma/seed.ts
// =============================================================================

import { db } from "../src/lib/db";
import { hashPassword, DEMO_PASSWORD } from "./seed-helpers";

// =============================================================================
// HELPERS
// =============================================================================

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

function daysFromNow(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
}

// =============================================================================
// MAIN SEED FUNCTION
// =============================================================================

async function seed() {
  console.log("🚀 Seeding CIAR Cars database...\n");

  try {
    // =====================================================================
    // 0. CLEANUP - Delete existing data in reverse dependency order
    // =====================================================================
    console.log("🧹 Cleaning up existing data...");

    await db.chatMessage.deleteMany();
    await db.chatRoomUser.deleteMany();
    await db.chatRoom.deleteMany();
    await db.walletTransaction.deleteMany();
    await db.payment.deleteMany();
    await db.notification.deleteMany();
    await db.review.deleteMany();
    await db.rentalBlockedDate.deleteMany();
    await db.rentalBooking.deleteMany();
    await db.carSpecification.deleteMany();
    await db.carImage.deleteMany();
    await db.car.deleteMany();
    await db.savedSearch.deleteMany();
    await db.auditLog.deleteMany();
    await db.navigationItem.deleteMany();
    await db.banner.deleteMany();
    await db.homepageSection.deleteMany();
    await db.siteSetting.deleteMany();
    await db.user.deleteMany();

    console.log("  ✅ Cleaned up existing data");

    // =====================================================================
    // 1. USERS
    // =====================================================================
    console.log("📦 Creating users...");

    const demoHash = await hashPassword(DEMO_PASSWORD);

    const users = await Promise.all([
      db.user.create({
        data: {
          email: "super@ciar.com",
          name: "CIAR Super Admin",
          role: "super_admin",
          isActive: true,
          city: "Cairo",
          country: "Egypt",
          bio: "Platform super administrator with full access.",
          walletBalance: 0,
          totalListings: 0,
          totalSales: 0,
          rating: 0,
          totalReviews: 0,
        },
      }),
      db.user.create({
        data: {
          email: "admin@ciar.com",
          name: "CIAR Admin",
          role: "admin",
          isActive: true,
          city: "Cairo",
          country: "Egypt",
          bio: "Platform administrator.",
          walletBalance: 0,
          totalListings: 0,
          totalSales: 0,
          rating: 0,
          totalReviews: 0,
        },
      }),
      db.user.create({
        data: {
          email: "ahmed.hassan@email.com",
          name: "Ahmed Hassan",
          phone: "+201012345671",
          role: "seller",
          password: demoHash,
          isActive: true,
          city: "Cairo",
          country: "Egypt",
          address: "15 El Thawra St, Heliopolis, Cairo",
          bio: "Car enthusiast and dealer with over 10 years of experience. Specializing in luxury and performance vehicles.",
          businessName: "Ahmed Auto Gallery",
          rating: 4.8,
          totalReviews: 24,
          totalListings: 8,
          totalSales: 15,
          walletBalance: 12500,
        },
      }),
      db.user.create({
        data: {
          email: "sara.mohamed@email.com",
          name: "Sara Mohamed",
          phone: "+201098765432",
          role: "seller",
          password: demoHash,
          isActive: true,
          city: "Alexandria",
          country: "Egypt",
          address: "42 Stanley Bridge Rd, Alexandria",
          bio: "Family-owned dealership in Alexandria. Quality cars at honest prices. Every car is thoroughly inspected before listing.",
          businessName: "Alex Auto",
          rating: 4.6,
          totalReviews: 18,
          totalListings: 5,
          totalSales: 10,
          walletBalance: 8200,
        },
      }),
      db.user.create({
        data: {
          email: "omar.ali@email.com",
          name: "Omar Ali",
          phone: "+201155544433",
          role: "user",
          password: demoHash,
          isActive: true,
          city: "Giza",
          country: "Egypt",
          address: "8 Al Haram St, Giza",
          bio: "Looking for my next dream car!",
          walletBalance: 3500,
        },
      }),
      db.user.create({
        data: {
          email: "fatma.ibrahim@email.com",
          name: "Fatma Ibrahim",
          phone: "+201234567890",
          role: "seller",
          password: demoHash,
          isActive: true,
          city: "Cairo",
          country: "Egypt",
          address: "100 Salah Salem Rd, Nasr City, Cairo",
          bio: "Certified car dealer offering new and pre-owned vehicles. Rental services available for premium cars.",
          businessName: "Fatma Motors",
          rating: 4.9,
          totalReviews: 31,
          totalListings: 12,
          totalSales: 22,
          walletBalance: 28000,
        },
      }),
    ]);

    const [superAdmin, admin, ahmed, sara, omar, fatma] = users;

    console.log(`  ✅ Created ${users.length} users`);

    // Sample audit logs for admin panel
    await db.auditLog.createMany({
      data: [
        {
          userId: admin.id,
          action: "login",
          entity: "User",
          entityId: admin.id,
          details: "Admin login to dashboard",
          ipAddress: "127.0.0.1",
        },
        {
          userId: superAdmin.id,
          action: "settings",
          entity: "Settings",
          details: "Updated platform settings",
        },
        {
          userId: admin.id,
          action: "approve",
          entity: "Car",
          details: "Approved car listing",
        },
      ],
    });
    console.log("  ✅ Created sample audit logs");

    // =====================================================================
    // 2. CARS (15 cars with images, specs)
    // =====================================================================
    console.log("📦 Creating cars with images and specifications...");

    const carsData = [
      // 1. BMW 320i 2023 (new) - Ahmed, featured, rent
      {
        title: "BMW 320i 2023 - Brand New",
        slug: "bmw-320i-2023-brand-new",
        description:
          "Brand new BMW 320i M Sport in Alpine White. Full options package including heads-up display, Harman Kardon surround sound, adaptive LED headlights, and M Sport steering wheel. Still under factory warranty with free maintenance for 3 years. Located in Cairo, available for immediate delivery.",
        brand: "BMW",
        model: "320i",
        year: 2023,
        condition: "new",
        mileage: 10,
        exteriorColor: "White",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.0L Turbo",
        horsepower: 184,
        drivetrain: "rwd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1850000,
        isNegotiable: false,
        status: "active",
        isFeatured: true,
        isBoosted: true,
        featuredUntil: daysFromNow(60),
        boostedUntil: daysFromNow(30),
        isAvailableForRent: true,
        rentalPriceDaily: 3500,
        rentalPriceWeekly: 20000,
        rentalPriceMonthly: 65000,
        inspectionStatus: "passed",
        ownerId: ahmed.id,
        viewsCount: 342,
        inquiriesCount: 18,
        images: [
          {
            url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop",
            alt: "BMW 320i 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
            alt: "BMW 320i 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
            alt: "BMW 320i 2023 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1492144534655-09fa855f7b96?w=800&h=600&fit=crop",
            alt: "BMW 320i 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "7.1s", group: "Performance" },
          { key: "Top Speed", value: "235 km/h", group: "Performance" },
          { key: "Airbags", value: "8", group: "Safety" },
          { key: "ABS", value: "Yes", group: "Safety" },
          { key: "Lane Departure Warning", value: "Yes", group: "Safety" },
          { key: "Leather Seats", value: "Yes - Vernasca Leather", group: "Interior" },
          { key: "Sunroof", value: "Panoramic", group: "Interior" },
          { key: "Infotainment", value: "iDrive 8.0 with 10.25\" screen", group: "Technology" },
          { key: "Apple CarPlay", value: "Yes - Wireless", group: "Technology" },
          { key: "Android Auto", value: "Yes - Wireless", group: "Technology" },
        ],
      },
      // 2. Mercedes C200 2022 (used) - Sara, featured
      {
        title: "Mercedes-Benz C200 AMG 2022",
        slug: "mercedes-c200-amg-2022",
        description:
          "Excellent condition Mercedes C200 AMG Line 2022. One owner, full service history at authorized dealer. Obsidian Black metallic with Macchiato Beige interior. Features include AMG body kit, 18-inch AMG alloys, Burmester sound system, 360-degree camera, and ambient lighting. Accident-free, no scratches. Must see to appreciate.",
        brand: "Mercedes-Benz",
        model: "C200",
        year: 2022,
        condition: "used",
        mileage: 28500,
        exteriorColor: "Black",
        interiorColor: "Beige",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "1.5L Turbo",
        horsepower: 204,
        drivetrain: "rwd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Alexandria",
        price: 1750000,
        isNegotiable: true,
        status: "active",
        isFeatured: true,
        isBoosted: false,
        featuredUntil: daysFromNow(30),
        inspectionStatus: "passed",
        ownerId: sara.id,
        viewsCount: 567,
        inquiriesCount: 24,
        images: [
          {
            url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
            alt: "Mercedes C200 AMG 2022 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&h=600&fit=crop",
            alt: "Mercedes C200 AMG 2022 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop",
            alt: "Mercedes C200 AMG 2022 Dashboard",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=800&h=600&fit=crop",
            alt: "Mercedes C200 AMG 2022 Rear View",
            isPrimary: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1526726538690-5cbf956ae2fd?w=800&h=600&fit=crop",
            alt: "Mercedes C200 AMG 2022 Interior Detail",
            isPrimary: false,
            order: 4,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "7.3s", group: "Performance" },
          { key: "Top Speed", value: "246 km/h", group: "Performance" },
          { key: "Airbags", value: "7", group: "Safety" },
          { key: "Active Brake Assist", value: "Yes", group: "Safety" },
          { key: "Blind Spot Assist", value: "Yes", group: "Safety" },
          { key: "MBUX System", value: "11.9\" touchscreen", group: "Technology" },
          { key: "Burmester Sound", value: "12-speaker system", group: "Technology" },
          { key: "Ambient Lighting", value: "64 colors", group: "Interior" },
          { key: "Leather Seats", value: "Artico Leather", group: "Interior" },
        ],
      },
      // 3. Toyota Camry 2024 (new) - Fatma, featured, rent
      {
        title: "Toyota Camry 2024 - New",
        slug: "toyota-camry-2024-new",
        description:
          "Brand new 2024 Toyota Camry 2.5L Hybrid in Wind Chill Pearl. The all-new 9th generation with striking design, hybrid efficiency delivering up to 22 km/L, and Toyota Safety Sense 3.0. Loaded with features: 12.3-inch multimedia display, JBL premium audio, wireless charging, and smart key system. Full manufacturer warranty 5 years / 100,000 km.",
        brand: "Toyota",
        model: "Camry",
        year: 2024,
        condition: "new",
        mileage: 5,
        exteriorColor: "White",
        interiorColor: "Black",
        fuelType: "hybrid",
        transmission: "automatic",
        engineSize: "2.5L Hybrid",
        horsepower: 225,
        drivetrain: "fwd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1450000,
        isNegotiable: false,
        status: "active",
        isFeatured: true,
        isBoosted: true,
        featuredUntil: daysFromNow(90),
        boostedUntil: daysFromNow(45),
        isAvailableForRent: true,
        rentalPriceDaily: 2200,
        rentalPriceWeekly: 13000,
        rentalPriceMonthly: 42000,
        inspectionStatus: "passed",
        ownerId: fatma.id,
        viewsCount: 891,
        inquiriesCount: 42,
        images: [
          {
            url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
            alt: "Toyota Camry 2024 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1626668011687-8a114cf5a34c?w=800&h=600&fit=crop",
            alt: "Toyota Camry 2024 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=800&h=600&fit=crop",
            alt: "Toyota Camry 2024 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1514316454349-750a7fd3da3a?w=800&h=600&fit=crop",
            alt: "Toyota Camry 2024 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "Fuel Consumption", value: "22 km/L combined", group: "Performance" },
          { key: "0-100 km/h", value: "8.6s", group: "Performance" },
          { key: "Toyota Safety Sense", value: "TSS 3.0", group: "Safety" },
          { key: "Pre-Collision System", value: "Yes", group: "Safety" },
          { key: "Adaptive Cruise Control", value: "Yes", group: "Safety" },
          { key: "JBL Audio", value: "9 speakers + subwoofer", group: "Technology" },
          { key: "Wireless Charging", value: "Yes", group: "Technology" },
          { key: "Head-Up Display", value: "Yes", group: "Technology" },
        ],
      },
      // 4. Hyundai Tucson 2023 (used) - Ahmed, rent
      {
        title: "Hyundai Tucson 2023 - Excellent Condition",
        slug: "hyundai-tucson-2023-excellent",
        description:
          "Well-maintained Hyundai Tucson 2023 Ultimate trim in Amazon Gray. Full option with panoramic sunroof, 10.25-inch navigation, Bose premium sound, ventilated seats, and Hyundai SmartSense safety suite. Very low mileage, regularly serviced at authorized dealer. New tires, clean interior, no accidents.",
        brand: "Hyundai",
        model: "Tucson",
        year: 2023,
        condition: "used",
        mileage: 18500,
        exteriorColor: "Gray",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.0L",
        horsepower: 156,
        drivetrain: "awd",
        bodyType: "suv",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1250000,
        isNegotiable: true,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        isAvailableForRent: true,
        rentalPriceDaily: 1800,
        rentalPriceWeekly: 10500,
        rentalPriceMonthly: 35000,
        inspectionStatus: "passed",
        ownerId: ahmed.id,
        viewsCount: 234,
        inquiriesCount: 11,
        images: [
          {
            url: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop",
            alt: "Hyundai Tucson 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=600&fit=crop",
            alt: "Hyundai Tucson 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop",
            alt: "Hyundai Tucson 2023 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
            alt: "Hyundai Tucson 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
            alt: "Hyundai Tucson 2023 Boot Space",
            isPrimary: false,
            order: 4,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "10.4s", group: "Performance" },
          { key: "Boot Space", value: "616L", group: "Exterior" },
          { key: "Hyundai SmartSense", value: "Full Suite", group: "Safety" },
          { key: "Panoramic Sunroof", value: "Yes", group: "Interior" },
          { key: "Ventilated Seats", value: "Front", group: "Comfort" },
          { key: "Bose Audio", value: "8 speakers", group: "Technology" },
          { key: "Bluelink Connected", value: "Yes", group: "Technology" },
        ],
      },
      // 5. Kia Sportage 2023 (new) - Fatma, featured
      {
        title: "Kia Sportage 2023 - Brand New",
        slug: "kia-sportage-2023-brand-new",
        description:
          "Brand new Kia Sportage GT-Line in Sparkling Silver. The award-winning 5th generation SUV with bold design, premium interior, and advanced technology. Features include dual 12.3-inch curved displays, Harman Kardon premium audio, remote smart parking assist, and Highway Driving Assist 2. Full 7-year warranty.",
        brand: "Kia",
        model: "Sportage",
        year: 2023,
        condition: "new",
        mileage: 5,
        exteriorColor: "Silver",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "1.6L Turbo",
        horsepower: 180,
        drivetrain: "awd",
        bodyType: "suv",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1350000,
        isNegotiable: false,
        status: "active",
        isFeatured: true,
        isBoosted: false,
        featuredUntil: daysFromNow(45),
        inspectionStatus: "passed",
        ownerId: fatma.id,
        viewsCount: 445,
        inquiriesCount: 20,
        images: [
          {
            url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop",
            alt: "Kia Sportage 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop",
            alt: "Kia Sportage 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
            alt: "Kia Sportage 2023 Dashboard",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop",
            alt: "Kia Sportage 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "9.5s", group: "Performance" },
          { key: "Boot Space", value: "540L", group: "Exterior" },
          { key: "Harman Kardon", value: "12 speakers", group: "Technology" },
          { key: "Dual Screens", value: "12.3\" curved", group: "Technology" },
          { key: "Remote Smart Parking", value: "Yes", group: "Technology" },
          { key: "Leather Seats", value: "Yes - Synthetic", group: "Interior" },
          { key: "Heated Steering", value: "Yes", group: "Comfort" },
        ],
      },
      // 6. Audi A4 2022 (used) - Sara, featured
      {
        title: "Audi A4 45 TFSI Quattro 2022",
        slug: "audi-a4-45-tfsi-quattro-2022",
        description:
          "Premium Audi A4 45 TFSI Quattro S Line 2022 in Glacier White. One careful owner, full dealer service history. This car is in exceptional condition with all features working perfectly. Equipped with virtual cockpit, MMI Navigation Plus, B&O 3D sound, matrix LED headlights, and sport differential. Accident-free, all original paint.",
        brand: "Audi",
        model: "A4",
        year: 2022,
        condition: "used",
        mileage: 35000,
        exteriorColor: "White",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.0L TFSI",
        horsepower: 265,
        drivetrain: "awd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Alexandria",
        price: 1950000,
        isNegotiable: true,
        status: "active",
        isFeatured: true,
        isBoosted: true,
        featuredUntil: daysFromNow(30),
        boostedUntil: daysFromNow(15),
        inspectionStatus: "passed",
        ownerId: sara.id,
        viewsCount: 678,
        inquiriesCount: 29,
        images: [
          {
            url: "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&h=600&fit=crop",
            alt: "Audi A4 2022 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&h=600&fit=crop",
            alt: "Audi A4 2022 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop",
            alt: "Audi A4 2022 Virtual Cockpit",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
            alt: "Audi A4 2022 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "5.8s", group: "Performance" },
          { key: "Top Speed", value: "250 km/h (limited)", group: "Performance" },
          { key: "Matrix LED Headlights", value: "Yes", group: "Safety" },
          { key: "Quattro AWD", value: "Permanent", group: "Performance" },
          { key: "Virtual Cockpit", value: "12.3\" full digital", group: "Technology" },
          { key: "B&O 3D Sound", value: "19 speakers", group: "Technology" },
          { key: "MMI Navigation", value: "Plus with MIB3", group: "Technology" },
          { key: "S Line Interior", value: "Sport seats + flat-bottom wheel", group: "Interior" },
        ],
      },
      // 7. Nissan Patrol 2021 (used) - Ahmed
      {
        title: "Nissan Patrol 2021 - LE Platinum",
        slug: "nissan-patrol-2021-le-platinum",
        description:
          "Iconic Nissan Patrol 2021 LE Platinum in Super Black. The ultimate luxury SUV with powerful 5.6L V8 engine. Fully loaded with quilted semi-aniline leather, dual 12.3-inch displays, 13-speaker Bose audio, Intelligent Around View Monitor, and ProPILOT Assist. Very low mileage for a V8 SUV. Perfect condition inside and out.",
        brand: "Nissan",
        model: "Patrol",
        year: 2021,
        condition: "used",
        mileage: 42000,
        exteriorColor: "Black",
        interiorColor: "Brown",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "5.6L V8",
        horsepower: 400,
        drivetrain: "4wd",
        bodyType: "suv",
        doors: 4,
        seats: 8,
        city: "Sharm El Sheikh",
        price: 3200000,
        isNegotiable: true,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        inspectionStatus: "passed",
        ownerId: ahmed.id,
        viewsCount: 1234,
        inquiriesCount: 35,
        images: [
          {
            url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop",
            alt: "Nissan Patrol 2021 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
            alt: "Nissan Patrol 2021 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&h=600&fit=crop",
            alt: "Nissan Patrol 2021 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
            alt: "Nissan Patrol 2021 Rear View",
            isPrimary: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1492144534655-09fa855f7b96?w=800&h=600&fit=crop",
            alt: "Nissan Patrol 2021 Seats",
            isPrimary: false,
            order: 4,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "6.6s", group: "Performance" },
          { key: "Top Speed", value: "210 km/h", group: "Performance" },
          { key: "Towing Capacity", value: "3,500 kg", group: "Performance" },
          { key: "Around View Monitor", value: "Intelligent 360°", group: "Safety" },
          { key: "Intelligent Cruise Control", value: "Full Speed Range", group: "Safety" },
          { key: "Bose Audio", value: "13 speakers", group: "Technology" },
          { key: "Quilted Leather", value: "Semi-Aniline", group: "Interior" },
          { key: "Rear Entertainment", value: "Dual 8\" screens", group: "Interior" },
        ],
      },
      // 8. Chevrolet Camaro 2023 (new) - Ahmed, rent
      {
        title: "Chevrolet Camaro SS 2023 - New",
        slug: "chevrolet-camaro-ss-2023-new",
        description:
          "Brand new Chevrolet Camaro SS 2023 in Red Hot. The legendary American muscle car with 6.2L V8 producing 455 horsepower. Equipped with 10-speed automatic, Performance Data Recorder, Magnetic Ride Control, Brembo brakes, and Recaro sport seats. Head-turning looks and thrilling performance.",
        brand: "Chevrolet",
        model: "Camaro",
        year: 2023,
        condition: "new",
        mileage: 5,
        exteriorColor: "Red",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "6.2L V8",
        horsepower: 455,
        drivetrain: "rwd",
        bodyType: "coupe",
        doors: 2,
        seats: 4,
        city: "Cairo",
        price: 2800000,
        isNegotiable: false,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        isAvailableForRent: true,
        rentalPriceDaily: 5000,
        rentalPriceWeekly: 30000,
        rentalPriceMonthly: 95000,
        inspectionStatus: "passed",
        ownerId: ahmed.id,
        viewsCount: 1567,
        inquiriesCount: 38,
        images: [
          {
            url: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800&h=600&fit=crop",
            alt: "Chevrolet Camaro SS 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1580414057403-c5f451f30e1c?w=800&h=600&fit=crop",
            alt: "Chevrolet Camaro SS 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
            alt: "Chevrolet Camaro SS 2023 V8 Engine",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop",
            alt: "Chevrolet Camaro SS 2023 Interior",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "4.0s", group: "Performance" },
          { key: "Top Speed", value: "290 km/h", group: "Performance" },
          { key: "Brembo Brakes", value: "4-piston front", group: "Safety" },
          { key: "Magnetic Ride", value: "MRC 3.0", group: "Comfort" },
          { key: "Performance Data", value: "PDR with video", group: "Technology" },
          { key: "Recaro Seats", value: "Sport buckets", group: "Interior" },
          { key: "HUD", value: "Color Head-Up Display", group: "Technology" },
        ],
      },
      // 9. Honda Civic 2024 (new) - Fatma
      {
        title: "Honda Civic 2024 - New Sport Line",
        slug: "honda-civic-2024-new-sport",
        description:
          "Brand new Honda Civic 2024 Sport Line in Sonic Gray Pearl. The 11th generation Civic is the most refined yet, with a premium interior, Honda Sensing suite of safety features, and sporty styling. Features include 9-inch touchscreen, Bose premium audio, wireless Apple CarPlay/Android Auto, and LED fog lights. 8-year warranty available.",
        brand: "Honda",
        model: "Civic",
        year: 2024,
        condition: "new",
        mileage: 5,
        exteriorColor: "Gray",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "cvt",
        engineSize: "1.5L Turbo",
        horsepower: 180,
        drivetrain: "fwd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1050000,
        isNegotiable: false,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        inspectionStatus: "passed",
        ownerId: fatma.id,
        viewsCount: 312,
        inquiriesCount: 15,
        images: [
          {
            url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
            alt: "Honda Civic 2024 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=800&h=600&fit=crop",
            alt: "Honda Civic 2024 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&h=600&fit=crop",
            alt: "Honda Civic 2024 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&h=600&fit=crop",
            alt: "Honda Civic 2024 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "8.2s", group: "Performance" },
          { key: "Fuel Consumption", value: "18 km/L", group: "Performance" },
          { key: "Honda Sensing", value: "Full Suite", group: "Safety" },
          { key: "Bose Audio", value: "8 speakers", group: "Technology" },
          { key: "Wireless CarPlay", value: "Yes", group: "Technology" },
          { key: "LED Headlights", value: "Full LED", group: "Exterior" },
          { key: "Sport Seats", value: "Bolstered", group: "Interior" },
        ],
      },
      // 10. Porsche Cayenne 2022 (used) - Sara
      {
        title: "Porsche Cayenne S 2022",
        slug: "porsche-cayenne-s-2022",
        description:
          "Stunning Porsche Cayenne S 2022 in Carrara White Metallic. 2.9L twin-turbo V6 with 440 horsepower, paired with 8-speed Tiptronic and Porsche Traction Management. Loaded with Porsche Dynamic Chassis Control, air suspension, BOSE Surround Sound, Porsche Communication Management with 12.3-inch display, and Sport Chrono Package. 55,000 km with full Porsche Center history.",
        brand: "Porsche",
        model: "Cayenne",
        year: 2022,
        condition: "used",
        mileage: 55000,
        exteriorColor: "White",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.9L V6 Twin-Turbo",
        horsepower: 440,
        drivetrain: "awd",
        bodyType: "suv",
        doors: 4,
        seats: 5,
        city: "Alexandria",
        price: 4500000,
        isNegotiable: true,
        status: "active",
        isFeatured: false,
        isBoosted: true,
        boostedUntil: daysFromNow(20),
        inspectionStatus: "passed",
        ownerId: sara.id,
        viewsCount: 2100,
        inquiriesCount: 45,
        images: [
          {
            url: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
            alt: "Porsche Cayenne S 2022 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800&h=600&fit=crop",
            alt: "Porsche Cayenne S 2022 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1492144534655-09fa855f7b96?w=800&h=600&fit=crop",
            alt: "Porsche Cayenne S 2022 Dashboard",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=800&h=600&fit=crop",
            alt: "Porsche Cayenne S 2022 Rear View",
            isPrimary: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&h=600&fit=crop",
            alt: "Porsche Cayenne S 2022 Engine Bay",
            isPrimary: false,
            order: 4,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "5.0s", group: "Performance" },
          { key: "Top Speed", value: "265 km/h", group: "Performance" },
          { key: "Sport Chrono", value: "Yes", group: "Performance" },
          { key: "PASM", value: "Yes - Air Suspension", group: "Comfort" },
          { key: "BOSE Surround", value: "14 speakers", group: "Technology" },
          { key: "PCM", value: "12.3\" navigation", group: "Technology" },
          { key: "Porsche Active Safe", value: "Full Suite", group: "Safety" },
          { key: "Leather Interior", value: "Full leather", group: "Interior" },
        ],
      },
      // 11. Volkswagen Golf 2023 (new) - Fatma, rent
      {
        title: "Volkswagen Golf GTI 2023 - New",
        slug: "vw-golf-gti-2023-new",
        description:
          "Brand new Volkswagen Golf GTI 8th generation in Kings Red. The iconic hot hatch returns with a 2.0L turbocharged engine producing 245 hp. Features IQ.Light matrix LED headlights, 10-inch Discover Pro navigation, Harman Kardon sound, and the signature digital cockpit Pro. DSG gearbox with paddle shifters and progressive steering.",
        brand: "Volkswagen",
        model: "Golf GTI",
        year: 2023,
        condition: "new",
        mileage: 5,
        exteriorColor: "Red",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.0L TSI Turbo",
        horsepower: 245,
        drivetrain: "fwd",
        bodyType: "hatchback",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 1200000,
        isNegotiable: false,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        isAvailableForRent: true,
        rentalPriceDaily: 2000,
        rentalPriceWeekly: 12000,
        rentalPriceMonthly: 38000,
        inspectionStatus: "passed",
        ownerId: fatma.id,
        viewsCount: 289,
        inquiriesCount: 13,
        images: [
          {
            url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
            alt: "VW Golf GTI 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1606611013016-969c19ba27bb?w=800&h=600&fit=crop",
            alt: "VW Golf GTI 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1525609004556-c46c40d4f174?w=800&h=600&fit=crop",
            alt: "VW Golf GTI 2023 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1502877338535-766e1452684a?w=800&h=600&fit=crop",
            alt: "VW Golf GTI 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "6.4s", group: "Performance" },
          { key: "Top Speed", value: "250 km/h", group: "Performance" },
          { key: "IQ.Light", value: "Matrix LED", group: "Safety" },
          { key: "Travel Assist", value: "Yes", group: "Safety" },
          { key: "Digital Cockpit", value: "Pro 10.25\"", group: "Technology" },
          { key: "Harman Kardon", value: "8 speakers", group: "Technology" },
          { key: "GTI Sports Seats", value: "Clark Tartan", group: "Interior" },
        ],
      },
      // 12. Tesla Model 3 2024 (new) - Ahmed
      {
        title: "Tesla Model 3 Long Range 2024",
        slug: "tesla-model-3-long-range-2024",
        description:
          "All-new Tesla Model 3 Highland 2024 Long Range in Pearl White. The refreshed design features a sleeker front end, improved ride quality, ventilated seats, rear entertainment screen, and upgraded sound system. 629 km range, 0-100 in 5.8s. Full Self-Driving capability included. Zero emissions, zero compromises. Supercharger network access across Egypt.",
        brand: "Tesla",
        model: "Model 3",
        year: 2024,
        condition: "new",
        mileage: 0,
        exteriorColor: "White",
        interiorColor: "Black",
        fuelType: "electric",
        transmission: "automatic",
        engineSize: "Dual Motor Electric",
        horsepower: 346,
        drivetrain: "awd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 2200000,
        isNegotiable: false,
        status: "active",
        isFeatured: true,
        isBoosted: true,
        featuredUntil: daysFromNow(60),
        boostedUntil: daysFromNow(30),
        inspectionStatus: "none",
        ownerId: ahmed.id,
        viewsCount: 3456,
        inquiriesCount: 67,
        images: [
          {
            url: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&h=600&fit=crop",
            alt: "Tesla Model 3 2024 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1536700503339-1e4b06520771?w=800&h=600&fit=crop",
            alt: "Tesla Model 3 2024 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop",
            alt: "Tesla Model 3 2024 Touchscreen",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800&h=600&fit=crop",
            alt: "Tesla Model 3 2024 Rear View",
            isPrimary: false,
            order: 3,
          },
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
            alt: "Tesla Model 3 2024 Charging Port",
            isPrimary: false,
            order: 4,
          },
        ],
        specifications: [
          { key: "Range (WLTP)", value: "629 km", group: "Performance" },
          { key: "0-100 km/h", value: "5.8s", group: "Performance" },
          { key: "Charging Speed", value: "250 kW DC fast", group: "Performance" },
          { key: "Autopilot", value: "Basic + FSD Capability", group: "Safety" },
          { key: "Glass Roof", value: "Tinted panoramic", group: "Exterior" },
          { key: "15.4\" Touchscreen", value: "Center display", group: "Technology" },
          { key: "Rear Screen", value: "8\" entertainment", group: "Technology" },
          { key: "Premium Audio", value: "17 speakers + subwoofer", group: "Technology" },
        ],
      },
      // 13. Lexus ES 2023 (used) - Sara
      {
        title: "Lexus ES 350 F Sport 2023",
        slug: "lexus-es-350-f-sport-2023",
        description:
          "Luxurious Lexus ES 350 F Sport 2023 in Ultra White. Impeccable Japanese craftsmanship with Mark Levinson Reference Surround Sound, 12.3-inch multimedia display, adaptive variable suspension, and the F Sport design package. Extremely reliable 3.5L V6 engine. One owner, full Lexus dealer history, non-smoker, garage kept. 32,000 km only.",
        brand: "Lexus",
        model: "ES 350",
        year: 2023,
        condition: "used",
        mileage: 32000,
        exteriorColor: "White",
        interiorColor: "Red",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "3.5L V6",
        horsepower: 302,
        drivetrain: "fwd",
        bodyType: "sedan",
        doors: 4,
        seats: 5,
        city: "Cairo",
        price: 2400000,
        isNegotiable: true,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        inspectionStatus: "passed",
        ownerId: sara.id,
        viewsCount: 412,
        inquiriesCount: 19,
        images: [
          {
            url: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&h=600&fit=crop",
            alt: "Lexus ES 350 F Sport 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&h=600&fit=crop",
            alt: "Lexus ES 350 F Sport 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop",
            alt: "Lexus ES 350 F Sport 2023 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1614200187524-dc4b892acf16?w=800&h=600&fit=crop",
            alt: "Lexus ES 350 F Sport 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "6.1s", group: "Performance" },
          { key: "Top Speed", value: "240 km/h", group: "Performance" },
          { key: "Lexus Safety System+", value: "3.0", group: "Safety" },
          { key: "Mark Levinson Audio", value: "17 speakers", group: "Technology" },
          { key: "Adaptive Suspension", value: "AVS", group: "Comfort" },
          { key: "Panoramic Roof", value: "Glass", group: "Interior" },
          { key: "Naguri Aluminum", value: "F Sport trim", group: "Interior" },
        ],
      },
      // 14. MG HS 2023 (new) - Fatma
      {
        title: "MG HS Trophy 2023 - Brand New",
        slug: "mg-hs-trophy-2023-new",
        description:
          "Brand new MG HS Trophy 2023 in St. Louis Red. Outstanding value SUV with premium features at an affordable price. Comes with 10.1-inch touchscreen, MG Pilot driver assistance, 360-degree camera, panoramic sunroof, heated and ventilated front seats, and wireless phone charging. 7-year / 150,000 km warranty for total peace of mind.",
        brand: "MG",
        model: "HS",
        year: 2023,
        condition: "new",
        mileage: 5,
        exteriorColor: "Red",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "1.5L Turbo",
        horsepower: 162,
        drivetrain: "fwd",
        bodyType: "suv",
        doors: 4,
        seats: 5,
        city: "Giza",
        price: 780000,
        isNegotiable: false,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        inspectionStatus: "passed",
        ownerId: fatma.id,
        viewsCount: 567,
        inquiriesCount: 28,
        images: [
          {
            url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
            alt: "MG HS Trophy 2023 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1492144534655-09fa855f7b96?w=800&h=600&fit=crop",
            alt: "MG HS Trophy 2023 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1609521263047-f8f205293f24?w=800&h=600&fit=crop",
            alt: "MG HS Trophy 2023 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop",
            alt: "MG HS Trophy 2023 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "9.9s", group: "Performance" },
          { key: "Fuel Consumption", value: "14 km/L", group: "Performance" },
          { key: "MG Pilot", value: "ADAS Suite", group: "Safety" },
          { key: "360 Camera", value: "Yes", group: "Safety" },
          { key: "Panoramic Sunroof", value: "Yes", group: "Interior" },
          { key: "Ventilated Seats", value: "Front", group: "Comfort" },
          { key: "Touchscreen", value: "10.1\"", group: "Technology" },
        ],
      },
      // 15. Changan CS75 Plus 2024 (new) - Ahmed
      {
        title: "Changan CS75 Plus 2024 - Brand New",
        slug: "changan-cs75-plus-2024-new",
        description:
          "Brand new Changan CS75 Plus 2024 4th Generation in Cosmic Silver. The latest generation of China's best-selling SUV with futuristic design, dual 12.3-inch curved screens, 360-degree holographic projection HUD, and Huawei HiCar integration. Powered by a 2.0L Blue Core turbo engine with 233 hp. 5-year unlimited mileage warranty.",
        brand: "Changan",
        model: "CS75 Plus",
        year: 2024,
        condition: "new",
        mileage: 5,
        exteriorColor: "Silver",
        interiorColor: "Black",
        fuelType: "petrol",
        transmission: "automatic",
        engineSize: "2.0L Turbo",
        horsepower: 233,
        drivetrain: "fwd",
        bodyType: "suv",
        doors: 4,
        seats: 5,
        city: "Sharm El Sheikh",
        price: 820000,
        isNegotiable: false,
        status: "active",
        isFeatured: false,
        isBoosted: false,
        inspectionStatus: "passed",
        ownerId: ahmed.id,
        viewsCount: 445,
        inquiriesCount: 22,
        images: [
          {
            url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
            alt: "Changan CS75 Plus 2024 Front View",
            isPrimary: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1583267746897-2cf415887172?w=800&h=600&fit=crop",
            alt: "Changan CS75 Plus 2024 Side View",
            isPrimary: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1542362567-b07e54358753?w=800&h=600&fit=crop",
            alt: "Changan CS75 Plus 2024 Interior",
            isPrimary: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
            alt: "Changan CS75 Plus 2024 Rear View",
            isPrimary: false,
            order: 3,
          },
        ],
        specifications: [
          { key: "0-100 km/h", value: "8.5s", group: "Performance" },
          { key: "Fuel Consumption", value: "13 km/L", group: "Performance" },
          { key: "IACC", value: "Integrated Adaptive Cruise", group: "Safety" },
          { key: "360° Camera", value: "540P HD", group: "Safety" },
          { key: "HUD", value: "Holographic Projection", group: "Technology" },
          { key: "Dual Screens", value: "12.3\" curved", group: "Technology" },
          { key: "Sony Audio", value: "14 speakers", group: "Technology" },
          { key: "Zero Gravity Seats", value: "Front", group: "Comfort" },
        ],
      },
    ];

    // Create all cars with nested images and specifications
    const cars = [];
    for (const carData of carsData) {
      const { images, specifications, ...carFields } = carData;
      const car = await db.car.create({
        data: {
          ...carFields,
          images: { create: images },
          specifications: { create: specifications },
        },
      });
      cars.push(car);
    }

    console.log(`  ✅ Created ${cars.length} cars with images and specifications`);

    // =====================================================================
    // 3. REVIEWS (2-3 per car for some cars)
    // =====================================================================
    console.log("📦 Creating reviews...");

    const reviewsData: {
      carId: string;
      userId: string;
      rating: number;
      comment: string;
    }[] = [];

    // Reviews for BMW 320i
    reviewsData.push(
      {
        carId: cars[0].id,
        userId: omar.id,
        rating: 5,
        comment:
          "Absolutely stunning car! The M Sport package makes it look aggressive and premium. The 2.0L turbo is smooth and responsive. Ahmed is a great seller - honest and professional.",
      },
      {
        carId: cars[0].id,
        userId: fatma.id,
        rating: 4,
        comment:
          "Beautiful BMW, drives like a dream. The iDrive system is intuitive and the Harman Kardon sound is incredible. Only giving 4 stars because the ride is a bit firm on Cairo streets.",
      },
    );

    // Reviews for Mercedes C200
    reviewsData.push(
      {
        carId: cars[1].id,
        userId: ahmed.id,
        rating: 5,
        comment:
          "This Mercedes is in showroom condition. The AMG body kit looks fantastic and the Burmester sound system is the best I've heard in this class. Sara was very accommodating with test drives.",
      },
      {
        carId: cars[1].id,
        userId: omar.id,
        rating: 4,
        comment:
          "Great car, very comfortable ride quality. The MBUX system is the best infotainment in its class. Price is reasonable for the condition and mileage.",
      },
    );

    // Reviews for Toyota Camry
    reviewsData.push(
      {
        carId: cars[2].id,
        userId: ahmed.id,
        rating: 5,
        comment:
          "The new Camry is a game-changer. Hybrid fuel economy is amazing - I'm getting around 20 km/L in city driving. The design is bold and the tech is top-notch. Best value sedan in Egypt.",
      },
      {
        carId: cars[2].id,
        userId: sara.id,
        rating: 5,
        comment:
          "Bought this as a family car and couldn't be happier. Spacious interior, excellent safety features, and the hybrid engine saves a fortune on fuel. Toyota reliability at its best.",
      },
      {
        carId: cars[2].id,
        userId: omar.id,
        rating: 4,
        comment:
          "Very impressed with the new generation. The JBL audio system sounds premium. My only wish is that they offered the V6 option in Egypt.",
      },
    );

    // Reviews for Hyundai Tucson
    reviewsData.push(
      {
        carId: cars[3].id,
        userId: sara.id,
        rating: 4,
        comment:
          "Great value SUV with lots of features. The AWD system handles well in all conditions. Interior quality is a big step up from the previous generation.",
      },
    );

    // Reviews for Kia Sportage
    reviewsData.push(
      {
        carId: cars[4].id,
        userId: omar.id,
        rating: 5,
        comment:
          "This is probably the best-looking SUV in its segment. The dual curved displays are stunning and the build quality is excellent. Fatma Motors provided great service throughout the purchase.",
      },
      {
        carId: cars[4].id,
        userId: ahmed.id,
        rating: 4,
        comment:
          "Impressive design and features. The 1.6L turbo has plenty of power. The 7-year warranty gives great peace of mind. Highly recommended for families.",
      },
    );

    // Reviews for Audi A4
    reviewsData.push(
      {
        carId: cars[5].id,
        userId: fatma.id,
        rating: 5,
        comment:
          "The Quattro system is phenomenal - grips the road in all conditions. Virtual cockpit is gorgeous and the B&O sound is world-class. Sara is a trusted dealer, highly recommend.",
      },
      {
        carId: cars[5].id,
        userId: omar.id,
        rating: 5,
        comment:
          "Dream car! The 265 hp engine delivers effortless performance. Interior is built like a tank - everything feels premium. The matrix LED headlights are amazing at night.",
      },
      {
        carId: cars[5].id,
        userId: ahmed.id,
        rating: 4,
        comment:
          "Excellent car in every way. The S Line package adds aggressive styling without sacrificing comfort. Only slight issue is rear legroom could be better.",
      },
    );

    // Reviews for Nissan Patrol
    reviewsData.push(
      {
        carId: cars[6].id,
        userId: fatma.id,
        rating: 5,
        comment:
          "The king of SUVs! The V8 engine is incredibly powerful and sounds amazing. The interior is pure luxury - the quilted leather seats are gorgeous. Perfect for family road trips.",
      },
      {
        carId: cars[6].id,
        userId: omar.id,
        rating: 4,
        comment:
          "Incredible vehicle. The 4WD system handles desert terrain effortlessly. Fuel consumption is high but you expect that with a 5.6L V8. Bose sound system is a nice touch.",
      },
    );

    // Reviews for Chevrolet Camaro
    reviewsData.push(
      {
        carId: cars[7].id,
        userId: omar.id,
        rating: 5,
        comment:
          "Absolute beast! The V8 sound is intoxicating and the acceleration pins you to your seat. Magnetic Ride Control makes it surprisingly comfortable for daily driving. Head-turner everywhere it goes.",
      },
      {
        carId: cars[7].id,
        userId: sara.id,
        rating: 4,
        comment:
          "Thrilling performance car. The Performance Data Recorder is a great feature for track days. Not the most practical car but that's not why you buy a Camaro!",
      },
    );

    // Reviews for Tesla Model 3
    reviewsData.push(
      {
        carId: cars[11].id,
        userId: omar.id,
        rating: 5,
        comment:
          "The future is here! The new Highland design is beautiful. Range anxiety is real in Egypt but the 629 km claimed range gives confidence. The tech is lightyears ahead of any other car. Zero fuel costs are amazing.",
      },
      {
        carId: cars[11].id,
        userId: fatma.id,
        rating: 5,
        comment:
          "Switched from a BMW to this and never looking back. The instant torque is addictive, the interior is minimalist perfection, and Autopilot makes highway driving so relaxing. Charging at home is super convenient.",
      },
      {
        carId: cars[11].id,
        userId: sara.id,
        rating: 4,
        comment:
          "Incredible technology and efficiency. The ride quality is much improved in the Highland version. Only downside is the wait time for delivery and limited Supercharger coverage outside Cairo.",
      },
    );

    // Reviews for Porsche Cayenne
    reviewsData.push(
      {
        carId: cars[9].id,
        userId: ahmed.id,
        rating: 5,
        comment:
          "The ultimate performance SUV. The twin-turbo V6 is a masterpiece - smooth power delivery with a roaring soundtrack. The air suspension transforms from comfort to sport at the touch of a button.",
      },
      {
        carId: cars[9].id,
        userId: omar.id,
        rating: 5,
        comment:
          "Nothing drives like a Porsche. The handling is defying physics for a car this size. Build quality is impeccable. Sara at Alex Auto made the entire process seamless.",
      },
    );

    const reviews = await Promise.all(
      reviewsData.map((r) => db.review.create({ data: r })),
    );

    console.log(`  ✅ Created ${reviews.length} reviews`);

    // =====================================================================
    // 4. HOMEPAGE SECTIONS
    // =====================================================================
    console.log("📦 Creating homepage sections...");

    const homepageSections = await Promise.all([
      db.homepageSection.create({
        data: {
          type: "hero",
          title: "Find Your Perfect Car",
          subtitle:
            "Egypt's Premier Car Marketplace — Buy, sell, and rent with confidence",
          content: JSON.stringify({
            backgroundImage:
              "https://images.unsplash.com/photo-1492144534655-09fa855f7b96?w=1920&h=800&fit=crop",
            cta: { label: "Browse Cars", url: "/listing?condition=for-sale" },
            secondaryCta: {
              label: "Sell Your Car",
              url: "/sell-car",
            },
          }),
          order: 0,
          isActive: true,
        },
      }),
      db.homepageSection.create({
        data: {
          type: "stats",
          title: "Trusted by Thousands",
          subtitle: "Numbers that speak for themselves",
          content: JSON.stringify({
            stats: [
              { label: "Cars Listed", value: "5,000+", icon: "Car" },
              { label: "Happy Customers", value: "12,000+", icon: "Users" },
              { label: "Trusted Dealers", value: "500+", icon: "Store" },
              { label: "Cities Covered", value: "27", icon: "MapPin" },
            ],
          }),
          order: 1,
          isActive: true,
        },
      }),
      db.homepageSection.create({
        data: {
          type: "featured_cars",
          title: "Featured Cars",
          subtitle:
            "Handpicked premium vehicles from verified sellers",
          order: 2,
          isActive: true,
        },
      }),
      db.homepageSection.create({
        data: {
          type: "categories",
          title: "Browse by Category",
          subtitle: "Find exactly what you're looking for",
          content: JSON.stringify({
            categories: [
              {
                label: "Sedans",
                value: "sedan",
                count: 1200,
                image: "https://images.unsplash.com/photo-1549317661-bd32c8ce0afa?w=800&h=600&fit=crop",
              },
              {
                label: "SUVs",
                value: "suv",
                count: 1800,
                image: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=800&h=600&fit=crop",
              },
              {
                label: "Coupe",
                value: "coupe",
                count: 400,
                image: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?w=800&h=600&fit=crop",
              },
              {
                label: "Hatchback",
                value: "hatchback",
                count: 600,
                image: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800&h=600&fit=crop",
              },
              {
                label: "Trucks",
                value: "truck",
                count: 300,
                image: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?w=800&h=600&fit=crop",
              },
              {
                label: "Convertibles",
                value: "convertible",
                count: 150,
                image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&h=600&fit=crop",
              },
            ],
          }),
          order: 3,
          isActive: true,
        },
      }),
      db.homepageSection.create({
        data: {
          type: "banner",
          order: 4,
          isActive: true,
        },
      }),
      db.homepageSection.create({
        data: {
          type: "testimonials",
          title: "What Our Customers Say",
          subtitle: "Real stories from real buyers and sellers",
          content: JSON.stringify({
            testimonials: [
              {
                name: "Mohamed Kamel",
                role: "Car Buyer",
                comment:
                  "CIAR Cars made buying my dream BMW so easy. The process was transparent and the seller was verified. Couldn't be happier!",
                rating: 5,
              },
              {
                name: "Nour El-Din",
                role: "Car Seller",
                comment:
                  "I sold 3 cars through CIAR Cars in the past year. The platform reaches serious buyers and the process is smooth from listing to handover.",
                rating: 5,
              },
              {
                name: "Yasmine Abdel Aziz",
                role: "Rental Customer",
                comment:
                  "Rented a Tesla Model 3 for a weekend trip to Ain Sukhna. The car was spotless and the rental process was seamless. Will definitely use again!",
                rating: 5,
              },
            ],
          }),
          order: 5,
          isActive: true,
        },
      }),
    ]);

    console.log(`  ✅ Created ${homepageSections.length} homepage sections`);

    // =====================================================================
    // 5. SITE SETTINGS
    // =====================================================================
    console.log("📦 Creating site settings...");

    const settingsData = [
      { key: "site_name", value: "CIAR Cars", type: "string" },
      {
        key: "site_description",
        value: "Egypt's Premier Car Marketplace",
        type: "string",
      },
      { key: "site_currency", value: "EGP", type: "string" },
      { key: "platform_fee_percent", value: "5", type: "number" },
      {
        key: "default_listing_duration_days",
        value: "30",
        type: "number",
      },
      { key: "max_images_per_listing", value: "10", type: "number" },
      { key: "enable_rentals", value: "true", type: "boolean" },
      { key: "enable_chat", value: "true", type: "boolean" },
      { key: "featured_listing_price", value: "500", type: "number" },
      { key: "boost_listing_price", value: "300", type: "number" },
    ];

    const settings = await Promise.all(
      settingsData.map((s) =>
        db.siteSetting.create({ data: s }),
      ),
    );

    console.log(`  ✅ Created ${settings.length} site settings`);

    // =====================================================================
    // 6. BANNERS
    // =====================================================================
    console.log("📦 Creating banners...");

    const banners = await Promise.all([
      db.banner.create({
        data: {
          title: "Welcome to CIAR Cars",
          subtitle:
            "Egypt's most trusted platform for buying, selling, and renting cars. Join thousands of satisfied customers today.",
          imageUrl:
            "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=1200&h=400&fit=crop",
          linkUrl: "/listing",
          position: "home",
          order: 0,
          isActive: true,
          startDate: new Date(),
          endDate: daysFromNow(180),
        },
      }),
      db.banner.create({
        data: {
          title: "Special Offer - Featured Listing for Only E£500",
          subtitle:
            "Get your car featured on our homepage and reach 10x more buyers. Limited time offer!",
          imageUrl:
            "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&h=400&fit=crop",
          linkUrl: "/sell-car",
          position: "home",
          order: 1,
          isActive: true,
          startDate: new Date(),
          endDate: daysFromNow(90),
        },
      }),
      db.banner.create({
        data: {
          title: "Rent Premium Cars - Starting from E£1,800/Day",
          subtitle:
            "Choose from BMW, Mercedes, Tesla and more. All cars fully insured with roadside assistance.",
          imageUrl:
            "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1200&h=400&fit=crop",
          linkUrl: "/listing?condition=for-rent",
          position: "home",
          order: 2,
          isActive: true,
          startDate: new Date(),
          endDate: daysFromNow(120),
        },
      }),
    ]);

    console.log(`  ✅ Created ${banners.length} banners`);

    // =====================================================================
    // 7. NAVIGATION ITEMS
    // =====================================================================
    console.log("📦 Creating navigation items...");

    const navItems = await Promise.all([
      db.navigationItem.create({
        data: {
          label: "Home",
          url: "/",
          icon: "Home",
          order: 0,
          position: "navbar",
          isActive: true,
        },
      }),
      db.navigationItem.create({
        data: {
          label: "Buy Cars",
          url: "/listing?condition=for-sale",
          icon: "Search",
          order: 1,
          position: "navbar",
          isActive: true,
        },
      }),
      db.navigationItem.create({
        data: {
          label: "Rent Cars",
          url: "/listing?condition=for-rent",
          icon: "Calendar",
          order: 2,
          position: "navbar",
          isActive: true,
        },
      }),
      db.navigationItem.create({
        data: {
          label: "Sell Your Car",
          url: "/sell-car",
          icon: "Plus",
          order: 3,
          position: "navbar",
          isActive: true,
        },
      }),
      db.navigationItem.create({
        data: {
          label: "About",
          url: "/about",
          icon: "Info",
          order: 4,
          position: "navbar",
          isActive: true,
        },
      }),
      db.navigationItem.create({
        data: {
          label: "Contact",
          url: "/contact",
          icon: "Phone",
          order: 5,
          position: "navbar",
          isActive: true,
        },
      }),
    ]);

    console.log(`  ✅ Created ${navItems.length} navigation items`);

    // =====================================================================
    // 8. RENTAL BOOKINGS (3 bookings)
    // =====================================================================
    console.log("📦 Creating rental bookings...");

    // BMW 320i rental - completed booking by Omar
    const booking1 = await db.rentalBooking.create({
      data: {
        carId: cars[0].id,
        userId: omar.id,
        startDate: daysAgo(15),
        endDate: daysAgo(8),
        totalDays: 7,
        totalPrice: 14000,
        status: "completed",
        dailyPrice: 3500,
        platformFee: 1400,
        ownerEarnings: 12600,
        deliveryAddress: "8 Al Haram St, Giza",
        deliveryFee: 500,
        paymentStatus: "paid",
        notes: "Great experience! Car was in perfect condition.",
      },
    });

    // Toyota Camry rental - confirmed booking by Omar
    const booking2 = await db.rentalBooking.create({
      data: {
        carId: cars[2].id,
        userId: omar.id,
        startDate: daysFromNow(5),
        endDate: daysFromNow(12),
        totalDays: 7,
        totalPrice: 15400,
        status: "confirmed",
        dailyPrice: 2200,
        platformFee: 1540,
        ownerEarnings: 13860,
        deliveryAddress: "8 Al Haram St, Giza",
        deliveryFee: 0,
        paymentStatus: "paid",
        notes: "Family trip to Alexandria.",
      },
    });

    // Chevrolet Camaro rental - pending booking by Sara
    const booking3 = await db.rentalBooking.create({
      data: {
        carId: cars[7].id,
        userId: sara.id,
        startDate: daysFromNow(10),
        endDate: daysFromNow(14),
        totalDays: 4,
        totalPrice: 20000,
        status: "pending",
        dailyPrice: 5000,
        platformFee: 2000,
        ownerEarnings: 18000,
        deliveryAddress: "42 Stanley Bridge Rd, Alexandria",
        deliveryFee: 1000,
        paymentStatus: "pending",
        notes: "Weekend getaway - Camaro for the North Coast!",
      },
    });

    console.log(
      `  ✅ Created 3 rental bookings (completed, confirmed, pending)`,
    );

    // =====================================================================
    // 9. CHAT ROOMS & MESSAGES
    // =====================================================================
    console.log("📦 Creating chat rooms and messages...");

    // Chat 1: Omar asking Ahmed about BMW 320i
    const chatRoom1 = await db.chatRoom.create({
      data: {
        carId: cars[0].id,
        type: "private",
        lastMessageAt: daysAgo(2),
        lastMessage: "Okay, I'll book it for next weekend. Thanks Ahmed!",
        isArchived: false,
      },
    });

    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom1.id,
        userId: omar.id,
        lastReadAt: daysAgo(2),
        isMuted: false,
      },
    });
    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom1.id,
        userId: ahmed.id,
        lastReadAt: daysAgo(2),
        isMuted: false,
      },
    });

    await db.chatMessage.createMany({
      data: [
        {
          roomId: chatRoom1.id,
          senderId: omar.id,
          receiverId: ahmed.id,
          content:
            "Hi Ahmed, I'm very interested in the BMW 320i. Is it still available?",
          type: "text",
          isRead: true,
          readAt: daysAgo(5),
          createdAt: daysAgo(5),
        },
        {
          roomId: chatRoom1.id,
          senderId: ahmed.id,
          receiverId: omar.id,
          content:
            "Hello Omar! Yes, the BMW is still available. It's in perfect condition. Would you like to schedule a test drive?",
          type: "text",
          isRead: true,
          readAt: daysAgo(5),
          createdAt: daysAgo(5),
        },
        {
          roomId: chatRoom1.id,
          senderId: omar.id,
          receiverId: ahmed.id,
          content:
            "Yes, that would be great! Can I also see the full inspection report?",
          type: "text",
          isRead: true,
          readAt: daysAgo(4),
          createdAt: daysAgo(4),
        },
        {
          roomId: chatRoom1.id,
          senderId: ahmed.id,
          receiverId: omar.id,
          content:
            "Of course! I'll send you the report. The car passed inspection with flying colors. I'm available this Saturday for a test drive at my showroom in Heliopolis.",
          type: "text",
          isRead: true,
          readAt: daysAgo(4),
          createdAt: daysAgo(4),
        },
        {
          roomId: chatRoom1.id,
          senderId: omar.id,
          receiverId: ahmed.id,
          content:
            "I noticed it's also available for rent. How much for a weekend?",
          type: "text",
          isRead: true,
          readAt: daysAgo(3),
          createdAt: daysAgo(3),
        },
        {
          roomId: chatRoom1.id,
          senderId: ahmed.id,
          receiverId: omar.id,
          content:
            "E£3,500/day or E£20,000 for a full week. That includes basic insurance. I can also deliver it to you in Giza for an extra E£500.",
          type: "text",
          isRead: true,
          readAt: daysAgo(3),
          createdAt: daysAgo(3),
        },
        {
          roomId: chatRoom1.id,
          senderId: omar.id,
          receiverId: ahmed.id,
          content:
            "Okay, I'll book it for next weekend. Thanks Ahmed!",
          type: "text",
          isRead: true,
          readAt: daysAgo(2),
          createdAt: daysAgo(2),
        },
      ],
    });

    // Chat 2: Sara asking Fatma about Toyota Camry
    const chatRoom2 = await db.chatRoom.create({
      data: {
        carId: cars[2].id,
        type: "private",
        lastMessageAt: daysAgo(1),
        lastMessage:
          "The hybrid system is amazing, Sara. You'll save so much on fuel. Let me know if you want to come see it!",
        isArchived: false,
      },
    });

    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom2.id,
        userId: sara.id,
        lastReadAt: daysAgo(1),
        isMuted: false,
      },
    });
    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom2.id,
        userId: fatma.id,
        lastReadAt: daysAgo(1),
        isMuted: false,
      },
    });

    await db.chatMessage.createMany({
      data: [
        {
          roomId: chatRoom2.id,
          senderId: sara.id,
          receiverId: fatma.id,
          content:
            "Hi Fatma, I'm looking for a reliable family car. Is the Toyota Camry Hybrid still available?",
          type: "text",
          isRead: true,
          readAt: daysAgo(3),
          createdAt: daysAgo(3),
        },
        {
          roomId: chatRoom2.id,
          senderId: fatma.id,
          receiverId: sara.id,
          content:
            "Hi Sara! Yes, the Camry Hybrid is brand new and ready for delivery. It's the best family car on the market right now. Excellent fuel economy and Toyota reliability.",
          type: "text",
          isRead: true,
          readAt: daysAgo(3),
          createdAt: daysAgo(3),
        },
        {
          roomId: chatRoom2.id,
          senderId: sara.id,
          receiverId: fatma.id,
          content:
            "What colors do you have available? And what's the warranty coverage?",
          type: "text",
          isRead: true,
          readAt: daysAgo(2),
          createdAt: daysAgo(2),
        },
        {
          roomId: chatRoom2.id,
          senderId: fatma.id,
          receiverId: sara.id,
          content:
            "We have Wind Chill Pearl (white), Celestial Silver, and Underground (black). Toyota offers 5 years / 100,000 km warranty on the hybrid battery as well. I can offer a small discount if you decide this week!",
          type: "text",
          isRead: true,
          readAt: daysAgo(2),
          createdAt: daysAgo(2),
        },
        {
          roomId: chatRoom2.id,
          senderId: sara.id,
          receiverId: fatma.id,
          content:
            "That sounds great. I'm interested in the white one. Can I come see it on Thursday?",
          type: "text",
          isRead: true,
          readAt: daysAgo(1),
          createdAt: daysAgo(1),
        },
        {
          roomId: chatRoom2.id,
          senderId: fatma.id,
          receiverId: sara.id,
          content:
            "The hybrid system is amazing, Sara. You'll save so much on fuel. Let me know if you want to come see it!",
          type: "text",
          isRead: true,
          readAt: daysAgo(1),
          createdAt: daysAgo(1),
        },
      ],
    });

    // Chat 3: Omar asking Sara about Audi A4
    const chatRoom3 = await db.chatRoom.create({
      data: {
        carId: cars[5].id,
        type: "private",
        lastMessageAt: daysAgo(1),
        lastMessage:
          "The Audi is in excellent condition, Omar. Full dealer service history. I can arrange a video call to show you around the car if you'd like.",
        isArchived: false,
      },
    });

    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom3.id,
        userId: omar.id,
        lastReadAt: daysAgo(1),
        isMuted: false,
      },
    });
    await db.chatRoomUser.create({
      data: {
        roomId: chatRoom3.id,
        userId: sara.id,
        lastReadAt: daysAgo(1),
        isMuted: false,
      },
    });

    await db.chatMessage.createMany({
      data: [
        {
          roomId: chatRoom3.id,
          senderId: omar.id,
          receiverId: sara.id,
          content:
            "Hello Sara, I saw your listing for the Audi A4 Quattro. Can you tell me more about the service history?",
          type: "text",
          isRead: true,
          readAt: daysAgo(2),
          createdAt: daysAgo(2),
        },
        {
          roomId: chatRoom3.id,
          senderId: sara.id,
          receiverId: omar.id,
          content:
            "Hi Omar! The Audi has full service history at the Audi Center in Cairo. All services done on time, with records available. The car has been meticulously maintained.",
          type: "text",
          isRead: true,
          readAt: daysAgo(2),
          createdAt: daysAgo(2),
        },
        {
          roomId: chatRoom3.id,
          senderId: omar.id,
          receiverId: sara.id,
          content:
            "That's great to hear. Is the price negotiable? I'm really interested but my budget is a bit tight.",
          type: "text",
          isRead: true,
          readAt: daysAgo(1),
          createdAt: daysAgo(1),
        },
        {
          roomId: chatRoom3.id,
          senderId: sara.id,
          receiverId: omar.id,
          content:
            "The Audi is in excellent condition, Omar. Full dealer service history. I can arrange a video call to show you around the car if you'd like.",
          type: "text",
          isRead: true,
          readAt: daysAgo(1),
          createdAt: daysAgo(1),
        },
      ],
    });

    console.log(
      "  ✅ Created 3 chat rooms with messages",
    );

    // =====================================================================
    // 10. WALLET TRANSACTIONS (a few for context)
    // =====================================================================
    console.log("📦 Creating wallet transactions...");

    await db.walletTransaction.createMany({
      data: [
        {
          userId: omar.id,
          type: "topup",
          amount: 5000,
          balance: 5000,
          description: "Wallet top-up via bank transfer",
          createdAt: daysAgo(20),
        },
        {
          userId: omar.id,
          type: "purchase",
          amount: 15400,
          balance: 3500,
          description: "Toyota Camry rental payment (7 days)",
          createdAt: daysFromNow(3),
        },
        {
          userId: omar.id,
          type: "purchase",
          amount: 500,
          balance: 3000,
          description: "BMW 320i rental delivery fee",
          createdAt: daysAgo(15),
        },
        {
          userId: ahmed.id,
          type: "earning",
          amount: 12600,
          balance: 12500,
          description: "BMW 320i rental earning (7 days) minus platform fee",
          createdAt: daysAgo(8),
        },
        {
          userId: ahmed.id,
          type: "purchase",
          amount: 500,
          balance: 13000,
          description: "Featured listing fee - BMW 320i",
          createdAt: daysAgo(30),
        },
        {
          userId: ahmed.id,
          type: "purchase",
          amount: 300,
          balance: 13500,
          description: "Boost listing fee - BMW 320i",
          createdAt: daysAgo(15),
        },
        {
          userId: fatma.id,
          type: "earning",
          amount: 22000,
          balance: 28000,
          description: "Toyota Camry featured listing earnings",
          createdAt: daysAgo(10),
        },
        {
          userId: fatma.id,
          type: "purchase",
          amount: 500,
          balance: 30000,
          description: "Featured listing fee - Toyota Camry",
          createdAt: daysAgo(25),
        },
      ],
    });

    console.log("  ✅ Created 8 wallet transactions");

    // =====================================================================
    // 11. NOTIFICATIONS
    // =====================================================================
    console.log("📦 Creating notifications...");

    await db.notification.createMany({
      data: [
        {
          userId: omar.id,
          type: "booking",
          title: "Rental Confirmed",
          message:
            "Your rental booking for Toyota Camry 2024 has been confirmed by Fatma Ibrahim.",
          isRead: true,
          readAt: daysFromNow(3),
          createdAt: daysFromNow(3),
        },
        {
          userId: omar.id,
          type: "message",
          title: "New Message from Sara",
          message:
            "Sara sent you a message about the Audi A4 45 TFSI Quattro 2022.",
          isRead: false,
          createdAt: daysAgo(1),
        },
        {
          userId: fatma.id,
          type: "booking",
          title: "New Rental Request",
          message:
            "Omar Ali has requested to rent your Toyota Camry 2024 for 7 days starting next week.",
          isRead: true,
          readAt: daysFromNow(4),
          createdAt: daysFromNow(4),
        },
        {
          userId: fatma.id,
          type: "review",
          title: "New Review",
          message:
            "Ahmed Hassan left a 5-star review on your Toyota Camry 2024 listing.",
          isRead: true,
          readAt: daysAgo(5),
          createdAt: daysAgo(5),
        },
        {
          userId: sara.id,
          type: "message",
          title: "New Message from Omar",
          message:
            "Omar Ali sent you a message about the Audi A4 45 TFSI Quattro 2022.",
          isRead: false,
          createdAt: daysAgo(1),
        },
        {
          userId: ahmed.id,
          type: "payment",
          title: "Payment Received",
          message:
            "E£12,600 has been credited to your wallet for the BMW 320i rental (Booking completed).",
          isRead: true,
          readAt: daysAgo(8),
          createdAt: daysAgo(8),
        },
        {
          userId: ahmed.id,
          type: "booking",
          title: "Rental Completed",
          message:
            "Omar Ali's rental of BMW 320i 2023 has been completed. Earnings credited to your wallet.",
          isRead: true,
          readAt: daysAgo(8),
          createdAt: daysAgo(8),
        },
      ],
    });

    console.log("  ✅ Created 7 notifications");

    // =====================================================================
    // SUMMARY
    // =====================================================================
    console.log("\n🎉 Seed completed successfully!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  👤 Users:              ${users.length}`);
    console.log(`  🚗 Cars:               ${cars.length}`);
    console.log(`  📸 Car Images:         ${cars.reduce((sum, c) => sum + 4, 0)} (avg)`);
    console.log(`  ⭐ Reviews:            ${reviews.length}`);
    console.log(`  🏠 Homepage Sections:  ${homepageSections.length}`);
    console.log(`  ⚙️  Site Settings:      ${settings.length}`);
    console.log(`  🖼️  Banners:            ${banners.length}`);
    console.log(`  🧭 Navigation Items:   ${navItems.length}`);
    console.log(`  📅 Rental Bookings:    3`);
    console.log(`  💬 Chat Rooms:         3`);
    console.log(`  💰 Wallet Transactions: 8`);
    console.log(`  🔔 Notifications:      7`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
  } catch (error) {
    console.error("❌ Seed failed with error:");
    console.error(error);
    process.exit(1);
  }
}

export default seed;

// Run if executed directly
seed();
