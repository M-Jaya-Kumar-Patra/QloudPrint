import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, UserPlus } from "lucide-react";

import { registerUser } from "../../api/authApi";
import { toast } from "../../utils/toastStore";
import BrandLogo from "../../components/common/BrandLogo";
import ThemeToggle from "../../components/common/ThemeToggle";

const roles = [
  { id: "CUSTOMER", label: "Customer" },
  { id: "SHOPKEEPER", label: "Shopkeeper" },
  { id: "ADMIN", label: "Admin" },
];

const Register = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "CUSTOMER" });

  const handleChange = (event) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    try {
      const response = await registerUser(formData);
      toast.success(response.data.message);
      navigate("/login");
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

      <div className="mx-auto mt-12 grid max-w-6xl gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <section className="premium-panel p-8 lg:p-10">
          <div className="premium-chip">Start smart printing</div>
          <h1 className="mt-5 text-5xl font-black text-slate-950 dark:text-white">Create your marketplace account.</h1>
          <p className="mt-4 max-w-xl text-slate-500 dark:text-slate-400">Register as a customer, vendor, or admin and get the right workspace immediately.</p>
        </section>

        <form onSubmit={handleSubmit} className="premium-card p-7 space-y-5">
          <h2 className="text-3xl font-black text-slate-950 dark:text-white">Register</h2>
          <Input name="name" label="Full name" value={formData.name} onChange={handleChange} />
          <Input type="email" name="email" label="Email" value={formData.email} onChange={handleChange} />
          <Input type="password" name="password" label="Password" value={formData.password} onChange={handleChange} />

          <div className="grid grid-cols-3 gap-3">
            {roles.map((role) => (
              <button
                key={role.id}
                type="button"
                onClick={() => setFormData((current) => ({ ...current, role: role.id }))}
                className={`rounded-2xl border p-3 text-sm font-black transition ${
                  formData.role === role.id
                    ? "border-cyan-500 bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300"
                    : "border-slate-200 text-slate-600 dark:border-slate-800 dark:text-slate-300"
                }`}
              >
                {role.label}
              </button>
            ))}
          </div>

          <button disabled={loading || !formData.email || !formData.password || !formData.name} className="premium-button w-full">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <UserPlus size={18} />}
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

export default Register;
