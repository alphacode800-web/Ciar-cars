import type { Metadata } from "next";
import { Inter, Outfit, Cairo } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";

const jakarta = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

const cairo = Cairo({
  variable: "--font-arabic",
  subsets: ["arabic", "latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "CIAR Cars — The World's Premier Car Marketplace",
  description:
    "Buy, sell, and rent cars with confidence on CIAR Cars — the world's most trusted automotive platform. 100,000+ vehicles across 80+ countries.",
  keywords: [
    "CIAR Cars",
    "car marketplace",
    "buy cars online",
    "sell cars",
    "rent cars",
    "used cars",
    "new cars",
    "electric vehicles",
    "luxury cars",
    "automotive",
    "car dealer",
  ],
  icons: {
    icon: [{ url: '/brand/rciar-logo.png', type: 'image/png' }],
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "RCiAR Cars",
    description: "The World's Premier Car Marketplace",
    siteName: "RCiAR Cars",
    type: "website",
    images: [{ url: '/brand/rciar-logo.png', width: 512, height: 512, alt: 'RCiAR' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning>
      <body
        className={`${jakarta.variable} ${outfit.variable} ${cairo.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
