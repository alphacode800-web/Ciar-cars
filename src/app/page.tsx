'use client';

import React, { useEffect } from 'react';
import { useAppStore } from '@/store/app-store';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { NewsTicker } from '@/components/layout/NewsTicker';
import { AiChatbotWidget } from '@/components/ai/AiChatbotWidget';
import { WhatsAppFloatButton } from '@/components/layout/WhatsAppFloatButton';

import { DynamicHomePage } from '@/components/home/DynamicHomePage';

import CarListingView from '@/views/CarListingView';
import CarDetailView from '@/views/CarDetailView';
import SearchView from '@/views/SearchView';
import AuthView from '@/views/AuthView';
import AdminAuthView from '@/views/AdminAuthView';
import AdminDashboardView from '@/views/AdminDashboardView';
import UserDashboardView from '@/views/UserDashboardView';
import ChatView from '@/views/ChatView';
import RentalBookingView from '@/views/RentalBookingView';
import SellCarView from '@/views/SellCarView';
import ContactView from '@/views/ContactView';
import LegalPageView from '@/views/LegalPageView';
import AdvertisementsView from '@/views/AdvertisementsView';
import AdvertisementDetailView from '@/views/AdvertisementDetailView';
import CreateAdvertisementView from '@/views/CreateAdvertisementView';

import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/use-translation';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

function HomePage() {
  return <DynamicHomePage />;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -8 },
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut',
  duration: 0.2,
};

function PlaceholderView({ titleKey, textKey }: { titleKey: string; textKey: string }) {
  const { t } = useTranslation();
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <h2 className="text-2xl font-bold">{t(titleKey)}</h2>
        <p className="text-muted-foreground">{t(textKey)}</p>
        <p className="text-sm text-muted-foreground">{t('pages.comingSoon')}</p>
      </div>
    </div>
  );
}

function ViewRouter() {
  const { currentView, viewParams } = useAppStore();

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomePage />;
      case 'listing':
        return <CarListingView />;
      case 'detail':
        return <CarDetailView />;
      case 'search':
        return <SearchView />;
      case 'auth':
        return <AuthView />;
      case 'admin-auth':
        return <AdminAuthView />;
      case 'admin':
        return <AdminDashboardView />;
      case 'dashboard':
        return <UserDashboardView />;
      case 'chat':
        return <ChatView />;
      case 'rental':
        return <RentalBookingView />;
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
        return <UserDashboardView />;
      case 'about':
        return <AboutView />;
      case 'contact':
        return <ContactView />;
      case 'privacy':
        return <LegalPageView slug="privacy" />;
      case 'terms':
        return <LegalPageView slug="terms" />;
      case 'cookies':
        return <LegalPageView slug="cookies" />;
      case 'advertisements':
        return <AdvertisementsView />;
      case 'advertisement-detail':
        return <AdvertisementDetailView />;
      case 'create-advertisement':
        return <CreateAdvertisementView />;
      case 'comparison':
        return <PlaceholderView titleKey="pages.comparison" textKey="pages.comparisonText" />;
      case 'checkout':
        return <PlaceholderView titleKey="pages.checkout" textKey="pages.checkoutText" />;
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

function ScrollToTop() {
  const { currentView } = useAppStore();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView]);

  return null;
}

function ViewFromQuerySync() {
  const { setView } = useAppStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const view = params.get('view');
    if (view === 'admin') {
      setView('admin');
      const section = params.get('section');
      const next = new URLSearchParams();
      next.set('view', 'admin');
      if (section) next.set('section', section);
      window.history.replaceState({}, '', `/?${next.toString()}`);
    }
  }, [setView]);

  return null;
}

export default function App() {
  const { currentView } = useAppStore();
  const hideSiteChrome =
    currentView === 'admin' ||
    currentView === 'admin-auth' ||
    currentView === 'auth';

  return (
    <>
      <ScrollToTop />
      <ViewFromQuerySync />
      {!hideSiteChrome && <Navbar />}
      {!hideSiteChrome && <NewsTicker />}
      <main
        className={
          !hideSiteChrome
            ? 'pt-[calc(4rem+2px+var(--news-ticker-h,0px))] pb-[calc(4.25rem+env(safe-area-inset-bottom))] md:pb-0'
            : ''
        }
      >
        <React.Suspense fallback={<ViewLoader />}>
          <ViewRouter />
        </React.Suspense>
      </main>
      {!hideSiteChrome && <Footer />}
      {!hideSiteChrome && <WhatsAppFloatButton />}
      {!hideSiteChrome && <AiChatbotWidget />}
    </>
  );
}
