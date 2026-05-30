'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  Shield,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import {
  isAdminRole,
  signInWithCredentials,
  syncAuthStoreFromSession,
} from '@/lib/auth-helpers';
import { useTranslation } from '@/hooks/use-translation';

export default function AdminAuthView() {
  const router = useRouter();
  const { setUser } = useAuthStore();
  const { setView } = useAppStore();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const completeAdminLogin = async () => {
    const user = await syncAuthStoreFromSession(setUser);
    if (!user || !isAdminRole(user.role)) {
      toast.error(t('adminAuth.invalidSession'));
      return;
    }

    toast.success(t('adminAuth.welcome'));
    setView('admin');
    router.push('/?view=admin');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('adminAuth.fillAllFields'));
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithCredentials(email, password, 'admin');
      if (!result.ok) {
        toast.error(result.error || t('adminAuth.loginFailed'));
        return;
      }
      await completeAdminLogin();
    } catch {
      toast.error(t('adminAuth.loginFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-950 to-black" />
      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-slate-600/20 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20 mb-3">
            <Shield className="w-7 h-7 text-slate-950" />
          </div>
          <h1 className="text-xl font-semibold text-white">{t('adminAuth.title')}</h1>
          <p className="text-sm text-slate-400 mt-1 text-center">{t('adminAuth.subtitle')}</p>
          <button
            type="button"
            onClick={() => {
              setView('home');
              router.push('/');
            }}
            className="mt-4 text-sm text-slate-400 hover:text-white transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            {t('adminAuth.backToSite')}
          </button>
        </div>

        <Card className="border-slate-800 bg-slate-900/80 backdrop-blur-xl shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-lg text-white">{t('adminAuth.signIn')}</CardTitle>
            <CardDescription className="text-slate-400">
              {t('adminAuth.signInDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email" className="text-slate-200">
                  {t('adminAuth.email')}
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@ciar.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admin-password" className="text-slate-200">
                  {t('adminAuth.password')}
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="admin-password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-slate-950/50 border-slate-700 text-white placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-semibold"
                disabled={loading}
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {t('adminAuth.signInButton')}
              </Button>
            </form>

            <p className="mt-4 text-xs text-center text-slate-500">
              {t('adminAuth.userLoginHint')}{' '}
              <button
                type="button"
                className="text-amber-500/90 hover:text-amber-400 underline-offset-2 hover:underline"
                onClick={() => {
                  setView('auth');
                  router.push('/');
                }}
              >
                {t('nav.login')}
              </button>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
