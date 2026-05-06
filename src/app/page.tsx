'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

// Views
import { HeroSection } from '@/components/home/HeroSection';
import { CategoriesSection } from '@/components/home/CategoriesSection';
import { BannerSection } from '@/components/home/BannerSection';
import { FeaturedCarsSection } from '@/components/home/FeaturedCarsSection';
import { StatsSection } from '@/components/home/StatsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';

// Lazy-loaded views for performance
import CarListingView from '@/views/CarListingView';
import CarDetailView from '@/views/CarDetailView';
import SearchView from '@/views/SearchView';
import AuthView from '@/views/AuthView';
import AdminDashboardView from '@/views/AdminDashboardView';
import UserDashboardView from '@/views/UserDashboardView';
import ChatView from '@/views/ChatView';
import RentalBookingView from '@/views/RentalBookingView';
import SellCarView from '@/views/SellCarView';
import WalletView from '@/views/WalletView';
import AboutView from '@/views/AboutView';
import ContactView from '@/views/ContactView';

// Loading component
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

function ViewLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="space-y-4 w-full max-w-2xl">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-48 w-full" />
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    </div>
  );
}

// Homepage view
function HomePage() {
  return (
    <>
      <HeroSection />
      <CategoriesSection />
      <BannerSection />
      <FeaturedCarsSection />
      <StatsSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

// Page transition variants
const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween',
  ease: 'easeInOut',
  duration: 0.2,
};

// Main view router
function ViewRouter() {
  const { currentView, viewParams } = useAppStore();
  
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      
      case 'listing':
        return <CarListingView />;
      
      case 'detail':
        return <CarDetailView carId={viewParams.carId as string} />;
      
      case 'search':
        return <SearchView initialQuery={viewParams.query as string} />;
      
      case 'auth':
        return <AuthView initialMode={viewParams.mode as 'login' | 'register'} />;
      
      case 'admin':
        return <AdminDashboardView />;
      
      case 'dashboard':
        return <UserDashboardView />;
      
      case 'chat':
        return <ChatView roomId={viewParams.roomId as string} />;
      
      case 'rental':
        return <RentalBookingView carId={viewParams.carId as string} />;
      
      case 'sell-car':
        return <SellCarView />;
      
      case 'wallet':
        return <WalletView />;
      
      case 'profile':
      case 'favorites':
      case 'my-listings':
      case 'my-bookings':
      case 'notifications':
      case 'settings':
        return <UserDashboardView activeTab={currentView} />;
      
      case 'about':
        return <AboutView />;
      
      case 'contact':
        return <ContactView />;
      
      case 'comparison':
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Car Comparison</h2>
              <p className="text-muted-foreground">Select cars to compare features side by side.</p>
              <p className="text-sm text-muted-foreground">Coming soon!</p>
            </div>
          </div>
        );
      
      case 'checkout':
        return (
          <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Checkout</h2>
              <p className="text-muted-foreground">Complete your payment.</p>
            </div>
          </div>
        );
      
      default:
        return <HomePage />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentView}
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        {renderView()}
      </motion.div>
    </AnimatePresence>
  );
}

// Scroll to top on view change
function ScrollToTop() {
  const { currentView } = useAppStore();
  
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);
  
  return null;
}

export default function App() {
  const { currentView } = useAppStore();

  // Admin dashboard has its own layout (sidebar)
  const isAdminView = currentView === 'admin';

  return (
    <>
      <ScrollToTop />
      {!isAdminView && <Navbar />}
      <main className={!isAdminView ? 'pt-16' : ''}>
        <React.Suspense fallback={<ViewLoader />}>
          <ViewRouter />
        </React.Suspense>
      </main>
      {!isAdminView && <Footer />}
    </>
  );
}
