import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, MailCheck, RotateCcw } from "lucide-react";

import { resendVerificationOtp, verifyEmail } from "../../api/authApi";
import BrandLogo from "../../components/common/BrandLogo";
import ThemeToggle from "../../components/common/ThemeToggle";
import { toast } from "../../utils/toastStore";
import { PublicFooter } from "../public/PublicInfoPages";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: params.get("email") || "",
    otp: "",
  });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await verifyEmail(formData);
      toast.success("Email verified. You can login now.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!formData.email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      await resendVerificationOtp(formData.email);
      toast.success("OTP sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto flex max-w-5xl items-center justify-between">
        <BrandLogo />
        <ThemeToggle />
      </div>

      <form onSubmit={handleSubmit} className="premium-card mx-auto mt-12 max-w-lg space-y-5 p-7">
        <div className="premium-chip">
          <MailCheck size={16} />
          Email verification
        </div>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Verify your email</h1>
        <Input label="Email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
        <Input label="OTP" value={formData.otp} onChange={(event) => setFormData((current) => ({ ...current, otp: event.target.value }))} />
        <button disabled={loading || !formData.email || !formData.otp} className="premium-button w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <MailCheck size={18} />}
          Verify email
        </button>
        <button type="button" onClick={handleResend} className="premium-button secondary w-full">
          <RotateCcw size={18} />
          Resend OTP
        </button>
      </form>

      <div className="-mx-6 mt-12">
        <PublicFooter />
      </div>
    </div>
  );
};

const Input = ({ label, ...props }) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <input {...props} className="field-input mt-2" />
  </label>
);

export default VerifyEmail;
