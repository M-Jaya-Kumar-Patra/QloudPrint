import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Clock3, Download, FileText, Loader2, ListOrdered, Search, TrendingUp } from "lucide-react";

import { getOptimizedQueue } from "../../api/orderApi";
import { downloadDocument, openDocument } from "../../utils/downloads";

const OptimizedQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const location = useLocation();

    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const response = await getOptimizedQueue();
                setOrders(response.data.filter((order) => !["COMPLETED", "CANCELLED"].includes(order.status)));
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        fetchQueue();
    }, []);

    useEffect(() => {
        setQuery(new URLSearchParams(location.search).get("q") || "");
    }, [location.search]);

    const filteredOrders = orders.filter((order) => {
        const haystack = [order.orderCode, order.fileName, order.user?.name, order.status, order.bindingType].join(" ").toLowerCase();
        return haystack.includes(query.toLowerCase());
    });

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
    }

    return (
        <div className="space-y-6">
            <section className="premium-panel p-6 lg:p-8">
                <div className="premium-chip">
                    <ListOrdered size={16} />
                    Smart queue optimizer
                </div>
                <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Optimized print queue</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Sorted by estimated effort, service complexity, and live workload.</p>
                <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Search size={18} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search active queue"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                </label>
            </section>

            <div className="grid gap-4">
                {filteredOrders.map((order, index) => (
                    <div key={order.id} onClick={() => openDocument(order.fileUrl)} className="premium-card cursor-pointer p-5 transition hover:-translate-y-1">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-4">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
                                    #{index + 1}
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                                    <p className="text-sm text-slate-500">{order.orderCode} • {order.bindingType || "NONE"} • {order.printSide || "SINGLE_SIDED"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-center sm:grid-cols-4">
                                <Mini icon={<FileText size={16} />} label="Pages" value={order.pageCount * order.copies} />
                                <Mini icon={<Clock3 size={16} />} label="ETA" value={`${order.estimatedMinutes}m`} />
                                <Mini icon={<TrendingUp size={16} />} label="Score" value={order.priorityScore} />
                                <button onClick={(event) => { event.stopPropagation(); downloadDocument(order.fileUrl, order.fileName); }} className="rounded-2xl bg-cyan-50 p-3 text-center font-black text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
                                    <Download className="mx-auto" size={18} />
                                    <span className="text-xs">Download</span>
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Mini = ({ icon, label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
        <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-xl bg-white text-cyan-500 dark:bg-slate-900">{icon}</div>
        <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs text-slate-500">{label}</p>
    </div>
);

export default OptimizedQueue;
