import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../../context/auth-context";
import { toast } from "sonner";
import { Loader } from "lucide-react";

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function AuthCallbackPage() {
  const navigate = useNavigate();
  const query = useQuery();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const token = query.get("token");
    if (token) {
      localStorage.setItem("token", token);
      checkAuth(token);
      toast.success("Logged in successfully with Google!");
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } else {
      toast.error("Google login failed. No token received.");
      navigate("/auth/login");
    }
  }, [query, navigate, checkAuth]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
     <Loader className="animate-spin" size={48} />
    </div>
  );
}