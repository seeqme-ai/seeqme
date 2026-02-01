import { useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Loader, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/apiService";


const verifyToken = async (token: string) => {
  const { data } = await apiClient.get(`/auth/verify-reset-token?token=${token}`);
  return data;
};

function useURLQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function VerifyResetTokenPage() {
  const navigate = useNavigate();
  const query = useURLQuery();
  const token = query.get("token");

  const { isSuccess, isError, error, isPending } = useQuery({
    queryKey: ["verifyToken", token],
    queryFn: () => verifyToken(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (isSuccess) {
      toast.success("Token verified. You can now set a new password.");
      navigate(`/auth/reset-password/new?token=${token}`);
    }
    if (isError) {
      toast.error((error as any).response?.data?.error || "Invalid or expired password reset token.");
    }
  }, [isSuccess, isError, error, navigate, token]);

  const cardVariants = {
    hidden: { opacity: 0, y: -50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

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
          <Card className="shadow-none border-0 rounded-xl overflow-hidden">
            <CardHeader className="space-y-1 p-6">
              <CardTitle className="text-2xl font-bold text-center bg-clip-text ">Password Reset</CardTitle>
              <CardDescription className="text-gray-400 text-center">Verifying your reset request</CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6 text-center">
              {isPending && (
                <div className="flex flex-col items-center">
                  <Loader className="animate-spin text-teal-600 mb-4" />
                  <p className="">Verifying token...</p>
                </div>
              )}
              {isSuccess && (
                <div className="flex flex-col items-center">
                  <CheckCircle className="h-12 w-12 text-teal-500 mb-4" />
                  <p className="">Token verified successfully!</p>
                  <Link to={`/auth/reset-password/new?token=${token}`} className="mt-4">
                    <Button className="w-full px-16 py-6 bg-teal-500 hover:bg-teal-600 text-slate-950 font-black rounded-[30px] text-xs  transition-all shadow-2xl">Set New Password</Button>
                  </Link>
                </div>
              )}
              {isError && (
                <div className="flex flex-col items-center">
                  <XCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-lg text-gray-300">Verification failed.</p>
                  <p className="text-sm text-gray-400">The reset link is invalid or has expired.</p>
                  <Link to="/auth/login" className="mt-4">
                    <Button variant="outline" className="w-full h-12 text-lg border-gray-700 text-gray-300 hover:bg-gray-800 transition-all">Back to Login</Button>
                  </Link>
                </div>
              )}
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