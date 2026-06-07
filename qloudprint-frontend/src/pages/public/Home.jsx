import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    ArrowRight,
    Clock3,
    IndianRupee,
    MapPin,
    Printer,
    QrCode,
    ShieldCheck,
    Sparkles,
    Star,
    Store
} from "lucide-react";

const Home = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");

        if (token && role) {
            navigate(role === "ADMIN" ? "/admin/analytics" : role === "SHOPKEEPER" ? "/shopkeeper/dashboard" : "/customer/dashboard");
        }
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-950 text-white">
            <header className="relative z-10 flex items-center justify-between px-6 lg:px-12 py-6">
                <button onClick={() => navigate("/")} className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">
                        <Printer size={24} />
                    </div>
                    <span className="text-2xl font-black tracking-tight">QloudPrint</span>
                </button>

                <div className="flex items-center gap-3">
                    <button onClick={() => navigate("/login")} className="rounded-2xl border border-white/15 px-5 py-3 font-semibold text-slate-200 hover:bg-white/10 transition">
                        Login
                    </button>
                    <button onClick={() => navigate("/register")} className="rounded-2xl bg-white px-5 py-3 font-black text-slate-950 hover:scale-105 transition">
                        Get Started
                    </button>
                </div>
            </header>

            <main>
                <section className="relative bg-[linear-gradient(135deg,#06283a_0%,#0f172a_46%,#020617_100%)] px-6 pb-16 pt-10 lg:px-12">
                    <div className="relative mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
                        <div className="animate-fade-in">
                            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100">
                                <Sparkles size={16} />
                                Multivendor print marketplace
                            </div>
                            <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.02] tracking-tight lg:text-7xl">
                                Find the best nearby print shop before you place the order.
                            </h1>
                            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                                Upload your PDF, compare local vendors by distance, waiting time, price, services, and ratings, then pay online and pick up with a secure QR code.
                            </p>
                            <div className="mt-9 flex flex-wrap gap-4">
                                <button onClick={() => navigate("/register")} className="inline-flex items-center gap-3 rounded-2xl bg-cyan-400 px-7 py-4 font-black text-slate-950 shadow-lg shadow-cyan-500/20 hover:scale-105 transition">
                                    Start printing
                                    <ArrowRight size={20} />
                                </button>
                                <button onClick={() => navigate("/register")} className="inline-flex items-center gap-3 rounded-2xl border border-white/15 px-7 py-4 font-bold text-white hover:bg-white/10 transition">
                                    Register a shop
                                    <Store size={20} />
                                </button>
                            </div>
                        </div>

                        <div className="grid gap-5 lg:relative lg:min-h-[520px]">
                            <div className="w-full rounded-[28px] border border-white/10 bg-white/10 p-4 shadow-2xl backdrop-blur-xl lg:absolute lg:left-0 lg:top-8 lg:w-[88%] lg:rounded-[32px] lg:p-5">
                                <div className="rounded-3xl bg-white p-5 text-slate-950">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-bold text-slate-500">Recommended</p>
                                            <h2 className="text-2xl font-black">Campus Print Hub</h2>
                                        </div>
                                        <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-black text-emerald-700">Best Value</div>
                                    </div>
                                    <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                                        <CardMetric icon={<MapPin size={18} />} label="Distance" value="0.8 km" />
                                        <CardMetric icon={<Clock3 size={18} />} label="Wait" value="9 min" />
                                        <CardMetric icon={<IndianRupee size={18} />} label="Price" value="Rs 46" />
                                    </div>
                                    <div className="mt-5 h-3 rounded-full bg-slate-100">
                                        <div className="h-full w-[92%] rounded-full bg-emerald-500" />
                                    </div>
                                </div>
                            </div>

                            <div className="w-full rounded-[28px] border border-white/10 bg-slate-900/90 p-5 shadow-2xl backdrop-blur-xl lg:absolute lg:bottom-10 lg:right-0 lg:w-[76%]">
                                <div className="grid grid-cols-2 gap-3">
                                    <Feature icon={<Store size={22} />} title="Vendor profiles" />
                                    <Feature icon={<QrCode size={22} />} title="QR pickup" />
                                    <Feature icon={<ShieldCheck size={22} />} title="Secure payment" />
                                    <Feature icon={<Star size={22} />} title="Ratings" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="relative z-10 mx-auto grid max-w-7xl gap-4 bg-slate-950 px-6 py-12 md:grid-cols-2 lg:grid-cols-4 lg:px-12">
                    <InfoCard icon={<MapPin />} title="Nearby search" text="Customers find open shops around them using shop latitude and longitude." />
                    <InfoCard icon={<Clock3 />} title="Live wait time" text="Queues are ranked with active order minutes and shop print speed." />
                    <InfoCard icon={<IndianRupee />} title="Value score" text="Recommendations balance price, rating, distance, and waiting time." />
                    <InfoCard icon={<Store />} title="Shop control" text="Vendors manage pricing, services, status, and their own queue." />
                </section>
            </main>
        </div>
    );
};

const CardMetric = ({ icon, label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-3">
        <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950 text-white">{icon}</div>
        <p className="mt-2 text-lg font-black">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
    </div>
);

const Feature = ({ icon, title }) => (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-cyan-300">{icon}</div>
        <p className="mt-3 font-black">{title}</p>
    </div>
);

const InfoCard = ({ icon, title, text }) => (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-400 text-slate-950">{icon}</div>
        <h3 className="mt-5 text-xl font-black">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-400">{text}</p>
    </div>
);

export default Home;
