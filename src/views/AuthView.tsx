'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  User,
  Phone,
  Car,
  ArrowLeft,
  Chrome,
  Loader2,
  Check,
  CheckCircle2,
  Store,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth-store';
import { useAppStore } from '@/store/app-store';
import { toast } from 'sonner';
import { CURRENCY } from '@/lib/constants';
import { UserRole } from '@/types';
import { PAGE_HERO_IMAGES } from '@/lib/car-images';

const roles = [
  {
    value: 'user',
    label: 'Buyer',
    description: 'I want to find and buy my next car',
    icon: User,
    accent: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    ring: 'ring-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    border: 'border-emerald-500',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    labelColor: 'text-emerald-700 dark:text-emerald-300',
    descColor: 'text-emerald-600/70 dark:text-emerald-400/70',
  },
  {
    value: 'seller',
    label: 'Seller',
    description: 'I want to list and sell vehicles',
    icon: Store,
    accent: 'teal',
    gradient: 'from-teal-500 to-teal-600',
    ring: 'ring-teal-500',
    bg: 'bg-teal-50 dark:bg-teal-950/30',
    border: 'border-teal-500',
    iconBg: 'bg-teal-100 dark:bg-teal-900/40',
    iconColor: 'text-teal-600 dark:text-teal-400',
    labelColor: 'text-teal-700 dark:text-teal-300',
    descColor: 'text-teal-600/70 dark:text-teal-400/70',
  },
] as const;

export default function AuthView() {
  const { setUser } = useAuthStore();
  const { setView } = useAppStore();

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [registerForm, setRegisterForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    agreeTerms: false,
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);

  const passwordStrength = React.useMemo(() => {
    const pw = registerForm.password;
    if (!pw) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pw.length >= 6) score++;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;

    if (score <= 1) return { score: 20, label: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 40, label: 'Fair', color: 'bg-yellow-500' };
    if (score === 3) return { score: 60, label: 'Good', color: 'bg-yellow-500' };
    if (score === 4) return { score: 80, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 100, label: 'Very Strong', color: 'bg-green-600' };
  }, [registerForm.password]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      toast.error('Please fill in all fields');
      return;
    }
    setLoginLoading(true);
    try {
      const result = await signInWithCredentials(
        loginForm.email,
        loginForm.password,
        'user'
      );

      if (!result.ok) {
        toast.error(result.error || 'Invalid credentials');
        return;
      }

      const user = await syncAuthStoreFromSession(setUser);
      if (user && isAdminRole(user.role)) {
        toast.error('Please use the admin login page');
        return;
      }

      if (user) {
        toast.success('Welcome back!');
        setView('home');
      }
    } catch {
      toast.error('Login failed. Please try again.');
    } finally {
      setLoginLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.fullName || !registerForm.email || !registerForm.password || !registerForm.role) {
      toast.error('Please fill in all required fields');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (registerForm.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (!registerForm.agreeTerms) {
      toast.error('Please agree to the terms and conditions');
      return;
    }
    setRegisterLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: registerForm.fullName,
          email: registerForm.email,
          phone: registerForm.phone,
          password: registerForm.password,
          role: registerForm.role === 'seller' ? UserRole.SELLER : UserRole.USER,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created! Logging you in...');
        await handleLogin({
          preventDefault: () => {},
        } as React.FormEvent);
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch {
      toast.error('Registration failed. Please try again.');
    } finally {
      setRegisterLoading(false);
    }
  };

  const variants = {
    enter: { opacity: 0, x: 20 },
    center: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 },
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <img
        src={PAGE_HERO_IMAGES.auth}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950/90 via-gray-950/85 to-teal-950/90 dark:from-gray-950/95 dark:via-gray-950/90 dark:to-emerald-950/95" />
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo & Back */}
        <div className="flex flex-col items-center mb-6">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="flex items-center gap-2 mb-4"
          >
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Car className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              CIAR Cars
            </span>
          </motion.div>
          <button
            onClick={() => setView('home')}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to home
          </button>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="w-full grid grid-cols-2 h-11">
            <TabsTrigger value="login" className="text-sm font-medium">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="text-sm font-medium">
              Create Account
            </TabsTrigger>
          </TabsList>

          <AnimatePresence mode="wait">
            {/* ============ LOGIN ============ */}
            <motion.div
              key="login"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <TabsContent value="login">
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to your {CURRENCY.symbol} CIAR Cars account
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="login-email">Email</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={loginForm.email}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, email: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="login-password">Password</Label>
                          <button
                            type="button"
                            className="text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 font-medium"
                          >
                            Forgot password?
                          </button>
                        </div>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="login-password"
                            type={showLoginPassword ? 'text' : 'password'}
                            placeholder="Enter your password"
                            value={loginForm.password}
                            onChange={(e) =>
                              setLoginForm({ ...loginForm, password: e.target.value })
                            }
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showLoginPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Checkbox
                          id="remember"
                          checked={loginForm.rememberMe}
                          onCheckedChange={(checked) =>
                            setLoginForm({ ...loginForm, rememberMe: !!checked })
                          }
                        />
                        <Label htmlFor="remember" className="text-sm text-muted-foreground cursor-pointer">
                          Remember me
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Sign In
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                          Or continue with
                        </span>
                      </div>
                    </div>

                    {/* Social Login */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-10 font-normal hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        onClick={() => toast.info('Google login coming soon!')}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                          <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                            fill="#4285F4"
                          />
                          <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                          />
                          <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                            fill="#FBBC05"
                          />
                          <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                          />
                        </svg>
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 font-normal hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        onClick={() => toast.info('Facebook login coming soon!')}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </motion.div>

            {/* ============ REGISTER ============ */}
            <motion.div
              key="register"
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25 }}
            >
              <TabsContent value="register">
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">Create Account</CardTitle>
                    <CardDescription>
                      Join the world&apos;s premier car marketplace
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-name">Full Name *</Label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-name"
                            placeholder="Ahmed Mohamed"
                            value={registerForm.fullName}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, fullName: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-email">Email *</Label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-email"
                            type="email"
                            placeholder="you@example.com"
                            value={registerForm.email}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, email: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-phone">Phone</Label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-phone"
                            placeholder="+20 1xx xxx xxxx"
                            value={registerForm.phone}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, phone: e.target.value })
                            }
                            className="pl-10"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-password"
                            type={showRegisterPassword ? 'text' : 'password'}
                            placeholder="Min 6 characters"
                            value={registerForm.password}
                            onChange={(e) =>
                              setRegisterForm({ ...registerForm, password: e.target.value })
                            }
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {registerForm.password && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-1.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="text-muted-foreground">
                                Password strength
                              </span>
                              <span
                                className={`font-medium ${
                                  passwordStrength.score <= 40
                                    ? 'text-red-500'
                                    : passwordStrength.score <= 60
                                      ? 'text-yellow-600'
                                      : 'text-emerald-600'
                                }`}
                              >
                                {passwordStrength.label}
                              </span>
                            </div>
                            <Progress value={passwordStrength.score} className="h-1.5" />
                            <div className="flex gap-3 text-xs text-muted-foreground">
                              <span className={registerForm.password.length >= 6 ? 'text-emerald-600' : ''}>
                                6+ chars
                              </span>
                              <span className={/[A-Z]/.test(registerForm.password) ? 'text-emerald-600' : ''}>
                                Uppercase
                              </span>
                              <span className={/[0-9]/.test(registerForm.password) ? 'text-emerald-600' : ''}>
                                Number
                              </span>
                              <span className={/[^A-Za-z0-9]/.test(registerForm.password) ? 'text-emerald-600' : ''}>
                                Special
                              </span>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Confirm Password *</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                          <Input
                            id="reg-confirm"
                            type={showConfirmPassword ? 'text' : 'password'}
                            placeholder="Repeat your password"
                            value={registerForm.confirmPassword}
                            onChange={(e) =>
                              setRegisterForm({
                                ...registerForm,
                                confirmPassword: e.target.value,
                              })
                            }
                            className="pl-10 pr-10"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        {registerForm.confirmPassword && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-1.5 text-xs"
                          >
                            {registerForm.password === registerForm.confirmPassword ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                                <span className="text-emerald-600">Passwords match</span>
                              </>
                            ) : (
                              <span className="text-red-500">Passwords do not match</span>
                            )}
                          </motion.div>
                        )}
                      </div>

                      {/* Role Selection - Visual Cards */}
                      <div className="space-y-2">
                        <Label>I want to...</Label>
                        <div className="grid grid-cols-2 gap-3">
                          {roles.map((role) => {
                            const isSelected = registerForm.role === role.value;
                            const Icon = role.icon;
                            return (
                              <motion.button
                                key={role.value}
                                type="button"
                                whileHover={{ y: -2 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={() =>
                                  setRegisterForm({ ...registerForm, role: role.value })
                                }
                                className={`
                                  relative flex flex-col items-center gap-2.5 p-4 rounded-xl border-2 cursor-pointer
                                  transition-all duration-200 text-center
                                  ${
                                    isSelected
                                      ? `${role.bg} ${role.border} shadow-lg`
                                      : 'bg-white dark:bg-gray-900/50 border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                                  }
                                `}
                              >
                                {/* Selected check badge */}
                                <AnimatePresence>
                                  {isSelected && (
                                    <motion.div
                                      initial={{ scale: 0, opacity: 0 }}
                                      animate={{ scale: 1, opacity: 1 }}
                                      exit={{ scale: 0, opacity: 0 }}
                                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                      className={`absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-br ${role.gradient} flex items-center justify-center shadow-md`}
                                    >
                                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                                    </motion.div>
                                  )}
                                </AnimatePresence>

                                {/* Icon */}
                                <motion.div
                                  animate={{
                                    scale: isSelected ? 1.1 : 1,
                                  }}
                                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                  className={`
                                    w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-200
                                    ${
                                      isSelected
                                        ? role.iconBg
                                        : 'bg-gray-100 dark:bg-gray-800'
                                    }
                                  `}
                                >
                                  <Icon
                                    className={`w-6 h-6 transition-colors duration-200 ${
                                      isSelected
                                        ? role.iconColor
                                        : 'text-gray-400 dark:text-gray-500'
                                    }`}
                                  />
                                </motion.div>

                                {/* Label */}
                                <span
                                  className={`text-sm font-semibold transition-colors duration-200 ${
                                    isSelected
                                      ? role.labelColor
                                      : 'text-gray-600 dark:text-gray-400'
                                  }`}
                                >
                                  {role.label}
                                </span>

                                {/* Description */}
                                <span
                                  className={`text-[11px] leading-tight transition-colors duration-200 ${
                                    isSelected
                                      ? role.descColor
                                      : 'text-gray-400 dark:text-gray-500'
                                  }`}
                                >
                                  {role.description}
                                </span>
                              </motion.button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex items-start gap-2">
                        <Checkbox
                          id="terms"
                          checked={registerForm.agreeTerms}
                          onCheckedChange={(checked) =>
                            setRegisterForm({
                              ...registerForm,
                              agreeTerms: !!checked,
                            })
                          }
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor="terms"
                          className="text-sm text-muted-foreground leading-snug cursor-pointer"
                        >
                          I agree to the{' '}
                          <button type="button" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline font-medium">
                            Terms of Service
                          </button>{' '}
                          and{' '}
                          <button type="button" className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline font-medium">
                            Privacy Policy
                          </button>
                        </Label>
                      </div>

                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white h-11 font-medium shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 transition-shadow"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        ) : null}
                        Create Account
                      </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-5">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white dark:bg-gray-900 px-2 text-muted-foreground">
                          Or sign up with
                        </span>
                      </div>
                    </div>

                    {/* Social Register */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        className="h-10 font-normal hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        onClick={() => toast.info('Google signup coming soon!')}
                      >
                        <Chrome className="w-4 h-4 mr-2" />
                        Google
                      </Button>
                      <Button
                        variant="outline"
                        className="h-10 font-normal hover:border-emerald-300 dark:hover:border-emerald-700 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors"
                        onClick={() => toast.info('Facebook signup coming soon!')}
                      >
                        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="#1877F2">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </Button>
                    </div>
                  </CardContent>
                  <CardFooter className="justify-center">
                    <p className="text-sm text-muted-foreground">
                      Already have an account?{' '}
                      <button
                        className="text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 dark:hover:text-emerald-300 hover:underline font-medium"
                        onClick={() =>
                          document.querySelector('[data-state="active"]')?.parentElement
                            ?.querySelector('[value="login"]')
                            ?.click()
                        }
                      >
                        Sign in
                      </button>
                    </p>
                  </CardFooter>
                </Card>
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>
    </div>
  );
}
