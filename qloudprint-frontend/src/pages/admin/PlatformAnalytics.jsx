import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { BarChart3, IndianRupee, Loader2, Percent, RefreshCcw, Save, ShoppingBag, Store, Users } from "lucide-react";

import { getPlatformAnalytics, updatePlatformSettings } from "../../api/adminApi";
import { toast } from "../../utils/toastStore";

const colors = ["#06b6d4", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444", "#64748b"];

const PlatformAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [savingFee, setSavingFee] = useState(false);
    const [platformFeePercent, setPlatformFeePercent] = useState(10);

    const loadAnalytics = async () => {
        try {
            const response = await getPlatformAnalytics();
            setAnalytics(response.data);
            setPlatformFeePercent(response.data?.platformSettings?.platformFeePercent || 10);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAnalytics();
    }, []);

    const savePlatformFee = async () => {
        setSavingFee(true);

        try {
            await updatePlatformSettings({
                platformFeePercent: Number(platformFeePercent),
            });
            toast.success("Platform fee updated");
            loadAnalytics();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not update platform fee");
        } finally {
            setSavingFee(false);
        }
    };

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
    }

    const statusData = Object.entries(analytics?.statusCounts || {}).map(([name, value]) => ({ name, value }));
    const userData = [
        { name: "Customers", value: analytics?.customers || 0 },
        { name: "Shopkeepers", value: analytics?.shopkeepers || 0 },
    ];

    return (
        <div className="space-y-6">
            <section className="premium-panel p-6 lg:p-8">
                <div className="premium-chip">
                    <BarChart3 size={16} />
                    Platform analytics
                </div>
                <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">QloudPrint control room</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Users, shops, orders, revenue, and operational health in one place.</p>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric icon={<Users />} label="Total users" value={analytics?.totalUsers || 0} />
                <Metric icon={<Store />} label="Shops" value={analytics?.shops || 0} />
                <Metric icon={<ShoppingBag />} label="Orders" value={analytics?.orders || 0} />
                <Metric icon={<IndianRupee />} label="Revenue" value={`Rs ${Math.round(analytics?.revenue || 0)}`} />
                <Metric icon={<IndianRupee />} label="Platform earnings" value={`Rs ${Math.round(analytics?.platformEarnings || 0)}`} />
                <Metric icon={<IndianRupee />} label="Shop payouts" value={`Rs ${Math.round(analytics?.shopPayoutTotal || 0)}`} />
                <Metric icon={<RefreshCcw />} label="Refunded" value={`Rs ${Math.round(analytics?.refundedAmount || 0)}`} />
                <Metric icon={<ShoppingBag />} label="Cancelled" value={analytics?.cancelledOrders || 0} />
                <Metric icon={<ShoppingBag />} label="Pending payouts" value={analytics?.pendingPayouts || 0} />
                <Metric icon={<ShoppingBag />} label="Failed payouts" value={analytics?.failedPayouts || 0} />
                <Metric icon={<ShoppingBag />} label="Settled payouts" value={analytics?.manuallySettledPayouts || 0} />
                <Metric icon={<RefreshCcw />} label="Refund failures" value={analytics?.refundFailures || 0} />
                <Metric icon={<Percent />} label="Platform fee" value={`${analytics?.platformSettings?.platformFeePercent || 0}%`} />
            </div>

            <section className="premium-card p-5">
                <h2 className="text-xl font-black text-slate-950 dark:text-white">Platform fee control</h2>
                <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
                    <label className="block">
                        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Platform fee percentage</span>
                        <input
                            className="field-input mt-2"
                            type="number"
                            min="0"
                            max="50"
                            value={platformFeePercent}
                            onChange={(event) => setPlatformFeePercent(event.target.value)}
                        />
                    </label>
                    <button onClick={savePlatformFee} disabled={savingFee} className="premium-button self-end">
                        {savingFee ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save fee
                    </button>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard title="User mix">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie data={userData} dataKey="value" nameKey="name" outerRadius={110} label>
                                {userData.map((entry, index) => <Cell key={entry.name} fill={colors[index % colors.length]} />)}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Order status">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#06b6d4" radius={[12, 12, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>
        </div>
    );
};

const Metric = ({ icon, label, value }) => (
    <div className="premium-card p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40">{icon}</div>
        <p className="mt-4 text-3xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-sm font-bold text-slate-500">{label}</p>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="premium-card p-5">
        <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        {children}
    </div>
);

export default PlatformAnalytics;
