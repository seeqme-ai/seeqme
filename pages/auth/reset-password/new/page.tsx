import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiService";


const verifyToken = async (token: string) => {
  const { data } = await apiClient.get(`/auth/verify-reset-token?token=${token}`);
  return data;
};

const resetPassword = async ({ token, newPassword }: any) => {
  const { data } = await apiClient.post(`/auth/reset-password`, { token, newPassword });
  return data;
};

function useURLQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function SetNewPasswordPage() {
  const navigate = useNavigate();
  const query = useURLQuery();
  const token = query.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: tokenData, isError, error } = useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () => verifyToken(token!),
    enabled: !!token,
  });

  const resetPasswordMutation = useMutation({
    mutationFn: resetPassword,
    onSuccess: () => {
      toast.success("Your password has been reset successfully!");
      navigate("/auth/login");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to reset password.");
    },
  });

  useEffect(() => {
    if (isError) {
      toast.error((error as any).response?.data?.error || "Invalid or expired password reset token.");
      navigate("/auth/login");
    }
  }, [isError, error, navigate]);

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    resetPasswordMutation.mutate({ token, newPassword: password });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  if (!tokenData) {
    return (
      <div className="flex items-center justify-center min-h-screen  p-4">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="w-full max-w-md"
        >
          <Card className="border-0 shadow-none  overflow-hidden">
            <CardHeader className="space-y-1 p-6 border-b border-gray-800">
              <CardTitle className="text-2xl font-bold text-center">Password Reset</CardTitle>
              <CardDescription className="text-center">Verifying token...</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-center">
              <Loader className="animate-spin text-teal-600 mx-auto mb-4" />
              <p className="text-xs">Please wait while we verify your token.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side: Auth Form */}
      <div className="flex-1 flex items-center justify-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="w-full max-w-md"
        >
          <Card className="shadow-none border-0 overflow-hidden">
            <CardHeader className="space-y-1 p-6">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text ">Set New Password</CardTitle>
              <CardDescription className="text-gray-400 text-center">Enter your new password</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <form onSubmit={handleResetPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-600">New Password</Label>
                  <PasswordInput
                    id="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-600">Confirm New Password</Label>
                  <PasswordInput
                    id="confirm-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-gray-700 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" className="w-full px-16 py-6 bg-teal-500 hover:bg-teal-600 text-slate-950 rounded-[30px] text-xs transition-all shadow-2xl" disabled={resetPasswordMutation.isPending}>
                  {resetPasswordMutation.isPending ? <Loader className="animate-spin" /> : "Set Password"}
                </Button>
              </form>
              <div className="text-center text-sm text-gray-400">
                <Link to="/auth/login" className="text-teal-600 hover:underline">
                  Back to Login
                </Link>
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
