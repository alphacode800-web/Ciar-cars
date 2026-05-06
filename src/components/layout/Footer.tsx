'use client';

import React from 'react';
import { Car, Mail, Phone, MapPin, Facebook, Twitter, Instagram, Youtube } from 'lucide-react';
import { useAppStore } from '@/store/app-store';
import type { AppView } from '@/types';

const QUICK_LINKS = [
  { label: 'Buy Cars', view: 'listing' as AppView },
  { label: 'Rent Cars', view: 'rental' as AppView },
  { label: 'Sell Your Car', view: 'sell-car' as AppView },
  { label: 'Compare Cars', view: 'comparison' as AppView },
  { label: 'Car Reviews', view: 'home' as AppView },
  { label: 'Dealer Directory', view: 'listing' as AppView },
];

const SERVICES = [
  'Car Inspection',
  'Insurance Partners',
  'Car Financing',
  'Delivery Service',
  'Roadside Assistance',
  'Vehicle History Report',
];

const SOCIAL_LINKS = [
  { icon: Facebook, href: '#', label: 'Facebook' },
  { icon: Twitter, href: '#', label: 'Twitter' },
  { icon: Instagram, href: '#', label: 'Instagram' },
  { icon: Youtube, href: '#', label: 'Youtube' },
];

export function Footer() {
  const { setView } = useAppStore();

  const handleNav = (view: AppView) => {
    setView(view);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-zinc-900 text-zinc-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Company Info */}
          <div className="sm:col-span-2 lg:col-span-1">
            <button
              onClick={() => handleNav('home')}
              className="flex items-center gap-2 mb-4 group"
            >
              <div className="bg-emerald-600 rounded-lg p-1.5 group-hover:bg-emerald-500 transition-colors">
                <Car className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl text-white">
                <span className="font-bold tracking-tight">CIAR</span>
                <span className="font-extralight text-zinc-400 ml-0.5">Cars</span>
              </span>
            </button>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6">
              Egypt&apos;s premier car marketplace. Buy, sell, and rent vehicles with
              confidence. Trusted by thousands of buyers and sellers across the country.
            </p>
            <div className="flex items-center gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="h-9 w-9 rounded-lg bg-zinc-800 hover:bg-emerald-600 flex items-center justify-center transition-colors"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => handleNav(link.view)}
                    className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Services
            </h3>
            <ul className="space-y-2.5">
              {SERVICES.map((service) => (
                <li key={service}>
                  <span className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer">
                    {service}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Contact Us
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">
                  123 Auto Mall, New Cairo, Cairo, Egypt
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">+20 100 123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-zinc-400">hello@ciarcars.com</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-zinc-800">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-zinc-500">
              &copy; {new Date().getFullYear()} CIAR Cars. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Privacy Policy
              </button>
              <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Terms of Service
              </button>
              <button className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors">
                Cookie Policy
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
