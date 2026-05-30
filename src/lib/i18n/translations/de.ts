import type { TranslationDictionary } from '../types';

const de: TranslationDictionary = {
  // ---------------------------------------------------------------------------
  // Common
  // ---------------------------------------------------------------------------
  common: {
    appName: "CIAR Cars",
    appNameShort: "CIAR",
    tagline: "Die weltweit führende Auto-Plattform",
    description: "Kaufen, verkaufen und mieten Sie Autos mit Vertrauen auf der weltweit vertrauenswürdigsten Automobil-Plattform.",
    loading: "Laden...",
    error: "Etwas ist schiefgelaufen",
    retry: "Erneut versuchen",
    save: "Speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    viewAll: "Alle anzeigen",
    showMore: "Mehr anzeigen",
    showLess: "Weniger anzeigen",
    search: "Suchen",
    filter: "Filtern",
    sort: "Sortieren",
    noResults: "Keine Ergebnisse gefunden",
    seeDetails: "Details ansehen",
    contactUs: "Kontaktieren Sie uns",
    learnMore: "Mehr erfahren",
    getStarted: "Loslegen",
    back: "Zurück",
    next: "Weiter",
    previous: "Zurück",
    submit: "Absenden",
    confirm: "Bestätigen",
    close: "Schließen",
    yes: "Ja",
    no: "Nein",
    currency: "USD",
    and: "und",
    or: "oder",
  },

  // ---------------------------------------------------------------------------
  // Navigation
  // ---------------------------------------------------------------------------
  nav: {
    home: "Startseite",
    listing: "Autos",
    rental: "Mieten",
    sell: "Auto verkaufen",
    about: "Über uns",
    contact: "Kontakt",
    dashboard: "Dashboard",
    favorites: "Favoriten",
    messages: "Nachrichten",
    wallet: "Geldbörse",
    settings: "Einstellungen",
    login: "Anmelden",
    register: "Registrieren",
    logout: "Abmelden",
    profile: "Profil",
    language: "Sprache",
    darkMode: "Dunkelmodus",
    admin: "Admin-Bereich",
  },

  adminAuth: {
    title: "CIAR Cars Admin",
    subtitle: "Authorized personnel only",
    signIn: "Admin Sign In",
    signInDescription: "Sign in with your administrator credentials",
    email: "Email",
    password: "Password",
    signInButton: "Sign In to Admin Panel",
    backToSite: "Back to main site",
    userLoginHint: "Not an administrator?",
    welcome: "Welcome to the admin panel",
    fillAllFields: "Please fill in all fields",
    loginFailed: "Admin login failed. Please try again.",
    invalidSession: "Admin session could not be established",
  },

  // ---------------------------------------------------------------------------
  // Hero Section
  // ---------------------------------------------------------------------------
  hero: {
    title: "Finden Sie Ihr Traumauto",
    subtitle: "Entdecken Sie die weltweit größte Auswahl an neuen und gebrauchten Fahrzeugen",
    searchPlaceholder: "Nach Marke, Modell oder Schlagwort suchen...",
    searchButton: "Autos suchen",
    popularSearches: "Beliebte Suchen",
    stats: "100.000+ gelistete Autos | 50.000+ zufriedene Kunden | 5.000+ geprüfte Händler | 80+ Länder",
    browseCategories: "Kategorien durchsuchen",
  },

  // ---------------------------------------------------------------------------
  // Categories
  // ---------------------------------------------------------------------------
  categories: {
    title: "Nach Kategorie durchsuchen",
    subtitle: "Finden Sie das perfekte Fahrzeug für Ihre Bedürfnisse",
    sedan: "Limousine",
    suv: "SUV",
    coupe: "Coupé",
    truck: "Pickup",
    van: "Kombi / Minivan",
    convertible: "Cabriolet",
    hatchback: "Fließheck",
    wagon: "Kombilimousine",
    electric: "Elektro",
    hybrid: "Hybrid",
  },

  // ---------------------------------------------------------------------------
  // Featured Cars
  // ---------------------------------------------------------------------------
  featured: {
    title: "Empfohlene Autos",
    subtitle: "Handverlesene Premiumfahrzeuge für Sie",
    viewAll: "Alle Empfehlungen anzeigen",
  },

  // ---------------------------------------------------------------------------
  // Stats / Trust Bar
  // ---------------------------------------------------------------------------
  stats: {
    title: "Weltweit vertraut",
    subtitle: "Zahlen, die über Grenzen hinweg sprechen",
    carsListed: "Gelistete Autos",
    happyCustomers: "Zufriedene Kunden",
    verifiedDealers: "Geprüfte Händler",
    citiesCovered: "Länder",
  },

  // ---------------------------------------------------------------------------
  // Call-to-Action
  // ---------------------------------------------------------------------------
  cta: {
    title: "Bereit, Ihr Auto zu verkaufen?",
    subtitle:
      "Schließen Sie sich Tausenden von Verkäufern auf dem weltweit größten Automarktplatz an. Listen Sie Ihr Auto in wenigen Minuten und erreichen Sie Millionen potenzieller Käufer.",
    buttonText: "Auto einstellen",
    browseButton: "Autos durchsuchen",
  },

  // ---------------------------------------------------------------------------
  // Luxury Gallery Strip
  // ---------------------------------------------------------------------------
  gallery: {
    badge: "Entdecken Sie das Beste",
    title: "Luxus-Kollektion",
    subtitle: "Scrollen Sie durch die weltweit prestigeträchtigsten Automobile — klicken Sie, um zu browsen.",
  },

  // ---------------------------------------------------------------------------
  // Banner Section
  // ---------------------------------------------------------------------------
  banner: {
    newArrivals: "Neu eingetroffen",
    newArrivalsText: "Entdecken Sie die neuesten Modelle 2024–2025 von Top-Marken mit exklusiven Finanzierungsangeboten.",
    newArrivalsCTA: "Jetzt entdecken",
    electricVehicles: "Elektrofahrzeuge",
    electricVehiclesText: "Entdecken Sie die Zukunft des Fahrens mit unserer kuratierten Kollektion Premium-EVs.",
    electricVehiclesCTA: "EVs ansehen",
    premiumRental: "Premium-Autos mieten",
    premiumRentalText: "Erleben Sie Luxus auf Rädern. Tagespreise ab 89€.",
    premiumRentalCTA: "Jetzt mieten",
    featured: "Empfohlen",
  },

  // ---------------------------------------------------------------------------
  // Car Card Labels
  // ---------------------------------------------------------------------------
  carCard: {
    featured: "Empfohlen",
    new: "Neu",
    forRent: "Zu vermieten",
    negotiable: "Verhandlungsbasis",
    viewDetails: "Details ansehen",
    perDay: "/Tag",
    petrol: "Benzin",
    diesel: "Diesel",
    electric: "Elektro",
    hybrid: "Hybrid",
    automatic: "Automatik",
    manual: "Schaltgetriebe",
    cvt: "CVT",
    used: "Gebraucht",
  },

  // ---------------------------------------------------------------------------
  // Testimonials
  // ---------------------------------------------------------------------------
  testimonials: {
    title: "Was unsere Kunden sagen",
    subtitle: "Echte Geschichten von echten Autokäufern und -verkäufern",
    name1: "James Mitchell",
    role1: "Autokäufer",
    text1: "Meinen Traum-BMW 3er in perfektem Zustand gefunden. Die Plattform hat den Preisvergleich und die Kontaktaufnahme mit dem Verkäufer unglaublich einfach gemacht. Sehr empfehlenswert!",
    name2: "Sophie Laurent",
    role2: "Autoverkäuferin",
    text2: "Mein Hyundai innerhalb einer Woche verkauft! Der Inseratsprozess war reibungslos und die Reichweite erstaunlich. Die beste Automarkt-Plattform, die ich je genutzt habe.",
    name3: "Marcus Weber",
    role3: "Geprüfter Händler",
    text3: "Als Händler war CIAR Cars ein Wendepunkt für unser Geschäft. Die Plattform bringt qualitativ hochwertige Leads und der Support ist immer responsiv.",
    name4: "Carlos Rivera",
    role4: "Mietkunde",
    text4: "Ein Tesla Model 3 für ein Wochenendtrip gemietet. Der Mietprozess war nahtlos, das Auto in ausgezeichnetem Zustand und die Preise sehr wettbewerbsfähig.",
    name5: "Yuki Tanaka",
    role5: "Autokäuferin",
    text5: "Die Inspektionsfunktion gab mir Sicherheit. Einen gebrauchten Mercedes gekauft, der genau wie beschrieben war. Das gesamte Erlebnis war erstklassig.",
  },

  // ---------------------------------------------------------------------------
  // Page Views
  // ---------------------------------------------------------------------------
  pages: {
    comparison: "Auto-Vergleich",
    comparisonText: "Wählen Sie Autos aus, um Eigenschaften nebeneinander zu vergleichen.",
    comingSoon: "Demnächst!",
    checkout: "Kasse",
    checkoutText: "Schließen Sie Ihre Zahlung ab.",
  },

  // ---------------------------------------------------------------------------
  // Footer
  // ---------------------------------------------------------------------------
  footer: {
    description:
      "Die weltweit vertrauenswürdigste Automobil-Plattform.",
    quickLinks: "Schnelllinks",
    company: "Unternehmen",
    support: "Support",
    legal: "Rechtliches",
    aboutUs: "Über uns",
    careers: "Karriere",
    blog: "Blog",
    press: "Presse",
    helpCenter: "Hilfecenter",
    safetyTips: "Sicherheitstipps",
    termsOfService: "Nutzungsbedingungen",
    privacyPolicy: "Datenschutzrichtlinie",
    cookiePolicy: "Cookie-Richtlinie",
    followUs: "Folgen Sie uns",
    newsletter: "Newsletter",
    newsletterText: "Erhalten Sie die neuesten Autoangebote und Updates",
    subscribe: "Abonnieren",
    emailPlaceholder: "E-Mail-Adresse eingeben",
    rights: "Alle Rechte vorbehalten.",
  },

  // ---------------------------------------------------------------------------
  // Authentication
  // ---------------------------------------------------------------------------
  auth: {
    loginTitle: "Willkommen zurück",
    loginSubtitle: "Melden Sie sich in Ihrem Konto an",
    registerTitle: "Konto erstellen",
    registerSubtitle: "Treten Sie noch heute CIAR Cars bei",
    email: "E-Mail-Adresse",
    password: "Passwort",
    confirmPassword: "Passwort bestätigen",
    fullName: "Vollständiger Name",
    phone: "Telefonnummer",
    city: "Stadt",
    forgotPassword: "Passwort vergessen?",
    rememberMe: "Angemeldet bleiben",
    noAccount: "Noch kein Konto?",
    hasAccount: "Bereits ein Konto?",
    signUp: "Registrieren",
    signIn: "Anmelden",
    orContinueWith: "Oder weitermachen mit",
    google: "Google",
    facebook: "Facebook",
    termsAgreement: "Mit der Registrierung stimmen Sie unseren",
    andText: "und",
    resetPassword: "Passwort zurücksetzen",
    resetPasswordText:
      "Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Reset-Link",
  },

  // ---------------------------------------------------------------------------
  // Car Detail Page
  // ---------------------------------------------------------------------------
  carDetail: {
    seller: "Verkäufer",
    contactSeller: "Verkäufer kontaktieren",
    startChat: "Chat starten",
    viewPhone: "Telefonnummer anzeigen",
    specifications: "Technische Daten",
    description: "Beschreibung",
    reviews: "Bewertungen",
    similarCars: "Ähnliche Autos",
    condition: "Zustand",
    mileage: "Kilometerstand",
    fuelType: "Kraftstoffart",
    transmission: "Getriebe",
    engine: "Motor",
    horsepower: "Leistung (PS)",
    drivetrain: "Antriebsart",
    bodyType: "Karosserieform",
    exteriorColor: "Außenfarbe",
    interiorColor: "Innenfarbe",
    doors: "Türen",
    seats: "Sitze",
    year: "Jahr",
    price: "Preis",
    negotiable: "Verhandlungsbasis",
    location: "Standort",
    views: "Aufrufe",
    createdAt: "Gelistet am",
    rentThisCar: "Dieses Auto mieten",
    daily: "/Tag",
    weekly: "/Woche",
    monthly: "/Monat",
    writeReview: "Bewertung schreiben",
    noReviews: "Noch keine Bewertungen",
  },

  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------
  filters: {
    title: "Filter",
    clearAll: "Alle löschen",
    brand: "Marke",
    model: "Modell",
    year: "Jahr",
    condition: "Zustand",
    new: "Neu",
    used: "Gebraucht",
    priceRange: "Preisbereich",
    fuelType: "Kraftstoffart",
    transmission: "Getriebe",
    bodyType: "Karosserieform",
    city: "Stadt",
    mileage: "Kilometerstand",
    min: "Min.",
    max: "Max.",
    to: "bis",
    allBrands: "Alle Marken",
    allCities: "Alle Städte",
    allFuelTypes: "Alle Kraftstoffarten",
    allTransmissions: "Alle Getriebearten",
    results: "Ergebnisse",
    sortBy: "Sortieren nach",
    newest: "Neueste zuerst",
    oldest: "Älteste zuerst",
    priceLow: "Preis: Niedrig bis hoch",
    priceHigh: "Preis: Hoch bis niedrig",
    mostViewed: "Meistgesehen",
  },

  // ---------------------------------------------------------------------------
  // Rental
  // ---------------------------------------------------------------------------
  rental: {
    title: "Dieses Auto buchen",
    selectDates: "Mietdatum auswählen",
    checkIn: "Abholung",
    checkOut: "Rückgabe",
    days: "Tage",
    total: "Gesamt",
    dailyRate: "Tagespreis",
    platformFee: "Plattformgebühr",
    ownerEarnings: "Einnahmen des Eigentümers",
    deliveryAddress: "Lieferadresse",
    deliveryFee: "Liefergebühr",
    notes: "Anmerkungen",
    notesPlaceholder: "Besondere Wünsche hinzufügen...",
    bookNow: "Jetzt buchen",
    bookingConfirmed: "Buchung bestätigt!",
    bookingPending: "Buchung ausstehend",
    unavailable: "Nicht verfügbar",
  },

  // ---------------------------------------------------------------------------
  // Chat / Messages
  // ---------------------------------------------------------------------------
  chat: {
    title: "Nachrichten",
    noChats: "Noch keine Konversationen",
    noChatsText: "Beginnen Sie einen Chat mit Autoverkäufern",
    typeMessage: "Nachricht eingeben...",
    send: "Senden",
    online: "Online",
    offline: "Offline",
    lastSeen: "Zuletzt gesehen",
    justNow: "Gerade eben",
    minutesAgo: "Minuten her",
    hoursAgo: "Stunden her",
    yesterday: "Gestern",
  },

  // ---------------------------------------------------------------------------
  // Wallet
  // ---------------------------------------------------------------------------
  wallet: {
    title: "Geldbörse",
    balance: "Aktueller Kontostand",
    topUp: "Aufladen",
    withdraw: "Auszahlen",
    transactions: "Transaktionen",
    topUpTitle: "Geldbörse aufladen",
    amount: "Betrag",
    paymentMethod: "Zahlungsmethode",
    recentActivity: "Letzte Aktivitäten",
  },

  // ---------------------------------------------------------------------------
  // Dashboard
  // ---------------------------------------------------------------------------
  dashboard: {
    welcome: "Willkommen zurück",
    myListings: "Meine Inserate",
    myBookings: "Meine Buchungen",
    myFavorites: "Meine Favoriten",
    myReviews: "Meine Bewertungen",
    totalViews: "Gesamtzugriffe",
    totalInquiries: "Gesamtanfragen",
    activeListings: "Aktive Inserate",
    pendingBookings: "Ausstehende Buchungen",
    editProfile: "Profil bearbeiten",
    personalInfo: "Persönliche Informationen",
    accountSettings: "Kontoeinstellungen",
    notifications: "Benachrichtigungen",
    markAllRead: "Alle als gelesen markieren",
    noNotifications: "Keine Benachrichtigungen",
  },

  // ---------------------------------------------------------------------------
  // Sell / List a Car
  // ---------------------------------------------------------------------------
  sell: {
    title: "Verkaufen Sie Ihr Auto",
    subtitle: "Listen Sie Ihr Auto in 3 einfachen Schritten",
    step1: "Autodetails",
    step2: "Fotos",
    step3: "Preisgestaltung",
    step1Desc: "Geben Sie die Grundinformationen Ihres Autos ein",
    step2Desc: "Laden Sie hochwertige Fotos hoch",
    step3Desc: "Setzen Sie einen wettbewerbsfähigen Preis",
    listingTitle: "Inseratstitel",
    listingTitlePlaceholder: "z. B. 2024 BMW M4 Competition",
    descriptionPlaceholder:
      "Beschreiben Sie den Zustand, die Ausstattung und die Historie Ihres Autos...",
    uploadPhotos: "Fotos hochladen",
    dragDrop: "Bilder hierher ziehen und ablegen",
    orClick: "oder klicken Sie zum Durchsuchen",
    maxPhotos: "Bis zu 20 Fotos",
    primaryPhoto: "Hauptfoto",
    setPrice: "Preis festlegen",
    suggestedPrice: "Vorgeschlagener Marktpreis",
    publishListing: "Inserat veröffentlichen",
    previewListing: "Inseratvorschau",
  },

  // ---------------------------------------------------------------------------
  // About Page
  // ---------------------------------------------------------------------------
  about: {
    title: "Über CIAR Cars",
    mission: "Unsere Mission",
    missionText:
      "Den weltweiten Automarktplatz revolutionieren, indem wir eine transparente, vertrauenswürdige und effiziente Plattform zum Kaufen, Verkaufen und Mieten von Fahrzeugen bieten.",
    vision: "Unsere Vision",
    visionText:
      "Die weltweit führende Automotive-Plattform werden und Millionen von Autoenthusiasten mit ihren Traumfahrzeugen verbinden.",
    values: "Unsere Werte",
    transparency: "Transparenz",
    transparencyText: "Vollständige Fahrzeughistorie und ehrliche Inserate",
    trust: "Vertrauen",
    trustText: "Geprüfte Verkäufer und sichere Transaktionen",
    innovation: "Innovation",
    innovationText: "KI-gestützte Suche und intelligente Empfehlungen",
    community: "Gemeinschaft",
    communityText: "Aufbau einer Gemeinschaft von Autoenthusiasten",
  },

  // ---------------------------------------------------------------------------
  // Contact Page
  // ---------------------------------------------------------------------------
  contact: {
    title: "Kontakt",
    subtitle: "Wir freuen uns, von Ihnen zu hören",
    name: "Ihr Name",
    email: "Ihre E-Mail",
    subject: "Betreff",
    message: "Nachricht",
    sendMessage: "Nachricht senden",
    officeAddress: "Globaler Hauptsitz: Dubai, VAE",
    phoneNumber: "Telefonnummer",
    emailAddress: "E-Mail-Adresse",
    workingHours: "Mon-Fri: 9AM-6PM (GMT+4)",
    faqTitle: "Häufig gestellte Fragen",
    address: "Business Bay, Dubai, VAE",
    phone: "+971 4 123 4567",
    email: "hello@ciarcars.com",
  },
};

export { de };
