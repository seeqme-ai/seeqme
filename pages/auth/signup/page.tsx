import { useState } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { Loader } from "lucide-react";
import { GoogleLogin } from '@react-oauth/google';
import apiClient from "@/services/apiService";

const signupUser = async ({ email, password, fullName }: any) => {
  const { data } = await apiClient.post(`/auth/register`, { email, password, fullName });
  return data;
};

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
      toast.success("Successfully Authenticated!");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Google Signup verification failed.");
    },
  });

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    signupMutation.mutate({ email, password, fullName });
  };

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="flex min-h-screen">
      {/* Left side: Auth Form */}
      <div className="flex-1 relative flex items-center justify-center z-10">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="w-full max-w-md"
        >
          <div className="absolute flex justify-center items-center left-4 top-4 font-bold"><img className="h-8 w-8" src="/seeqme-logo-black.png" /> Seeqme</div>
          <Card className="border-none shadow-none overflow-hidden">

            <CardHeader className="space-y-1 p-6">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text ">Create a Seeqme Account</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    verifyGoogleTokenMutation.mutate(credentialResponse.credential);
                  }
                }}
                onError={() => {
                  toast.error("Google login failed. Please try again.");
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

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-gray-600">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    autoFocus
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-gray-700 h-12 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
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
                    className=" border-gray-700 h-12 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-gray-600">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                     autoFocus
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-gray-700 h-12 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
                <Button type="submit" className="w-full text-white px-16 py-6 bg-teal-500 text-white hover:bg-teal-600 rounded-[30px] text-xs transition-all shadow-2xl" disabled={signupMutation.isPending}>
                  {signupMutation.isPending ? <Loader className="animate-spin" /> : "Sign Up"}
                </Button>
              </form>

              <div className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link to={`/auth/login${searchParams.get("redirect") ? `?redirect=${searchParams.get("redirect")}` : ''}`} className="text-teal-600 hover:underline">
                  Login
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