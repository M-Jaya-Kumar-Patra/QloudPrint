import { useEffect, useState } from "react";
import { KeyRound, Loader2, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { getMyProfile } from "../../api/authApi";
import { toast } from "../../utils/toastStore";

const AccountProfile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        setProfile(response.data.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel p-6 lg:p-8">
        <div className="premium-chip">
          <UserCircle size={16} />
          Profile
        </div>
        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Account settings</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">Manage your identity and password recovery.</p>
      </section>

      <section className="premium-card grid gap-4 p-6 md:grid-cols-2">
        <Info label="Name" value={profile?.name} />
        <Info label="Email" value={profile?.email} />
        <Info label="Role" value={profile?.role} />
      </section>

      <section className="premium-card grid gap-3 p-6">
        <button onClick={() => navigate("/forgot-password")} className="premium-button secondary">
          <KeyRound size={18} />
          Forgot password
        </button>
      </section>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
    <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
    <p className="mt-1 text-lg font-black text-slate-950 dark:text-white">{value || "Not added"}</p>
  </div>
);

export default AccountProfile;
