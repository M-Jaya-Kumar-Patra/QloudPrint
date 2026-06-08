import { useEffect, useMemo, useState } from "react";
import { Banknote, CheckCircle2, IndianRupee, Loader2, RefreshCcw, Search } from "lucide-react";

import { getAdminPayouts, settleAdminPayout } from "../../api/adminApi";
import { toast } from "../../utils/toastStore";

const paymentModes = ["UPI", "BANK_TRANSFER", "CASH"];

const ManualPayouts = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settlingId, setSettlingId] = useState(null);
    const [query, setQuery] = useState("");
    const [forms, setForms] = useState({});

    const loadPayouts = async () => {
        setLoading(true);

        try {
            const response = await getAdminPayouts();
            setOrders(response.data || []);
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not load payouts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPayouts();
    }, []);

    const filteredOrders = useMemo(() => {
        const needle = query.toLowerCase();

        return orders.filter((order) => {
            const shop = order.shop || {};
            const haystack = [
                order.orderCode,
                order.fileName,
                order.payoutStatus,
                shop.name,
                shop.phone,
                shop.upiId,
                shop.bankIfsc,
                shop.bankAccountHolder,
            ].join(" ").toLowerCase();

            return haystack.includes(needle);
        });
    }, [orders, query]);

    const totals = useMemo(() => {
        return orders.reduce(
            (summary, order) => {
                const payout = Number(order.shopPayoutAmount || 0);

                if (order.payoutStatus === "MANUALLY_SETTLED") {
                    return {
                        ...summary,
                        settled: summary.settled + payout,
                    };
                }

                return {
                    ...summary,
                    pending: summary.pending + payout,
                    pendingCount: summary.pendingCount + 1,
                };
            },
            { pending: 0, settled: 0, pendingCount: 0 }
        );
    }, [orders]);

    const updateForm = (orderId, patch) => {
        setForms((current) => ({
            ...current,
            [orderId]: {
                paymentMode: "UPI",
                referenceId: "",
                note: "",
                ...(current[orderId] || {}),
                ...patch,
            },
        }));
    };

    const settleOrder = async (order) => {
        const form = forms[order.id] || { paymentMode: "UPI", referenceId: "", note: "" };

        if (!form.referenceId.trim()) {
            toast.error("Enter transaction reference ID");
            return;
        }

        setSettlingId(order.id);

        try {
            await settleAdminPayout(order.id, {
                paymentMode: form.paymentMode,
                referenceId: form.referenceId.trim(),
                note: form.note,
            });
            toast.success("Payout marked as paid");
            loadPayouts();
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not settle payout");
        } finally {
            setSettlingId(null);
        }
    };

    if (loading) {
        return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
    }

    return (
        <div className="space-y-6">
            <section className="premium-panel p-6 lg:p-8">
                <div className="premium-chip">
                    <Banknote size={16} />
                    Manual settlement
                </div>
                <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Shopkeeper payout desk</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">
                    Pay shopkeepers manually by UPI, bank transfer, or cash, then save the transaction reference here.
                </p>

                <div className="mt-6 grid gap-3 md:grid-cols-3">
                    <Metric label="Pending amount" value={`Rs ${Math.round(totals.pending)}`} />
                    <Metric label="Pending payouts" value={totals.pendingCount} />
                    <Metric label="Settled amount" value={`Rs ${Math.round(totals.settled)}`} />
                </div>

                <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
                    <Search size={18} />
                    <input
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder="Search shop, code, phone, UPI, IFSC"
                        className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
                    />
                </label>
            </section>

            <section className="grid gap-4">
                {filteredOrders.map((order) => {
                    const shop = order.shop || {};
                    const settled = order.payoutStatus === "MANUALLY_SETTLED";
                    const form = forms[order.id] || { paymentMode: "UPI", referenceId: "", note: "" };

                    return (
                        <div key={order.id} className="premium-card p-5">
                            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                                <div>
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <p className="text-sm font-black text-cyan-600 dark:text-cyan-300">{order.orderCode}</p>
                                            <h2 className="text-2xl font-black text-slate-950 dark:text-white">{shop.name || "Shop"}</h2>
                                            <p className="text-sm text-slate-500">{order.fileName}</p>
                                        </div>
                                        <span className={`rounded-full px-3 py-1 text-xs font-black ${settled ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300" : "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300"}`}>
                                            {order.payoutStatus || "NOT_STARTED"}
                                        </span>
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-3">
                                        <Info label="Order amount" value={`Rs ${Math.round(order.totalCost || 0)}`} />
                                        <Info label="Platform fee" value={`Rs ${Math.round(order.platformFee || 0)}`} />
                                        <Info label="Pay shopkeeper" value={`Rs ${Math.round(order.shopPayoutAmount || 0)}`} strong />
                                    </div>

                                    <div className="mt-5 grid gap-3 md:grid-cols-2">
                                        <Info label="Phone" value={shop.phone || "Not added"} />
                                        <Info label="UPI ID" value={shop.upiId || "Not added"} />
                                        <Info label="Account holder" value={shop.bankAccountHolder || "Not added"} />
                                        <Info label="Account number" value={shop.bankAccountNumber || "Not added"} />
                                        <Info label="IFSC" value={shop.bankIfsc || "Not added"} />
                                        <Info label="Address" value={shop.address || "Not added"} />
                                    </div>

                                    {settled && (
                                        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
                                            <p><strong>Paid by:</strong> {order.manualPayoutMode}</p>
                                            <p><strong>Reference:</strong> {order.manualPayoutReferenceId}</p>
                                            <p><strong>Settled at:</strong> {order.manualPayoutSettledAt ? new Date(order.manualPayoutSettledAt).toLocaleString() : "Recorded"}</p>
                                            {order.manualPayoutNote && <p><strong>Note:</strong> {order.manualPayoutNote}</p>}
                                        </div>
                                    )}
                                </div>

                                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                                    <h3 className="flex items-center gap-2 text-lg font-black text-slate-950 dark:text-white">
                                        <IndianRupee size={18} />
                                        Settlement entry
                                    </h3>
                                    <div className="mt-4 space-y-3">
                                        <label className="block">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Payment mode</span>
                                            <select
                                                disabled={settled}
                                                value={form.paymentMode}
                                                onChange={(event) => updateForm(order.id, { paymentMode: event.target.value })}
                                                className="field-input mt-2"
                                            >
                                                {paymentModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
                                            </select>
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Transaction reference</span>
                                            <input
                                                disabled={settled}
                                                value={settled ? order.manualPayoutReferenceId || "" : form.referenceId}
                                                onChange={(event) => updateForm(order.id, { referenceId: event.target.value })}
                                                className="field-input mt-2"
                                                placeholder="UPI ref / bank UTR / cash receipt"
                                            />
                                        </label>
                                        <label className="block">
                                            <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Note</span>
                                            <textarea
                                                disabled={settled}
                                                value={settled ? order.manualPayoutNote || "" : form.note}
                                                onChange={(event) => updateForm(order.id, { note: event.target.value })}
                                                className="field-input mt-2 min-h-24"
                                                placeholder="Optional settlement note"
                                            />
                                        </label>
                                        <button
                                            type="button"
                                            disabled={settled || settlingId === order.id}
                                            onClick={() => settleOrder(order)}
                                            className="premium-button w-full"
                                        >
                                            {settlingId === order.id ? <Loader2 className="animate-spin" size={18} /> : settled ? <CheckCircle2 size={18} /> : <Banknote size={18} />}
                                            {settled ? "Already paid" : "Mark payout paid"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {!filteredOrders.length && (
                    <div className="premium-card p-12 text-center">
                        <CheckCircle2 className="mx-auto text-emerald-400" size={54} />
                        <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">No payouts found</h2>
                        <p className="mt-2 text-slate-500">Completed order settlements will appear here.</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const Metric = ({ label, value }) => (
    <div className="rounded-3xl bg-white/70 p-4 shadow-sm dark:bg-slate-900/70">
        <p className="text-2xl font-black text-slate-950 dark:text-white">{value}</p>
        <p className="text-xs font-bold text-slate-500">{label}</p>
    </div>
);

const Info = ({ label, value, strong = false }) => (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className={`mt-1 break-words ${strong ? "text-lg font-black text-cyan-600 dark:text-cyan-300" : "font-black text-slate-950 dark:text-white"}`}>{value}</p>
    </div>
);

export default ManualPayouts;
