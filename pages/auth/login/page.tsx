import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useAuth } from "../../../context/auth-context";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
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

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      login(email, password);
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
      toast.success("Successfully Authenticated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Google Login verification failed.");
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

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex relative min-h-screen ">
      {/* Left side: Auth Form */}
      <div className="flex-1 flex items-center justify-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="w-full max-w-md"
        >
        <div className="absolute flex justify-center items-center left-4 top-4 font-bold"><img className="h-8 w-8" src="/seeqme-logo-black.png" /> Seeqme</div>
          <Card className="border-none shadow-none  overflow-hidden">
            <CardHeader className="space-y-1 p-6">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text ">Welcome Back</CardTitle>
              <CardDescription className="text-gray-400 text-center">Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    verifyGoogleTokenMutation.mutate(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  toast.error('Google Login Failed');
                }}
              />

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-black px-2 text-gray-400">
                    Or continue with
                  </span>
                </div>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-600">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@example.com"
                    required
                     autoFocus
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-gray-700 h-12  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-600">Password</Label>
                  <PasswordInput
                    id="password"
                    required
                     autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-700 h-12  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" className="w-full text-white px-16 py-6 bg-teal-500 hover:bg-teal-600 rounded-[30px] text-xs transition-all shadow-2xl" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? <Loader className="animate-spin" /> : "Login"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                Don't have an account?{" "}
                <Link to="/auth/signup" className="text-teal-600 hover:underline">
                  Sign up
                </Link>
              </div>
              <div className="text-center text-sm">
                <Dialog open={isForgotPasswordModalOpen} onOpenChange={setIsForgotPasswordModalOpen}>
                  <DialogTrigger asChild>
                    <Button variant="link" className="text-teal-600 hover:underline p-0 h-auto">Forgot Password?</Button>
                  </DialogTrigger>
                  <DialogContent className="border-gray-800 bg-white rounded-lg p-6">
                    <DialogHeader>
                      <DialogTitle className="text-2xl font-bold text-center">Reset Password</DialogTitle>
                      <DialogDescription className="text-gray-600 text-center">Enter your email to receive a password reset link.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleForgotPassword} className="space-y-4 py-4">
                      <Label htmlFor="forgot-email" className="text-gray-600 mb-2">Email</Label>
                      <Input
                        id="forgot-email"
                        type="email"
                        placeholder="your@gmail.com"
                        required
                        value={forgotPasswordEmail}
                        onChange={(e) => setForgotPasswordEmail(e.target.value)}
                        className="border-gray-700 h-12  placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                      />
                      <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button type="submit" className="w-full px-16 py-6 bg-teal-500 hover:bg-teal-600 text-white rounded-[30px] text-xs  transition-all shadow-2xl" disabled={forgotPasswordMutation.isPending}>
                          {forgotPasswordMutation.isPending ? <Loader className="animate-spin" /> : "Send Reset Link"}
                        </Button>

                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Right side: Image */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.2 } }}
        className="hidden lg:flex relative flex-1 items-center justify-center p-8 bg-black"
      >
        <img
          src="/sideImg.jpg"
          alt="Login Illustration"
          className="absolute inset-0 w-full h-full object-cover opacity-70"
        />

        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black to-transparent z-10"></div> {/* Black overlay at bottom */}

        <div className="relative z-20 text-white text-center flex flex-col items-center justify-center p-8">
          <img src='/seeqme-logo-white.png' className="w-20" alt='SEEQME LOGO' />
          <h2 className="text-3xl font-bold mb-4">GET SEEN, GET HIRED</h2>

        </div>
      </motion.div>
    </div>
  );
}