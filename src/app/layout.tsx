import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/providers/theme-provider";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
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
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
  openGraph: {
    title: "CIAR Cars",
    description: "The World's Premier Car Marketplace",
    siteName: "CIAR Cars",
    type: "website",
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
        className={`${jakarta.variable} ${outfit.variable} font-sans antialiased bg-background text-foreground`}
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
