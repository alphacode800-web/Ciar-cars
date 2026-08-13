'use client';

import { useState, useCallback, useMemo } from 'react';
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
import { useTranslation } from '@/hooks/use-translation';

type TrFn = (ar: string, en: string) => string;

// ============ Contact Info ============

function getContactInfo(tr: TrFn) {
  return [
    {
      icon: Mail,
      title: tr('راسلنا', 'Email Us'),
      detail: 'azasnaa628@gmail.com',
      subDetail: tr('نرد خلال 24 ساعة', 'We reply within 24 hours'),
      action: 'mailto:azasnaa628@gmail.com',
      color: 'bg-primary/10 text-primary',
    },
    {
      icon: Phone,
      title: tr('اتصل بنا', 'Call Us'),
      detail: '+963993153333',
      subDetail: tr('الأحد–الخميس، 9 ص – 6 م', 'Sun-Thu, 9AM - 6PM'),
      action: 'tel:+963993153333',
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      icon: MapPin,
      title: tr('زرنا', 'Visit Us'),
      detail: tr('خليج الأعمال، دبي', 'Business Bay, Dubai'),
      subDetail: tr('دبي، الإمارات', 'Dubai, UAE'),
      action: null as string | null,
      color: 'bg-orange-50 text-orange-600',
    },
  ];
}

// ============ FAQ Data ============

function getFaqItems(tr: TrFn) {
  return [
    {
      question: tr('كيف أدرج سيارتي للبيع؟', 'How do I list my car for sale?'),
      answer: tr(
        'لإدراج سيارتك، انقر على «بع سيارتك» من قائمة التنقل. املأ التفاصيل بما في ذلك الصور والمواصفات والسعر. سيراجع فريقنا إعلانك ويظهر عادة خلال 24 ساعة.',
        'To list your car, click "Sell Your Car" from the navigation menu. Fill in the details including photos, specifications, and price. Your listing will be reviewed by our team and typically goes live within 24 hours.'
      ),
    },
    {
      question: tr('هل إدراج السيارة مجاني؟', 'Is it free to list a car?'),
      answer: tr(
        'الإعلانات الأساسية مجانية تمامًا! يمكنك تعزيز إعلانك بخيارات التمييز أو الترويج مقابل رسوم بسيطة لزيادة ظهور سيارتك.',
        'Basic listings are completely free! You can enhance your listing with featured placement or boost options for a small fee, which helps your car get more visibility.'
      ),
    },
    {
      question: tr('كيف يعمل تأجير السيارات؟', 'How does car rental work?'),
      answer: tr(
        'ابحث عن سيارة معلَّمة «متاحة للإيجار»، اختر التواريخ، وأرسل طلب الحجز. سيراجع المالك ويؤكّد حجزك. تتم المدفوعات بأمان عبر منصتنا.',
        'Find a car marked "Available for Rent," select your dates, and submit a booking request. The owner will review and confirm your booking. Payment is processed securely through our platform.'
      ),
    },
    {
      question: tr('ما طرق الدفع المقبولة؟', 'What payment methods do you accept?'),
      answer: tr(
        'نقبل الدفع عبر محفظة CIAR (موصى بها)، وبطاقات الائتمان/الخصم (Visa وMastercard وMeza)، والدفع عند الاستلام للإيجارات. تُعالَج جميع المعاملات بأمان.',
        'We accept payments through the CIAR Wallet (recommended), credit/debit cards (Visa, Mastercard, Meza), and cash on delivery for rentals. All transactions are securely processed.'
      ),
    },
    {
      question: tr('كيف تُتحقق السيارات؟', 'How are cars verified?'),
      answer: tr(
        'نشجّع البائعين على تقديم صور ومواصفات مفصّلة. للإعلانات المميزة نوفر خدمة فحص اختيارية تقدّم تقرير حالة شامل للمشترين.',
        'We encourage sellers to provide detailed photos and specifications. For premium listings, we offer optional vehicle inspection services that provide a comprehensive condition report for buyers.'
      ),
    },
    {
      question: tr('ماذا لو واجهت مشكلة في معاملة؟', 'What if I have a problem with a transaction?'),
      answer: tr(
        'فريق الدعم جاهز للمساعدة! تواصل معنا عبر الدردشة أو البريد أو الهاتف. نتوسط في النزاعات ونضمن حلولًا عادلة للمشترين والبائعين.',
        'Our support team is here to help! Contact us through the chat, email, or phone. We mediate disputes and ensure fair resolutions for both buyers and sellers.'
      ),
    },
    {
      question: tr('هل يمكنني تأجير سيارتي؟', 'Can I rent out my own car?'),
      answer: tr(
        'نعم! عند إدراج سيارتك فعّل خيار «متاحة للإيجار» وحدّد أسعارك اليومية والأسبوعية والشهرية. تربح بينما سيارتك غير مستخدمة.',
        'Yes! When listing your car, simply enable the "Available for Rent" option and set your daily, weekly, and monthly rates. You earn money while your car is not in use.'
      ),
    },
    {
      question: tr('كيف تعمل محفظة CIAR؟', 'How does the CIAR Wallet work?'),
      answer: tr(
        'محفظة CIAR محفظة رقمية مرتبطة بحسابك. يمكنك شحنها ببطاقة أو تحويل بنكي، واستخدامها للمشتريات والإيجارات، وسحب الأموال إلى حسابك البنكي.',
        'The CIAR Wallet is a digital wallet linked to your account. You can top up using a card or bank transfer, use it for purchases and rentals, and withdraw funds to your bank account.'
      ),
    },
  ];
}

// ============ Animation ============

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-50px' },
  transition: { duration: 0.5 },
};

// ============ Main Component ============

export default function ContactView() {
  const { setView, viewParams } = useAppStore();
  const { locale, isRTL } = useTranslation();
  const isAr = locale === 'ar';
  const tr = useCallback((ar: string, en: string) => (isAr ? ar : en), [isAr]);

  const isAdvertisingInquiry = viewParams.topic === 'advertising';

  const contactInfo = useMemo(() => getContactInfo(tr), [tr]);
  const faqItems = useMemo(() => getFaqItems(tr), [tr]);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: isAdvertisingInquiry
      ? isAr
        ? 'استفسار إعلاني'
        : 'Advertising inquiry'
      : '',
    message: isAdvertisingInquiry
      ? isAr
        ? 'أود الإعلان على CIAR Cars. يرجى إرسال الباقات والمواضع المتاحة.'
        : 'I would like to advertise on CIAR Cars. Please send me the available packages and placements.'
      : '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ============ Validate ============

  const validate = useCallback((): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = tr('الاسم مطلوب', 'Name is required');
    if (!formData.email.trim()) newErrors.email = tr('البريد الإلكتروني مطلوب', 'Email is required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = tr('صيغة البريد الإلكتروني غير صالحة', 'Invalid email format');
    if (!formData.subject.trim()) newErrors.subject = tr('الموضوع مطلوب', 'Subject is required');
    if (!formData.message.trim()) newErrors.message = tr('الرسالة مطلوبة', 'Message is required');
    else if (formData.message.trim().length < 10)
      newErrors.message = tr('يجب ألا تقل الرسالة عن 10 أحرف', 'Message must be at least 10 characters');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData, tr]);

  // ============ Submit ============

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      setIsSubmitting(true);

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const json = await res.json();
        if (!json.success) {
          setErrors({
            message:
              json.error ||
              tr('فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.', 'Failed to send message. Please try again.'),
          });
          return;
        }

        setSubmitSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
      } catch {
        setErrors({
          message: tr(
            'فشل إرسال الرسالة. يرجى المحاولة مرة أخرى.',
            'Failed to send message. Please try again.'
          ),
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, formData, tr]
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
    <div className="min-h-screen" dir={isRTL ? 'rtl' : 'ltr'}>
      <PageHero
        badge={tr('تواصل معنا', 'Contact Us')}
        compact
        title={
          <>
            {tr('يسعدنا أن', "We'd Love to")}{' '}
            <span className="text-emerald-600 dark:text-emerald-400">
              {tr('نسمع منك', 'Hear From You')}
            </span>
          </>
        }
        subtitle={tr(
          'هل لديك سؤال أو اقتراح أو تحتاج مساعدة؟ فريقنا جاهز لمساندتك في كل خطوة.',
          'Have a question, suggestion, or need help? Our team is here to assist you every step of the way.'
        )}
        image={PAGE_HERO_IMAGES.contact}
      />

      {/* ========== Contact Info Cards ========== */}
      <section className="py-12">
        <div className="mx-auto max-w-5xl px-4 md:px-6">
          <motion.div className="grid grid-cols-1 gap-4 md:grid-cols-3" {...fadeInUp}>
            {contactInfo.map((info) => {
              const Icon = info.icon;
              const content = (
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div
                      className={cn(
                        'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                        info.color
                      )}
                    >
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
                  <CardTitle className="text-xl">{tr('أرسل لنا رسالة', 'Send Us a Message')}</CardTitle>
                  <CardDescription>
                    {tr(
                      'املأ النموذج أدناه وسنعاود التواصل معك في أقرب وقت.',
                      "Fill out the form below and we'll get back to you as soon as possible."
                    )}
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
                      <h3 className="text-lg font-semibold">{tr('تم إرسال الرسالة!', 'Message Sent!')}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {tr(
                          'شكرًا لتواصلك. سنرد عليك خلال 24 ساعة.',
                          "Thank you for reaching out. We'll get back to you within 24 hours."
                        )}
                      </p>
                      <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setSubmitSuccess(false)}
                      >
                        {tr('إرسال رسالة أخرى', 'Send Another Message')}
                      </Button>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Name */}
                        <div className="space-y-2">
                          <Label htmlFor="contact-name">{tr('الاسم الكامل *', 'Full Name *')}</Label>
                          <Input
                            id="contact-name"
                            placeholder={tr('اسمك', 'Your name')}
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
                          <Label htmlFor="contact-email">{tr('البريد الإلكتروني *', 'Email *')}</Label>
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
                        <Label htmlFor="contact-subject">{tr('الموضوع *', 'Subject *')}</Label>
                        <Input
                          id="contact-subject"
                          placeholder={tr('كيف يمكننا مساعدتك؟', 'How can we help?')}
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
                        <Label htmlFor="contact-message">{tr('الرسالة *', 'Message *')}</Label>
                        <Textarea
                          id="contact-message"
                          placeholder={tr(
                            'صف سؤالك أو مشكلتك بالتفصيل...',
                            'Describe your question or issue in detail...'
                          )}
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
                      <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            {tr('جارٍ الإرسال...', 'Sending...')}
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            {tr('إرسال الرسالة', 'Send Message')}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Sidebar */}
            <motion.div
              className="space-y-6 lg:col-span-2"
              {...fadeInUp}
              transition={{ delay: 0.15 }}
            >
              {/* Quick Chat Card */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <MessageSquare className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{tr('الدردشة المباشرة', 'Live Chat')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {tr('أسرع طريقة للتواصل معنا', 'Fastest way to reach us')}
                      </p>
                    </div>
                  </div>
                  <p className="mb-4 text-sm text-muted-foreground">
                    {tr(
                      'احصل على دعم فوري عبر الدردشة المباشرة. وكلاؤنا متاحون خلال ساعات العمل.',
                      'Get instant support through our live chat. Our agents are available during business hours.'
                    )}
                  </p>
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => setView('chat')}
                  >
                    <MessageSquare className="h-4 w-4" />
                    {tr('بدء الدردشة', 'Start Chat')}
                  </Button>
                </CardContent>
              </Card>

              {/* Business Hours */}
              <Card>
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-50">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold">{tr('ساعات العمل', 'Business Hours')}</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {tr('الأحد – الخميس', 'Sunday - Thursday')}
                      </span>
                      <span className="font-medium">
                        {tr('9:00 ص – 6:00 م', '9:00 AM - 6:00 PM')}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {tr('الجمعة – السبت', 'Friday - Saturday')}
                      </span>
                      <span className="font-medium text-destructive">{tr('مغلق', 'Closed')}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">
                        {tr('الدعم عبر الإنترنت', 'Online Support')}
                      </span>
                      <span className="font-medium text-emerald-600">
                        {tr('على مدار الساعة', '24/7')}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="bg-primary/5">
                <CardContent className="p-6 text-center">
                  <p className="text-2xl font-bold text-primary">{tr('24 ساعة', '24h')}</p>
                  <p className="text-sm text-muted-foreground">
                    {tr('متوسط وقت الرد', 'Average Response Time')}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== FAQ Section ========== */}
      <section className="bg-muted/30 py-16">
        <div className="mx-auto max-w-3xl px-4 md:px-6">
          <motion.div {...fadeInUp} className="mb-10 text-center">
            <Badge variant="secondary" className="mb-3">
              <HelpCircle className="me-1 h-3 w-3" />
              {tr('الأسئلة الشائعة', 'FAQ')}
            </Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              {tr('الأسئلة المتكررة', 'Frequently Asked Questions')}
            </h2>
            <p className="mt-3 text-muted-foreground">
              {tr('إجابات سريعة على الأسئلة الشائعة حول CIAR Cars', 'Quick answers to common questions about CIAR Cars')}
            </p>
          </motion.div>

          <motion.div {...fadeInUp} transition={{ delay: 0.1 }}>
            <Accordion type="single" collapsible className="space-y-2">
              {faqItems.map((item, idx) => (
                <AccordionItem
                  key={idx}
                  value={`faq-${idx}`}
                  className="rounded-lg border bg-background px-4 data-[state=open]:shadow-sm"
                >
                  <AccordionTrigger className="py-4 text-start text-sm font-medium hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
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
