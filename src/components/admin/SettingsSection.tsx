'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Globe,
  ToggleLeft,
  DollarSign,
  Headphones,
  Save,
  Loader2,
  Building2,
  MapPin,
  Mail,
  Phone,
  FileText,
  MessageSquare,
  UserPlus,
  Star,
  Eye,
  Wrench,
  Landmark,
  Image,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getSettings, saveSettings } from '@/lib/admin-api';
import { toast } from 'sonner';
import { CURRENCY } from '@/lib/constants';

// ============ TYPES ============
interface SettingsState {
  [key: string]: string | number | boolean;
}

// ============ DEFAULT VALUES ============
const DEFAULT_SETTINGS: SettingsState = {
  site_name: '',
  site_description: '',
  site_email: '',
  site_phone: '',
  site_address: '',
  currency: 'USD',
  currency_symbol: '$',
  platform_fee: 10,
  featured_fee: 49.99,
  boost_fee: 19.99,
  listing_fee: 9.99,
  enable_rentals: true,
  enable_chat: true,
  enable_registration: true,
  enable_reviews: true,
  maintenance_mode: false,
  default_country: '',
  default_city: '',
  max_listing_images: 10,
  support_email: '',
  support_phone: '',
};

// ============ FIELD DEFINITIONS ============
interface FieldDef {
  key: string;
  label: string;
  description: string;
  icon: React.ElementType;
  type: 'text' | 'number' | 'textarea' | 'switch';
  placeholder?: string;
  suffix?: string;
}

const GENERAL_FIELDS: FieldDef[] = [
  {
    key: 'site_name',
    label: 'Site Name',
    description: 'The name displayed across the platform',
    icon: Globe,
    type: 'text',
    placeholder: 'e.g. CIAR Cars',
  },
  {
    key: 'site_description',
    label: 'Site Description',
    description: 'A brief description used in meta tags and headers',
    icon: FileText,
    type: 'textarea',
    placeholder: 'e.g. The World\'s Premier Car Marketplace',
  },
  {
    key: 'site_email',
    label: 'Contact Email',
    description: 'Main contact email displayed on the site',
    icon: Mail,
    type: 'text',
    placeholder: 'e.g. hello@ciarcars.com',
  },
  {
    key: 'site_phone',
    label: 'Contact Phone',
    description: 'Main phone number displayed on the site',
    icon: Phone,
    type: 'text',
    placeholder: 'e.g. +1 (555) 000-0000',
  },
  {
    key: 'site_address',
    label: 'Business Address',
    description: 'Physical address displayed in footer and contact pages',
    icon: Building2,
    type: 'text',
    placeholder: 'e.g. Business Bay, Dubai, UAE',
  },
  {
    key: 'currency',
    label: 'Currency Code',
    description: 'ISO 4217 currency code for all prices on the platform',
    icon: Landmark,
    type: 'text',
    placeholder: 'e.g. USD',
  },
  {
    key: 'default_country',
    label: 'Default Country',
    description: 'Pre-selected country for new listings and user profiles',
    icon: MapPin,
    type: 'text',
    placeholder: 'e.g. United States',
  },
  {
    key: 'default_city',
    label: 'Default City',
    description: 'Pre-selected city for new listings and user profiles',
    icon: MapPin,
    type: 'text',
    placeholder: 'e.g. New York',
  },
];

const FEATURE_FIELDS: FieldDef[] = [
  {
    key: 'enable_rentals',
    label: 'Enable Rentals',
    description: 'Allow users to list and book cars for rent on the platform',
    icon: ToggleLeft,
    type: 'switch',
  },
  {
    key: 'enable_chat',
    label: 'Enable Chat',
    description: 'Enable real-time messaging between buyers and sellers',
    icon: MessageSquare,
    type: 'switch',
  },
  {
    key: 'enable_registration',
    label: 'Enable Registration',
    description: 'Allow new users to create accounts on the platform',
    icon: UserPlus,
    type: 'switch',
  },
  {
    key: 'enable_reviews',
    label: 'Enable Reviews',
    description: 'Allow users to leave reviews on completed transactions',
    icon: Star,
    type: 'switch',
  },
  {
    key: 'maintenance_mode',
    label: 'Maintenance Mode',
    description: 'When enabled, the site shows a maintenance page to non-admin users',
    icon: Wrench,
    type: 'switch',
  },
];

const FEE_FIELDS: FieldDef[] = [
  {
    key: 'platform_fee',
    label: 'Platform Fee',
    description: 'Commission percentage charged on each transaction',
    icon: DollarSign,
    type: 'number',
    suffix: '%',
    placeholder: 'e.g. 10',
  },
  {
    key: 'featured_fee',
    label: 'Featured Listing Fee',
    description: 'Price to feature a car listing at the top of search results',
    icon: Star,
    type: 'number',
    suffix: '$',
    placeholder: 'e.g. 49.99',
  },
  {
    key: 'boost_fee',
    label: 'Boost Fee',
    description: 'Price to boost a listing for higher visibility',
    icon: Eye,
    type: 'number',
    suffix: '$',
    placeholder: 'e.g. 19.99',
  },
  {
    key: 'listing_fee',
    label: 'Listing Fee',
    description: 'Price charged to sellers for listing a vehicle',
    icon: DollarSign,
    type: 'number',
    suffix: '$',
    placeholder: 'e.g. 9.99',
  },
  {
    key: 'max_listing_images',
    label: 'Max Listing Images',
    description: 'Maximum number of images allowed per car listing',
    icon: Image,
    type: 'number',
    placeholder: 'e.g. 10',
  },
];

const SUPPORT_FIELDS: FieldDef[] = [
  {
    key: 'support_email',
    label: 'Support Email',
    description: 'Email address where users can reach the support team. Displayed in help and contact pages.',
    icon: Mail,
    type: 'text',
    placeholder: 'e.g. support@ciarcars.com',
  },
  {
    key: 'support_phone',
    label: 'Support Phone',
    description: 'Phone number for customer support. Used in help center and contact pages.',
    icon: Headphones,
    type: 'text',
    placeholder: 'e.g. +1 (555) 000-0000',
  },
];

// ============ COMPONENT ============
export default function SettingsSection() {
  const [settings, setSettings] = useState<SettingsState>({ ...DEFAULT_SETTINGS });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  // Track dirty state (changes since last save)
  const [originalSettings, setOriginalSettings] = useState<SettingsState>({});

  // Fetch settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      const res = await getSettings();
      if (res.success && res.data) {
        const merged: SettingsState = { ...DEFAULT_SETTINGS };
        for (const [key, value] of Object.entries(res.data)) {
          if (value !== null && value !== undefined && key in merged) {
            merged[key] = value;
          }
        }
        setSettings(merged);
        setOriginalSettings(merged);
      } else {
        toast.error('Failed to load settings');
        setSettings({ ...DEFAULT_SETTINGS });
        setOriginalSettings({ ...DEFAULT_SETTINGS });
      }
      setLoading(false);
    };

    fetchSettings();
  }, []);

  // Update a single setting
  const updateSetting = useCallback((key: string, value: string | number | boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  }, []);

  // Check if there are unsaved changes
  const hasChanges = Object.keys(settings).some(
    (key) => JSON.stringify(settings[key]) !== JSON.stringify(originalSettings[key])
  );

  // Save all settings
  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert all values to appropriate types for the API
      const settingsToSave: Record<string, string | number | boolean> = {};
      for (const [key, value] of Object.entries(settings)) {
        settingsToSave[key] = value;
      }

      const res = await saveSettings(settingsToSave);
      if (res.success) {
        toast.success('Settings saved successfully');
        setOriginalSettings({ ...settings });
      } else {
        toast.error(res.error || 'Failed to save settings');
      }
    } catch {
      toast.error('Network error. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // ============ SUB-COMPONENTS ============
  const renderTextField = (field: FieldDef) => (
    <div key={field.key} className="space-y-2">
      <div className="flex items-center gap-2">
        <field.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Label htmlFor={field.key} className="text-sm font-medium">
          {field.label}
        </Label>
      </div>
      <div className="relative">
        <Input
          id={field.key}
          type="text"
          value={(settings[field.key] as string) || ''}
          onChange={(e) => updateSetting(field.key, e.target.value)}
          placeholder={field.placeholder}
          disabled={loading || saving}
          className="h-10"
        />
      </div>
      <p className="text-xs text-muted-foreground">{field.description}</p>
    </div>
  );

  const renderTextareaField = (field: FieldDef) => (
    <div key={field.key} className="space-y-2">
      <div className="flex items-center gap-2">
        <field.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Label htmlFor={field.key} className="text-sm font-medium">
          {field.label}
        </Label>
      </div>
      <Textarea
        id={field.key}
        value={(settings[field.key] as string) || ''}
        onChange={(e) => updateSetting(field.key, e.target.value)}
        placeholder={field.placeholder}
        disabled={loading || saving}
        rows={3}
        className="resize-none"
      />
      <p className="text-xs text-muted-foreground">{field.description}</p>
    </div>
  );

  const renderNumberField = (field: FieldDef) => (
    <div key={field.key} className="space-y-2">
      <div className="flex items-center gap-2">
        <field.icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        <Label htmlFor={field.key} className="text-sm font-medium">
          {field.label}
          {field.suffix && (
            <span className="ml-1.5 text-xs text-muted-foreground font-normal">
              ({field.suffix})
            </span>
          )}
        </Label>
      </div>
      <div className="relative">
        {field.suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground font-medium">
            {field.suffix}
          </span>
        )}
        <Input
          id={field.key}
          type="number"
          value={settings[field.key] as number}
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : parseFloat(e.target.value);
            updateSetting(field.key, isNaN(val) ? 0 : val);
          }}
          placeholder={field.placeholder}
          disabled={loading || saving}
          min={0}
          className={`h-10 ${field.suffix ? 'pr-10' : ''}`}
        />
      </div>
      <p className="text-xs text-muted-foreground">{field.description}</p>
    </div>
  );

  const renderSwitchField = (field: FieldDef) => {
    const isMaintenance = field.key === 'maintenance_mode';
    const isDisabled = isMaintenance
      ? false
      : (settings.maintenance_mode as boolean);

    return (
      <div key={field.key} className="space-y-0">
        <div className="flex items-center justify-between py-3">
          <div className="flex items-start gap-3 flex-1">
            <div className={`p-2 rounded-lg mt-0.5 ${
              settings[field.key] as boolean
                ? 'bg-emerald-50 dark:bg-emerald-950/30'
                : 'bg-gray-100 dark:bg-gray-800/50'
            }`}>
              <field.icon className={`w-4 h-4 ${
                settings[field.key] as boolean
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : 'text-gray-500 dark:text-gray-400'
              }`} />
            </div>
            <div className="flex-1">
              <Label className="text-sm font-medium">{field.label}</Label>
              <p className="text-xs text-muted-foreground mt-0.5">
                {field.description}
                {isMaintenance && (settings.maintenance_mode as boolean) && (
                  <span className="text-yellow-600 dark:text-yellow-400 font-medium ml-1">
                    (Active)
                  </span>
                )}
              </p>
            </div>
          </div>
          <Switch
            checked={settings[field.key] as boolean}
            onCheckedChange={(checked) => updateSetting(field.key, checked)}
            disabled={loading || saving || (isMaintenance ? false : isDisabled)}
          />
        </div>
        <Separator />
      </div>
    );
  };

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-9 w-24 rounded-lg" />
        ))}
      </div>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-3 w-48" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );

  // ============ RENDER ============
  if (loading) {
    return renderLoadingSkeleton();
  }

  return (
    <motion.div
      key="settings"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Site Settings</h2>
          <p className="text-muted-foreground">
            Configure platform-wide settings and preferences.
          </p>
        </div>
      </div>

      {/* Tabbed Settings */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex flex-wrap h-auto gap-1 p-1">
          <TabsTrigger value="general" className="gap-1.5">
            <Globe className="w-4 h-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-1.5">
            <ToggleLeft className="w-4 h-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="fees" className="gap-1.5">
            <DollarSign className="w-4 h-4" />
            Fees
          </TabsTrigger>
          <TabsTrigger value="support" className="gap-1.5">
            <Headphones className="w-4 h-4" />
            Support
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">General Settings</CardTitle>
              <CardDescription>
                Basic site information displayed across the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {GENERAL_FIELDS.map(renderTextField)}
              {GENERAL_FIELDS.filter((f) => f.type === 'textarea').map(renderTextareaField)}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Feature Toggles</CardTitle>
              <CardDescription>
                Enable or disable platform features. Changes take effect immediately.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings.maintenance_mode as boolean && (
                <div className="mb-4 p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-900/50">
                  <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-400">
                    <Wrench className="w-4 h-4 flex-shrink-0" />
                    <p className="text-sm font-medium">
                      Maintenance mode is active. Some features may be disabled.
                    </p>
                  </div>
                </div>
              )}
              <div>
                {FEATURE_FIELDS.map(renderSwitchField)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees Tab */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Platform Fees & Pricing</CardTitle>
              <CardDescription>
                Configure commission rates and service charges
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {FEE_FIELDS.map(renderNumberField)}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Support Tab */}
        <TabsContent value="support">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Support & Contact</CardTitle>
              <CardDescription>
                Contact information for customer support. Displayed across help and contact pages.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {SUPPORT_FIELDS.map(renderTextField)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Button - Sticky */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="sticky bottom-4 z-10"
        >
          <Card className="border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-sm shadow-lg">
            <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-muted-foreground">
                You have unsaved changes.
              </p>
              <Button
                onClick={handleSave}
                disabled={saving}
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-2 min-w-[160px]"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
