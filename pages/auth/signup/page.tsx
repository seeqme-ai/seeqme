import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Loader, CheckCircle2, ArrowRight, Zap } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import apiClient from "@/services/apiService";

const signupUser = async ({ email, password, fullName }: any) => {
  const { data } = await apiClient.post(`/auth/register`, { email, password, fullName });
  return data;
};

const PERKS = [
  'Portfolio live on the web in under 60 seconds',
  'AI writes your bio, projects, and skills',
  'Custom domain + SSL on every plan',
];

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const signupMutation = useMutation({
    mutationFn: signupUser,
    onSuccess: () => {
      toast.success("Account created successfully!");
      const redirect = searchParams.get("redirect");
      navigate(`/auth/login${redirect ? `?redirect=${redirect}` : ''}`, { state: { email } });
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.error || "Signup failed. Please try again.";
      const details = error.response?.data?.details;
      toast.error(details ? `${errorMsg}: ${details}` : errorMsg);
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
      toast.error(error.response?.data?.error || "Google signup failed.");
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({ email, password, fullName });
  };

  return (
    <div className="flex min-h-screen">

      {/* ── LEFT — Brand panel ── */}
      <div
        className="hidden lg:flex relative w-[44%] flex-col overflow-hidden"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 70% 40%, rgba(20,184,166,0.12) 0%, transparent 65%), #020817' }}
      >
        {/* Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:52px_52px]" />
        {/* Extra glow */}
        <div className="absolute bottom-1/3 -left-20 w-64 h-64 bg-violet-500/[0.07] rounded-full blur-[100px]" />

        <div className="relative flex flex-col justify-between h-full p-12 z-10">

          {/* Logo */}
          <div className='text-white font-bold flex items-center gap-2'>
            <img src="/seeqme-logo-white.png" alt="SeeqMe" className="h-7 w-auto" />
            SeeqMe
          </div>


          {/* Center */}
          <div>
            <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/15 flex items-center justify-center mb-8 shadow-[0_0_32px_rgba(20,184,166,0.12)]">
              <Zap className="w-6 h-6 text-teal-400" />
            </div>
            <h2 className="text-4xl font-black text-white leading-[1.05] tracking-tight mb-5">
              Get seen.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-teal-400 to-teal-600">
                Get hired.
              </span>
            </h2>
            <p className="text-slate-400 text-base font-medium mb-10 leading-relaxed max-w-xs">
              Build a stunning AI-powered portfolio that recruiters find on Google — completely free to start.
            </p>

            <div className="flex flex-col gap-3.5">
              {PERKS.map((txt, i) => (
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
            <img src="/seeqme-logo-black.png" alt="SeeqMe" className="h-7 w-auto" />
            seeqMe
          </div>


          <div className="mb-8">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Create your account</h1>
            <p className="text-sm text-slate-500 font-medium mt-1.5">
              Free to start — no credit card required
            </p>
          </div>

          {/* Google */}
          <div className="mb-5">
            <GoogleLogin
              onSuccess={(credentialResponse) => {
                if (credentialResponse.credential) {
                  verifyGoogleTokenMutation.mutate(credentialResponse.credential);
                }
              }}
              onError={() => toast.error("Google login failed. Please try again.")}
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
          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full name</label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                required
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <Input
                id="email"
                type="email"
                placeholder="your@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="h-12 rounded-xl border-slate-200 bg-slate-50 text-slate-900 text-sm font-medium placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 focus:bg-white transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={signupMutation.isPending}
              className="w-full h-12 mt-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-900/8 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {signupMutation.isPending ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <>Create account <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-[11px] text-slate-400 font-medium mt-5 leading-relaxed">
            By creating an account you agree to our{' '}
            <Link to="/terms-of-service" className="text-slate-600 hover:text-slate-800 underline underline-offset-2 transition-colors">Terms</Link>
            {' '}and{' '}
            <Link to="/privacy-policy" className="text-slate-600 hover:text-slate-800 underline underline-offset-2 transition-colors">Privacy Policy</Link>.
          </p>

          <p className="text-center text-sm text-slate-500 font-medium mt-5">
            Already have an account?{' '}
            <Link
              to={`/auth/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`}
              className="text-teal-600 hover:text-teal-700 font-bold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
