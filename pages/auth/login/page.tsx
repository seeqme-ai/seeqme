import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth-context";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader, CheckCircle2, ArrowRight } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import apiClient from "@/services/apiService";

const loginUser = async ({ email, password }: any) => {
  const { data } = await apiClient.post(`/auth/login`, { email, password });
  return data;
};

const forgotPassword = async (email: string) => {
  const { data } = await apiClient.post(`/auth/forgot-password`, { email });
  return data;
};

const TRUST_POINTS = [
  '2,400+ professionals trust SeeqMe',
  'Average 47 seconds from CV to live site',
  'Google-indexed on day one',
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.removeItem("redirectUrl");
      checkAuth(data.token);
      toast.success("Logged in successfully!");
      const redirect = searchParams.get("redirect");
      navigate(redirect || "/dashboard");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Login failed. Please try again.");
    },
  });

  const verifyGoogleTokenMutation = useMutation({
    mutationFn: async (token: string) => {
      const { data } = await apiClient.post(`/auth/google/verify-token`, { token });
      return data;
    },
    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      window.location.href = searchParams.get("redirect") || "/dashboard";
      toast.success("Successfully authenticated!");
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.details || error.response?.data?.error || "Google login failed.";
      console.error("Google auth error:", errorMsg);
      toast.error(errorMsg);
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: forgotPassword,
    onSuccess: () => {
      toast.success("If an account with that email exists, a password reset link has been sent.");
      setIsForgotPasswordModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to send reset email.");
    },
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPasswordMutation.mutate(forgotPasswordEmail);
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT — Brand panel ── */}
      <div
        className="hidden lg:flex relative w-[44%] flex-col overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 30% 40%, rgba(20,184,166,0.12) 0%, transparent 65%), #020817' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:52px_52px]" />
        {/* Extra glow */}
        <div className="absolute top-2/3 -right-20 w-64 h-64 bg-violet-500/[0.06] rounded-full blur-[100px]" />

        <div className="relative flex flex-col justify-between h-full p-12 z-10">

          {/* Logo */}
          <div className='text-white font-bold flex items-center gap-2'>
            <img src="/seeqme-logo-white.png" alt="SeeqMe" className="h-7 w-auto" />
            SeeqMe
          </div>

          {/* Center */}
          <div>
            <h2 className="text-4xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Your career.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-teal-600">
                Live. In 60 seconds.
              </span>
            </h2>
            <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed max-w-xs">
              AI-crafted portfolio websites, deployed globally, indexed by Google from the moment you publish.
            </p>

            <div className="flex flex-col gap-3.5">
              {TRUST_POINTS.map((txt, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-400">
                  <div className="w-5 h-5 rounded-full bg-teal-500/15 border border-teal-500/20 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-3 h-3 text-teal-400" />
                  </div>
                  {txt}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <p className="text-xs text-slate-700 font-medium">
            © 2026 SeeqMe AI. All rights reserved.
          </p>
        </div>
      </div>

      {/* ── RIGHT — Form panel ── */}
      <div className="flex-1 flex items-center justify-center bg-white px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-[400px]"
        >

          {/* Mobile logo */}
          <div className="font-bold item-center text-2xl lg:hidden mb-8 flex justify-center">
            <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-8 w-auto" />
            seeqMe
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Welcome back</h1>
            <p className="text-sm text-slate-500 font-medium mt-1.5">Sign in to your SeeqMe account</p>
          </div>

          {/* Google */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  verifyGoogleTokenMutation.mutate(credentialResponse.credential);
                }
              }}
              onError={() => toast.error('Google Login Failed')}
              width="368"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                or continue with email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@example.com"
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white transition-all"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-slate-700">Password</label>
                <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <button type="button" className="text-xs text-teal-600 hover:text-teal-700 font-semibold transition-colors">
                      Forgot password?
                    </button>
                  </DialogTrigger>
                  <DialogContent className="bg-white border-slate-100 rounded-2xl p-7 max-w-sm shadow-2xl shadow-slate-900/10">
                    <DialogHeader>
                      <DialogTitle className="text-xl font-black text-slate-900">Reset your password</DialogTitle>
                      <DialogDescription className="text-slate-500 text-sm mt-1">
                        Enter your email and we'll send a reset link right away.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4 mt-4">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                        <input
                          type="email"
                          required
                          value={forgotPasswordEmail}
                          onChange={(e) => setForgotPasswordEmail(e.target.value)}
                          placeholder="your@example.com"
                          className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
                        />
                      </div>
                      <DialogFooter>
                        <button
                          type="submit"
                          disabled={forgotPasswordMutation.isPending}
                          className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {forgotPasswordMutation.isPending ? <Loader className="w-4 h-4 animate-spin" /> : 'Send reset link'}
                        </button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full h-12 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/8 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>Sign in <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 font-medium mt-7">
            Don't have an account?{' '}
            <Link
              to={`/auth/signup${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="text-teal-600 hover:text-teal-700 font-bold transition-colors"
            >
              Create one free
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
