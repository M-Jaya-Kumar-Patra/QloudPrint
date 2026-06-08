import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { KeyRound, Loader2, Send } from "lucide-react";

import { forgotPassword, resetPassword } from "../../api/authApi";
import BrandLogo from "../../components/common/BrandLogo";
import ThemeToggle from "../../components/common/ThemeToggle";
import { toast } from "../../utils/toastStore";
import { PublicFooter } from "../public/PublicInfoPages";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    newPassword: "",
  });

  const requestOtp = async () => {
    if (!formData.email) {
      toast.error("Enter your email first");
      return;
    }

    try {
      await forgotPassword(formData.email);
      toast.success("OTP sent");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not send OTP");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      await resetPassword(formData);
      toast.success("Password changed. Login with your new password.");
      navigate("/login");
    } catch (error) {
      toast.error(error.response?.data?.message || "Password reset failed");
    } finally {
      setLoading(false);
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
          <KeyRound size={16} />
          Account recovery
        </div>
        <h1 className="text-3xl font-black text-slate-950 dark:text-white">Reset password</h1>
        <Input label="Email" type="email" value={formData.email} onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))} />
        <button type="button" onClick={requestOtp} className="premium-button secondary w-full">
          <Send size={18} />
          Send OTP
        </button>
        <Input label="OTP" value={formData.otp} onChange={(event) => setFormData((current) => ({ ...current, otp: event.target.value }))} />
        <Input label="New password" type="password" value={formData.newPassword} onChange={(event) => setFormData((current) => ({ ...current, newPassword: event.target.value }))} />
        <button disabled={loading || !formData.email || !formData.otp || !formData.newPassword} className="premium-button w-full">
          {loading ? <Loader2 className="animate-spin" size={18} /> : <KeyRound size={18} />}
          Change password
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

export default ForgotPassword;
