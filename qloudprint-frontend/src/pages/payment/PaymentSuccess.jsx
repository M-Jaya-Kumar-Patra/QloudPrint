import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { CheckCircle2, Loader2, ReceiptText, XCircle } from "lucide-react";

import { verifyPayment } from "../../api/paymentApi";
import { createOrder } from "../../api/orderApi";
import { toast } from "../../utils/toastStore";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const hasVerified = useRef(false);
    const [createdOrders, setCreatedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (hasVerified.current) {
            return;
        }

        hasVerified.current = true;

        const verify = async () => {
            try {
                const params = new URLSearchParams(window.location.search);
                const orderId = params.get("order_id");
                const pendingOrder = JSON.parse(localStorage.getItem("pendingOrder"));

                if (!orderId) {
                    setErrorMessage("Payment reference missing. Please try again.");
                    toast.error("Payment reference missing");
                    return;
                }

                if (!pendingOrder) {
                    toast.error("Pending order missing");
                    navigate("/");
                    return;
                }

                const verifyResponse = await verifyPayment(orderId);

                if (!verifyResponse.data.success) {
                    setErrorMessage(verifyResponse.data.message || "Payment verification failed");
                    toast.error("Payment failed. No order was created.");
                    return;
                }

                const items = pendingOrder.items || [pendingOrder.tempFileData].filter(Boolean);
                const created = [];

                for (const item of items) {
                    const response = await createOrder({
                        paymentOrderId: orderId,
                        fileUrl: item.fileUrl,
                        fileName: item.fileName,
                        pageCount: item.pageCount,
                        copies: item.copies || pendingOrder.formData?.copies || 1,
                        colorPrint: item.colorPrint ?? pendingOrder.formData?.colorPrint ?? false,
                        paperSize: item.paperSize || pendingOrder.formData?.paperSize || "A4",
                        printSide: item.printSide || "SINGLE_SIDED",
                        bindingType: item.bindingType || "NONE",
                        specialInstructions: item.specialInstructions || "",
                        shopId: pendingOrder.selectedShop?.shop?.id,
                    });

                    created.push(response.data);
                }

                setCreatedOrders(created);
                localStorage.removeItem("pendingOrder");
                toast.success("Order placed and shop notified");
            } catch (error) {
                console.log(error);
                setErrorMessage(error.response?.data?.message || "Order creation failed");
                toast.error("Order creation failed");
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [navigate]);

    return (
        <div className="min-h-screen bg-slate-100 p-6 dark:bg-slate-950">
            <div className="mx-auto flex min-h-[80vh] max-w-4xl items-center justify-center">
                {loading ? (
                    <div className="premium-card p-10 text-center">
                        <Loader2 className="mx-auto animate-spin text-cyan-500" size={46} />
                        <h1 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">Verifying payment</h1>
                        <p className="mt-2 text-slate-500">Please wait while we create your print orders.</p>
                    </div>
                ) : errorMessage ? (
                    <div className="premium-card w-full max-w-xl p-8 text-center">
                        <XCircle className="mx-auto text-red-500" size={58} />
                        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Payment not completed</h1>
                        <p className="mt-2 text-slate-500">{errorMessage}</p>
                        <p className="mt-2 text-sm font-semibold text-slate-500">No print order has been created.</p>
                        <button onClick={() => navigate("/upload")} className="premium-button mt-8 w-full">
                            Return to order
                        </button>
                    </div>
                ) : (
                    <div className="premium-card w-full p-8">
                        <div className="text-center">
                            <CheckCircle2 className="mx-auto text-emerald-500" size={58} />
                            <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Orders confirmed</h1>
                            <p className="mt-2 text-slate-500">The shopkeeper has been notified in realtime.</p>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2">
                            {createdOrders.map((order) => (
                                <div key={order.id} className="rounded-3xl border border-slate-200 p-5 dark:border-slate-800">
                                    <div className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-sm font-bold text-slate-500">{order.shop?.name || "Selected shop"}</p>
                                            <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                                        </div>
                                        <ReceiptText className="text-cyan-500" />
                                    </div>
                                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                                        <Info label="Code" value={order.orderCode} />
                                        <Info label="Total" value={`Rs ${order.totalCost}`} />
                                        <Info label="ETA" value={`${order.estimatedMinutes} min`} />
                                        <Info label="Binding" value={order.bindingType || "NONE"} />
                                    </div>
                                    <div className="mt-5 flex justify-center">
                                        <QRCode value={order.orderCode} size={130} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button onClick={() => navigate("/customer/orders")} className="premium-button mt-8 w-full">
                            View orders and invoices
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const Info = ({ label, value }) => (
    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-xs font-bold text-slate-500">{label}</p>
        <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
    </div>
);

export default PaymentSuccess;
