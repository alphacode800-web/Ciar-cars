'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle,
  Loader2,
  ChevronDown,
  HelpCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/store/app-store';
import { PageHero } from '@/components/ui/page-hero';
import { PAGE_HERO_IMAGES } from '@/lib/car-images';

// ============ Contact Info ============

const CONTACT_INFO = [
  {
    icon: Mail,
    title: 'Email Us',
    detail: 'support@ciarcars.com',
    subDetail: 'We reply within 24 hours',
    action: 'mailto:support@ciarcars.com',
    color: 'bg-primary/10 text-primary',
  },
  {
    icon: Phone,
    title: 'Call Us',
    detail: '+20 100 123 4567',
    subDetail: 'Sun-Thu, 9AM - 6PM',
    action: 'tel:+201001234567',
    color: 'bg-emerald-50 text-emerald-600',
  },
  {
    icon: MapPin,
    title: 'Visit Us',
    detail: 'Business Bay, Dubai',
    subDetail: 'Dubai, UAE',
    action: null,
    color: 'bg-orange-50 text-orange-600',
  },
];

// ============ FAQ Data ============

const FAQ_ITEMS = [
  {
    question: 'How do I list my car for sale?',
    answer:
      'To list your car, click "Sell Your Car" from the navigation menu. Fill in the details including photos, specifications, and price. Your listing will be reviewed by our team and typically goes live within 24 hours.',
  },
  {
    question: 'Is it free to list a car?',
    answer:
      'Basic listings are completely free! You can enhance your listing with featured placement or boost options for a small fee, which helps your car get more visibility.',
  },
  {
    question: 'How does car rental work?',
    answer:
      'Find a car marked "Available for Rent," select your dates, and submit a booking request. The owner will review and confirm your booking. Payment is processed securely through our platform.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept payments through the CIAR Wallet (recommended), credit/debit cards (Visa, Mastercard, Meza), and cash on delivery for rentals. All transactions are securely processed.',
  },
  {
    question: 'How are cars verified?',
    answer:
      'We encourage sellers to provide detailed photos and specifications. For premium listings, we offer optional vehicle inspection services that provide a comprehensive condition report for buyers.',
  },
  {
    question: 'What if I have a problem with a transaction?',
    answer:
      'Our support team is here to help! Contact us through the chat, email, or phone. We mediate disputes and ensure fair resolutions for both buyers and sellers.',
  },
  {
    question: 'Can I rent out my own car?',
    answer:
      'Yes! When listing your car, simply enable the "Available for Rent" option and set your daily, weekly, and monthly rates. You earn money while your car is not in use.',
  },
  {
    question: 'How does the CIAR Wallet work?',
    answer:
      'The CIAR Wallet is a digital wallet linked to your account. You can top up using a card or bank transfer, use it for purchases and rentals, and withdraw funds to your bank account.',
  },
];

// ============ Animation ============

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

// ============ Main Component ============

export default function ContactView() {
  const { setView } = useAppStore();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============ Validate ============

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    else if (formData.message.trim().length < 10) newErrors.message = 'Message must be at least 10 characters';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // ============ Submit ============

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);

      try {
        // Simulate form submission
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch {
        setErrors({ message: 'Failed to send message. Please try again.' });
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate]
  );

  const handleChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }
    },
    [errors]
  );

  // ============ Render ============

  return (
    <div className="min-h-screen">
      <PageHero
        badge="Contact Us"
        compact
        title={
          <>
            We&apos;d Love to{' '}
            <span className="text-emerald-600 dark:text-emerald-400">Hear From You</span>
          </>
        }
        subtitle="Have a question, suggestion, or need help? Our team is here to assist you every step of the way."
        image={PAGE_HERO_IMAGES.contact}
      />

      {/* ========== Contact Info Cards ========== */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <motion.div
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
            {...fadeInUp}
          >
            {CONTACT_INFO.map((info) => {
              const Icon = info.icon;
              const content = (
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-xl', info.color)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{info.title}</h3>
                      <p className="mt-1 text-sm font-medium text-foreground">{info.detail}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{info.subDetail}</p>
                    </div>
                  </CardContent>
                </Card>
              );

              if (info.action) {
                return (
                  <a key={info.title} href={info.action} className="block">
                    {content}
                  </a>
                );
              }
              return <div key={info.title}>{content}</div>;
            })}
          </motion.div>
        </div>
      </section>

      {/* ========== Contact Form + Info ========== */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
            {/* Contact Form */}
            <motion.div className="lg:col-span-3" {...fadeInUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {submitSuccess ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex flex-col items-center justify-center py-8 text-center"
                    >
                      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                        <CheckCircle className="h-7 w-7 text-emerald-600" />
                      </div>
                      <h3 className="text-lg font-semibold">Message Sent!</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSubmitSuccess(false)}
                      >
                        Send Another Message
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">Full Name *</Label>
                          <Input
                            id="contact-name"
                            placeholder="Your name"
                            value={formData.name}
                            onChange={(e) => handleChange('name', e.target.value)}
                            className={cn(errors.name && 'border-destructive')}
                          />
                          {errors.name && (
                            <p className="text-xs text-destructive">{errors.name}</p>
                          )}
                        </div>

                        {/* Email */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-email">Email *</Label>
                          <Input
                            id="contact-email"
                            type="email"
                            placeholder="your@email.com"
                            value={formData.email}
                            onChange={(e) => handleChange('email', e.target.value)}
                            className={cn(errors.email && 'border-destructive')}
                          />
                          {errors.email && (
                            <p className="text-xs text-destructive">{errors.email}</p>
                          )}
                        </div>
                      </div>

                      {/* Subject */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-subject">Subject *</Label>
                        <Input
                          id="contact-subject"
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={(e) => handleChange('subject', e.target.value)}
                          className={cn(errors.subject && 'border-destructive')}
                        />
                        {errors.subject && (
                          <p className="text-xs text-destructive">{errors.subject}</p>
                        )}
                      </div>

                      {/* Message */}
                      <div className="space-y-2">
                        <Label htmlFor="contact-message">Message *</Label>
                        <Textarea
                          id="contact-message"
                          placeholder="Describe your question or issue in detail..."
                          rows={5}
                          value={formData.message}
                          onChange={(e) => handleChange('message', e.target.value)}
                          className={cn(errors.message && 'border-destructive')}
                        />
                        {errors.message && (
                          <p className="text-xs text-destructive">{errors.message}</p>
                        )}
                      </div>

                      {/* Submit */}
                      <Button
                        type="submit"
                        className="w-full gap-2"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div className="space-y-6 lg:col-span-2" {...fadeInUp} transition={{ delay: 0.15 }}>
              {/* Quick Chat Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Live Chat</h3>
                      <p className="text-xs text-muted-foreground">Fastest way to reach us</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Get instant support through our live chat. Our agents are available during
                    business hours.
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setView('chat')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    Start Chat
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">Business Hours</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Sunday - Thursday</span>
                      <span className="font-medium">9:00 AM - 6:00 PM</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Friday - Saturday</span>
                      <span className="font-medium text-destructive">Closed</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Online Support</span>
                      <span className="font-medium text-emerald-600">24/7</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-primary/5">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-primary">24h</p>
                  <p className="text-sm text-muted-foreground">Average Response Time</p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FAQ Section ========== */}
      <section className="py-16 bg-muted/30">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="text-center mb-10">
            <Badge variant="secondary" className="mb-3">
              <HelpCircle className="mr-1 h-3 w-3" />
              FAQ
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-muted-foreground">
              Quick answers to common questions about CIAR Cars
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <Accordion type="single" collapsible className="space-y-2">
              {FAQ_ITEMS.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="rounded-lg border bg-background px-4 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="text-left text-sm font-medium hover:no-underline py-4">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-muted-foreground leading-relaxed pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
