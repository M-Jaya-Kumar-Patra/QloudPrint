import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { BellRing, Clock3, Download, FileText, IndianRupee, Loader2, PackageCheck, Printer, RefreshCcw, Search, X } from "lucide-react";

import { cancelShopkeeperOrder, getAllOrders, retryOrderPayout, updateOrderStatus } from "../../api/orderApi";
import { getMyShop } from "../../api/shopApi";
import stompClient from "../../services/websocket";
import { downloadDocument, openDocument } from "../../utils/downloads";

const statuses = ["PAYMENT_CONFIRMED", "QUEUED", "PRINTING", "READY_FOR_PICKUP", "COMPLETED", "CANCELLED"];

const ShopkeeperDashboard = () => {
    const [orders, setOrders] = useState([]);
    const [shop, setShop] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notification, setNotification] = useState(null);
    const [query, setQuery] = useState("");
    const location = useLocation();

    const fetchData = async () => {
        try {
            const [ordersResponse, shopResponse] = await Promise.all([getAllOrders(), getMyShop()]);
            setOrders(ordersResponse.data);
            setShop(shopResponse.data);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setQuery(new URLSearchParams(location.search).get("q") || "");
    }, [location.search]);

    useEffect(() => {
        if (!shop?.id) {
            return;
        }

        stompClient.onConnect = () => {
            stompClient.subscribe(`/topic/shop/${shop.id}/orders`, (message) => {
                const updatedOrder = JSON.parse(message.body);

                setOrders((current) => {
                    const exists = current.some((order) => order.id === updatedOrder.id);
                    return exists
                        ? current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
                        : [updatedOrder, ...current];
                });

                setNotification(updatedOrder);
            });
        };

        if (!stompClient.active) {
            stompClient.activate();
        }

        return () => {
            if (stompClient.active) {
                stompClient.deactivate();
            }
        };
    }, [shop?.id]);

    const handleStatusChange = async (orderId, status) => {
        try {
            await updateOrderStatus(orderId, { status });
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const handleRetryPayout = async (event, orderId) => {
        event.stopPropagation();

        try {
            await retryOrderPayout(orderId);
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const canCancel = (order) => ["PENDING", "PAYMENT_CONFIRMED", "QUEUED"].includes(order.status);

    const handleCancelOrder = async (event, order) => {
        event.stopPropagation();

        const reason = window.prompt("Reason for cancelling this order");

        if (reason === null) {
            return;
        }

        try {
            await cancelShopkeeperOrder(order.id, reason);
            fetchData();
        } catch (error) {
            console.log(error);
        }
    };

    const metrics = useMemo(() => {
        const active = orders.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status));
        const revenue = orders.filter((order) => order.status !== "CANCELLED").reduce((total, order) => total + Number(order.totalCost || 0), 0);
        const queueMinutes = active.reduce((total, order) => total + Number(order.estimatedMinutes || 0), 0);
        const completed = orders.filter((order) => order.status === "COMPLETED").length;
        const statusData = statuses.map((status) => ({ status: status.replaceAll("_", " "), count: orders.filter((order) => order.status === status).length }));
        const revenueData = orders.slice(-8).map((order) => ({ name: order.orderCode, revenue: Number(order.totalCost || 0) }));

        return { active: active.length, revenue, queueMinutes, completed, statusData, revenueData };
    }, [orders]);

    const filteredOrders = useMemo(() => {
        return orders.filter((order) => {
            const haystack = [order.orderCode, order.fileName, order.user?.name, order.status, order.bindingType].join(" ").toLowerCase();
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
                    <button onClick={() => setNotification(null)} className="absolute right-4 top-4 text-slate-400"><X size={18} /></button>
                    <BellRing className="text-cyan-500" size={30} />
                    <h3 className="mt-3 text-lg font-black text-slate-950 dark:text-white">Realtime order update</h3>
                    <p className="mt-1 text-sm text-slate-500">{notification.fileName} is now {notification.status}.</p>
                </div>
            )}

            <section className="premium-panel p-6 lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="premium-chip">
                            <Printer size={16} />
                            {shop?.name || "Shop setup pending"}
                        </div>
                        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Shop operations dashboard</h1>
                        <p className="mt-2 text-slate-500 dark:text-slate-400">Realtime queue, revenue, order stats, and status control.</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        <Metric label="Revenue" value={`Rs ${Math.round(metrics.revenue)}`} icon={<IndianRupee />} />
                        <Metric label="Active" value={metrics.active} icon={<Printer />} />
                        <Metric label="Queue" value={`${metrics.queueMinutes}m`} icon={<Clock3 />} />
                        <Metric label="Done" value={metrics.completed} icon={<PackageCheck />} />
                    </div>
                </div>
                <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Search size={18} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search orders, customers, status, or code"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                </label>
            </section>

            <div className="grid gap-6 xl:grid-cols-2">
                <ChartCard title="Revenue trend">
                    <ResponsiveContainer width="100%" height={260}>
                        <AreaChart data={metrics.revenueData}>
                            <defs>
                                <linearGradient id="revenue" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="name" hide />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="revenue" stroke="#06b6d4" fill="url(#revenue)" strokeWidth={3} />
                        </AreaChart>
                    </ResponsiveContainer>
                </ChartCard>

                <ChartCard title="Order status mix">
                    <ResponsiveContainer width="100%" height={260}>
                        <BarChart data={metrics.statusData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="status" hide />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#10b981" radius={[12, 12, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </ChartCard>
            </div>

            <section className="grid gap-4">
                {filteredOrders.map((order) => (
                    <div key={order.id} onClick={() => openDocument(order.fileUrl)} className="premium-card cursor-pointer p-5 transition hover:-translate-y-1">
                        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                            <div>
                                <div className="flex items-start gap-3">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40">
                                        <FileText size={22} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-cyan-500">{order.orderCode}</p>
                                        <h2 className="text-xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                                        <p className="text-sm text-slate-500">{order.user?.name || "Customer"} • {order.paperSize} • {order.bindingType || "NONE"}</p>
                                    </div>
                                </div>
                                <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                                    <p><strong>Instructions:</strong> {order.specialInstructions || "None"}</p>
                                    {order.status === "COMPLETED" && (
                                        <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
                                            <p><strong>Payout:</strong> {order.payoutStatus || "Not started"}</p>
                                            <p><strong>Shop payout:</strong> Rs {order.shopPayoutAmount || 0}</p>
                                            <p><strong>Platform fee:</strong> Rs {order.platformFee || 0}</p>
                                            {order.payoutFailureReason && <p className="text-red-500"><strong>Reason:</strong> {order.payoutFailureReason}</p>}
                                            {order.payoutStatus === "FAILED" && (
                                                <button type="button" onClick={(event) => handleRetryPayout(event, order.id)} className="premium-button secondary mt-3 min-h-0 px-3 py-2 text-sm">
                                                    <RefreshCcw size={16} />
                                                    Retry payout
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {order.refundStatus && (
                                        <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                                            <p><strong>Refund:</strong> {order.refundStatus} {order.refundAmount ? `(Rs ${order.refundAmount})` : ""}</p>
                                            {order.refundFailureReason && <p><strong>Issue:</strong> {order.refundFailureReason}</p>}
                                        </div>
                                    )}
                                    <button type="button" onClick={(event) => { event.stopPropagation(); openDocument(order.fileUrl); }} className="mt-2 inline-flex items-center gap-2 font-black text-cyan-600">Open document</button>
                                    <button type="button" onClick={(event) => { event.stopPropagation(); downloadDocument(order.fileUrl, order.fileName); }} className="ml-4 mt-2 inline-flex items-center gap-2 font-black text-cyan-600">
                                        <Download size={16} />
                                        Download
                                    </button>
                                </div>
                            </div>
                            <div className="lg:w-72">
                                <StatusPill status={order.status} />
                                <select onClick={(event) => event.stopPropagation()} onChange={(event) => handleStatusChange(order.id, event.target.value)} value={order.status} className="field-input mt-3">
                                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                                </select>
                                {canCancel(order) && (
                                    <button type="button" onClick={(event) => handleCancelOrder(event, order)} className="premium-button secondary mt-3 w-full text-red-500">
                                        Cancel and refund
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {!orders.length && (
                    <div className="premium-card p-12 text-center">
                        <PackageCheck className="mx-auto text-slate-300" size={52} />
                        <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">No orders yet</h2>
                        <p className="mt-2 text-slate-500">New paid orders will appear here with a popup notification.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const Metric = ({ icon, label, value }) => (
    <div className="rounded-3xl bg-white/70 p-4 shadow-sm dark:bg-slate-900/70">
        <div className="text-cyan-500">{icon}</div>
        <p className="mt-2 text-xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
);

const ChartCard = ({ title, children }) => (
    <div className="premium-card p-5">
        <h2 className="mb-4 text-xl font-black text-slate-950 dark:text-white">{title}</h2>
        {children}
    </div>
);

const StatusPill = ({ status }) => (
    <div className="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-center text-sm font-black text-cyan-700 dark:border-cyan-900 dark:bg-cyan-950/40 dark:text-cyan-300">
        {status}
    </div>
);

export default ShopkeeperDashboard;
