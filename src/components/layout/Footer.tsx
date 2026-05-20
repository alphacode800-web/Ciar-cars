'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube, Send, ArrowUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAppStore } from '@/store/app-store';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { AppView } from '@/types';

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function Footer() {
  const { setView } = useAppStore();
  const { t, isRTL, locale } = useTranslation();

  const handleNav = (view: AppView) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const quickLinks = [
    { label: t('nav.listing'), view: 'listing' as AppView },
    { label: t('nav.rental'), view: 'rental' as AppView },
    { label: t('nav.sell'), view: 'sell-car' as AppView },
    { label: t('nav.about'), view: 'about' as AppView },
    { label: t('nav.contact'), view: 'contact' as AppView },
  ];

  return (
    <footer className="relative bg-zinc-950 text-zinc-300 mt-auto overflow-hidden">
      {/* Animated background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-teal-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/3 rounded-full blur-[100px]" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12"
        >
          {/* Company Info */}
          <motion.div variants={item} className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2.5 mb-5 group"
            >
              <motion.div
                whileHover={{ rotate: [0, -5, 5, 0] }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Car className="h-5 w-5 text-white" />
              </motion.div>
              <span className="text-xl text-white">
                <span className="font-bold tracking-tight">CIAR</span>
                <span className="font-extralight text-zinc-400"> Cars</span>
              </span>
            </button>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              {t('footer.description')}
            </p>

            {/* Newsletter */}
            <div className="mb-6">
              <p className="text-sm font-medium text-white mb-2">{t('footer.newsletter')}</p>
              <p className="text-xs text-zinc-500 mb-3">{t('footer.newsletterText')}</p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className={cn("flex gap-2", isRTL && "flex-row-reverse")}
              >
                <Input
                  placeholder={t('footer.emailPlaceholder')}
                  className="h-9 bg-zinc-900 border-zinc-800 text-sm"
                />
                <Button
                  size="sm"
                  className="h-9 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-3 shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </form>
            </div>

            {/* Social Links */}
            <div className="flex items-center gap-2">
              {SOCIAL_LINKS.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    whileHover={{ y: -3, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="h-9 w-9 rounded-lg bg-zinc-900 hover:bg-gradient-to-br hover:from-emerald-500 hover:to-teal-600 flex items-center justify-center transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/20"
                  >
                    <Icon className="h-4 w-4" />
                  </motion.a>
                );
              })}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={item}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="h-1 w-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              {t('footer.quickLinks')}
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.view)}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company */}
          <motion.div variants={item}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="h-1 w-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              {t('footer.company')}
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: t('footer.aboutUs'), view: 'about' as AppView },
                { label: t('footer.careers'), view: 'home' as AppView },
                { label: t('footer.blog'), view: 'home' as AppView },
                { label: t('footer.press'), view: 'home' as AppView },
                { label: t('footer.helpCenter'), view: 'contact' as AppView },
                { label: t('footer.safetyTips'), view: 'home' as AppView },
              ].map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.view)}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors hover:translate-x-1 inline-block"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact */}
          <motion.div variants={item}>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
              <div className="h-1 w-5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
              {t('footer.support')}
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">
                  {t('contact.address')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">{t('contact.phone')}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">{t('contact.email')}</span>
              </li>
            </ul>

            {/* Trust badges */}
            <div className="mt-6 flex items-center gap-2">
              <div className="px-3 py-1.5 bg-zinc-900 rounded-lg text-[10px] text-zinc-400 font-medium">
                🔒 SSL Secured
              </div>
              <div className="px-3 py-1.5 bg-zinc-900 rounded-lg text-[10px] text-zinc-400 font-medium">
                ✅ Verified
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              © {new Date().getFullYear()} {t('common.appName')}. {t('footer.rights')}
            </p>
            <div className="flex items-center gap-4">
              {[
                t('footer.privacyPolicy'),
                t('footer.termsOfService'),
                t('footer.cookiePolicy'),
              ].map((label) => (
                <button
                  key={label}
                  className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Scroll to top button */}
      <motion.button
        onClick={scrollToTop}
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-6 right-6 z-40 h-10 w-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-500/20 flex items-center justify-center text-white hover:shadow-emerald-500/40 transition-shadow"
      >
        <ArrowUp className="h-4 w-4" />
      </motion.button>
    </footer>
  );
}
