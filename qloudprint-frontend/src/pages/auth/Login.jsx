import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogIn } from "lucide-react";

import { AuthContext } from "../../context/AuthContext";
import { loginUser } from "../../api/authApi";
import { toast } from "../../utils/toastStore";
import BrandLogo from "../../components/common/BrandLogo";
import ThemeToggle from "../../components/common/ThemeToggle";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (params.get("session") === "expired" || sessionStorage.getItem("sessionExpired") === "true") {
      toast.warning("Session expired. Please login again.");
      sessionStorage.removeItem("sessionExpired");
    }
  }, []);

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await loginUser(formData);
      const token = response.data.data.token;
      const role = response.data.data.role;

      login(token);
      localStorage.setItem("role", role);
      toast.success("Login successful");

      navigate(role === "ADMIN" ? "/admin/analytics" : role === "SHOPKEEPER" ? "/shopkeeper/dashboard" : "/customer/dashboard");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <BrandLogo />
        <ThemeToggle />
      </div>

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.85fr] lg:items-center">
        <section className="premium-panel p-8 lg:p-10">
          <div className="premium-chip">Secure access</div>
          <h1 className="mt-5 text-5xl font-black text-slate-950 dark:text-white">Welcome back to QloudPrint.</h1>
          <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">Customers, shopkeepers, and admins get a dedicated workspace after login.</p>
        </section>

        <form onSubmit={handleSubmit} className="premium-card p-7 space-y-5">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Login</h2>
          <Input type="email" name="email" label="Email" value={formData.email} onChange={handleChange} />
          <Input type="password" name="password" label="Password" value={formData.password} onChange={handleChange} />
          <button disabled={loading || !formData.email || !formData.password} className="premium-button w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <LogIn size={18} />}
            Login
          </button>
          <button type="button" onClick={() => navigate("/register")} className="premium-button secondary w-full">
            Create account
          </button>
        </form>
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

export default Login;
