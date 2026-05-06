'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ahmed Hassan',
    role: 'Car Buyer',
    avatar: null,
    initials: 'AH',
    rating: 5,
    text: 'Found my dream BMW 3 Series in perfect condition. The platform made it incredibly easy to compare prices and connect with the seller. Highly recommend!',
  },
  {
    id: 2,
    name: 'Sarah Mohamed',
    role: 'Car Seller',
    avatar: null,
    initials: 'SM',
    rating: 5,
    text: 'Sold my Hyundai within a week! The listing process was smooth and the exposure was amazing. Best car marketplace in Egypt by far.',
  },
  {
    id: 3,
    name: 'Omar Abdel-Rahim',
    role: 'Verified Dealer',
    avatar: null,
    initials: 'OA',
    rating: 4,
    text: 'As a dealer, CIAR Cars has been a game-changer for our business. The platform brings quality leads and the support team is always responsive.',
  },
  {
    id: 4,
    name: 'Nour El-Din',
    role: 'Rental Customer',
    avatar: null,
    initials: 'NE',
    rating: 5,
    text: 'Rented a Tesla Model 3 for a weekend trip. The rental process was seamless, car was in excellent condition, and the pricing was very competitive.',
  },
  {
    id: 5,
    name: 'Yasmine Khaled',
    role: 'Car Buyer',
    avatar: null,
    initials: 'YK',
    rating: 5,
    text: 'The car inspection feature gave me peace of mind. Bought a used Mercedes and it was exactly as described. The whole experience was premium.',
  },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 ${
            i < rating
              ? 'text-amber-400 fill-amber-400'
              : 'text-zinc-200 dark:text-zinc-700'
          }`}
        />
      ))}
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl font-bold tracking-tight mb-3"
          >
            What Our Customers Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg max-w-xl mx-auto"
          >
            Real reviews from real people who love CIAR Cars
          </motion.p>
        </div>

        {/* Testimonials Carousel */}
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-hide">
          <div className="flex gap-6" style={{ minWidth: 'max-content' }}>
            {TESTIMONIALS.map((testimonial, i) => (
              <motion.div
                key={testimonial.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="w-[320px] sm:w-[380px] shrink-0"
              >
                <Card className="h-full border shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6 flex flex-col h-full">
                    {/* Quote icon */}
                    <Quote className="h-8 w-8 text-emerald-200 dark:text-emerald-900 mb-4" />

                    {/* Review text */}
                    <p className="text-sm text-foreground/90 leading-relaxed flex-1 mb-4">
                      &ldquo;{testimonial.text}&rdquo;
                    </p>

                    {/* Rating */}
                    <StarRating rating={testimonial.rating} />

                    {/* Author */}
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {testimonial.initials}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{testimonial.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
