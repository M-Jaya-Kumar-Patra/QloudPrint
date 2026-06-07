import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BellRing, Clock3, Download, FileText, IndianRupee, Loader2, PackageCheck, Printer, Search } from "lucide-react";

import { getCustomerOrders } from "../../api/orderApi";
import stompClient from "../../services/websocket";
import { downloadDocument, openDocument } from "../../utils/downloads";

const CustomerDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [query, setQuery] = useState("");
    const location = useLocation();

    const fetchOrders = async () => {
        try {
            const response = await getCustomerOrders();
            setOrders(response.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        setQuery(new URLSearchParams(location.search).get("q") || "");
    }, [location.search]);

    useEffect(() => {
        stompClient.onConnect = () => {
            stompClient.subscribe("/topic/orders", (message) => {
                const updatedOrder = JSON.parse(message.body);

                setOrders((current) => current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
                setNotification(updatedOrder);
            });
        };

        if (!stompClient.active) {
            stompClient.activate();
        }
    }, []);

    const metrics = useMemo(() => {
        const active = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status));
        const spend = orders.reduce((total, order) => total + Number(order.totalCost || 0), 0);
        const wait = active.reduce((total, order) => total + Number(order.estimatedMinutes || 0), 0);
        const chart = orders.slice(-8).map((order) => ({ name: order.orderCode, amount: Number(order.totalCost || 0) }));

        return { active: active.length, spend, wait, chart, completed: orders.filter((order) => order.status === "COMPLETED").length };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const haystack = [order.orderCode, order.fileName, order.shop?.name, order.status, order.bindingType].join(" ").toLowerCase();
            return haystack.includes(query.toLowerCase());
        });
    }, [orders, query]);

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
    }

    return (
        <div className="space-y-6">
            {notification && (
                <div className="fixed right-6 top-24 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-3xl border border-cyan-200 bg-white p-5 shadow-2xl dark:border-cyan-900 dark:bg-slate-900">
                    <BellRing className="text-cyan-500" size={30} />
                    <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Order status updated</h3>
                    <p className="mt-1 text-sm text-slate-500">{notification.fileName} is now {notification.status}.</p>
                    <button onClick={() => setNotification(null)} className="premium-button secondary mt-4 w-full">Dismiss</button>
                </div>
            )}

            <section className="premium-panel p-6 lg:p-8">
                <div className="premium-chip">
                    <Printer size={16} />
                    Customer dashboard
                </div>
                <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Your printing command center</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Track active jobs, spending, waiting time, invoices, and pickup QR codes.</p>
                <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Search size={18} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search orders, shops, invoices"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                </label>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <Metric icon={<FileText />} label="Total orders" value={orders.length} />
                <Metric icon={<Clock3 />} label="Active wait" value={`${metrics.wait}m`} />
                <Metric icon={<IndianRupee />} label="Total spend" value={`Rs ${Math.round(metrics.spend)}`} />
                <Metric icon={<PackageCheck />} label="Completed" value={metrics.completed} />
            </div>

            <div className="premium-card p-5">
                <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">Recent spend</h2>
                <ResponsiveContainer width="100%" height={280}>
                    <AreaChart data={metrics.chart}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" hide />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="amount" stroke="#06b6d4" fill="#06b6d433" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="grid gap-4">
                {filteredOrders.slice(0, 5).map((order) => (
                    <div key={order.id} onClick={() => openDocument(order.fileUrl)} className="premium-card cursor-pointer p-5 transition hover:-translate-y-1">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <p className="text-sm font-bold text-cyan-500">{order.orderCode}</p>
                                <h2 className="text-xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                                <p className="text-sm text-slate-500">{order.shop?.name || "Selected shop"} • {order.bindingType || "NONE"}</p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">{order.status}</span>
                                <button onClick={(event) => { event.stopPropagation(); downloadDocument(order.fileUrl, order.fileName); }} className="premium-button secondary min-h-0 px-3 py-2 text-sm">
                                    <Download size={16} />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
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

export default CustomerDashboard;
