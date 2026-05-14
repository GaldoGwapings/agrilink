import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (error || !data.session) {
        navigate('/login?error=verification_failed');
        return;
      }
      const role = data.session.user.user_metadata?.role || 'farmer';
      navigate(role === 'buyer' ? '/buyer' : '/farmer');
    };
    handleCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <p className="text-green-800 font-semibold text-lg">Verifying your email...</p>
    </div>
  );
}