import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, FileText, Loader2, QrCode, Search } from "lucide-react";

import { verifyQrOrder, updateOrderStatus } from "../../api/orderApi";
import { toast } from "../../utils/toastStore";

const ScanQr = () => {
    const [order, setOrder] = useState(null);
    const [manualCode, setManualCode] = useState("");
    const [checkingCode, setCheckingCode] = useState(false);

    useEffect(() => {
        if (order) {
            return undefined;
        }

        const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 }, false);

        scanner.render(
            async (decodedText) => {
                try {
                    const response = await verifyQrOrder(decodedText);
                    setOrder(response.data);
                    scanner.clear();
                } catch (error) {
                    console.log(error);
                    toast.error("Order not found");
                }
            },
            () => {},
        );

        return () => {
            scanner.clear().catch(() => {});
        };
    }, [order]);

    const markCompleted = async () => {
        try {
            await updateOrderStatus(order.id, { status: "COMPLETED" });
            toast.success("Order completed");
            setOrder(null);
        } catch (error) {
            console.log(error);
            toast.error("Could not update order");
        }
    };

    const verifyManualCode = async () => {
        if (!manualCode.trim()) {
            toast.error("Enter the QLD pickup code");
            return;
        }

        setCheckingCode(true);

        try {
            const response = await verifyQrOrder(manualCode.trim());
            setOrder(response.data);
            toast.success("Order verified");
        } catch (error) {
            console.log(error);
            toast.error("Order not found");
        } finally {
            setCheckingCode(false);
        }
    };

    return (
        <div className="space-y-6">
            <section className="premium-panel p-6 lg:p-8">
                <div className="premium-chip">
                    <QrCode size={16} />
                    Secure pickup
                </div>
                <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Scan pickup QR</h1>
                <p className="mt-2 text-slate-500 dark:text-slate-400">Verify customer pickup codes and complete orders instantly.</p>
            </section>

            <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
                <div className="premium-card p-5">
                    {!order && <div id="reader" className="overflow-hidden rounded-3xl" />}
                    {!order && (
                        <div className="mt-5 rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Or enter pickup code manually</p>
                            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                                <input
                                    value={manualCode}
                                    onChange={(event) => setManualCode(event.target.value)}
                                    placeholder="QLD-..."
                                    className="field-input"
                                />
                                <button onClick={verifyManualCode} disabled={checkingCode} className="premium-button">
                                    {checkingCode ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
                                    Verify
                                </button>
                            </div>
                        </div>
                    )}
                    {order && (
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto text-emerald-500" size={52} />
                            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Order verified</h2>
                            <p className="mt-2 text-slate-500">Ready to mark completed after pickup.</p>
                        </div>
                    )}
                </div>

                <div className="premium-card p-6">
                    {order ? (
                        <div className="space-y-5">
                            <div className="flex items-start gap-3">
                                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40">
                                    <FileText size={22} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-cyan-500">{order.orderCode}</p>
                                    <h2 className="text-2xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                                    <p className="text-sm text-slate-500">{order.user?.name || "Customer"}</p>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <Info label="Amount" value={`Rs ${order.totalCost}`} />
                                <Info label="Status" value={order.status} />
                                <Info label="Binding" value={order.bindingType || "NONE"} />
                                <Info label="Copies" value={order.copies} />
                            </div>
                            <button onClick={markCompleted} className="premium-button success w-full">
                                Mark completed
                            </button>
                        </div>
                    ) : (
                        <div className="flex min-h-72 flex-col items-center justify-center text-center">
                            <QrCode className="text-slate-300" size={54} />
                            <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Waiting for scan</h2>
                            <p className="mt-2 text-slate-500">Customer order details will appear here.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
);

export default ScanQr;
