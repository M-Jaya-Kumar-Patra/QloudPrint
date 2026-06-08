import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { QRCode } from "react-qr-code";
import { Download, ExternalLink, FileText, Loader2, Navigation, Phone, QrCode, ReceiptText, Search } from "lucide-react";

import { cancelCustomerOrder, getCustomerOrders, rateOrder } from "../../api/orderApi";
import { downloadDocument, downloadInvoicePdf, openDocument } from "../../utils/downloads";
import { toast } from "../../utils/toastStore";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const [ratingValue, setRatingValue] = useState(5);
  const [review, setReview] = useState("");
  const [query, setQuery] = useState("");
  const location = useLocation();

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setQuery(new URLSearchParams(location.search).get("q") || "");
  }, [location.search]);

  const fetchOrders = async () => {
    try {
      const response = await getCustomerOrders();
      setOrders(response.data);
      const unratedCompleted = response.data.find((order) => order.status === "COMPLETED" && !order.customerRating);
      if (unratedCompleted) {
        setRatingOrder(unratedCompleted);
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const submitRating = async () => {
    if (!ratingOrder) {
      return;
    }

    try {
      const response = await rateOrder(ratingOrder.id, {
        rating: Number(ratingValue),
        review,
      });

      setOrders((current) => current.map((order) => (order.id === ratingOrder.id ? response.data : order)));
      setRatingOrder(null);
      setReview("");
      setRatingValue(5);
      toast.success("Thanks for rating the shop");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not submit rating");
    }
  };

  const canCancel = (order) => ["PENDING", "PAYMENT_CONFIRMED", "QUEUED"].includes(order.status);

  const handleCancelOrder = async (event, order) => {
    event.stopPropagation();

    const reason = window.prompt("Why are you cancelling this order?");

    if (reason === null) {
      return;
    }

    try {
      const response = await cancelCustomerOrder(order.id, reason);
      setOrders((current) => current.map((item) => (item.id === order.id ? response.data : item)));
      toast.success("Order cancelled. Refund has been initiated.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Could not cancel order");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const haystack = [
      order.orderCode,
      order.fileName,
      order.shop?.name,
      order.status,
      order.bindingType,
    ].join(" ").toLowerCase();

    return haystack.includes(query.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-cyan-500" size={46} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="premium-panel p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="premium-chip">
              <ReceiptText size={16} />
              Orders and invoices
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Past print orders</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">Track status, download invoices, and use QR pickup codes.</p>
          </div>
          <div className="rounded-3xl bg-white/70 p-5 text-center dark:bg-slate-900/70">
            <p className="text-3xl font-black text-slate-950 dark:text-white">{orders.length}</p>
            <p className="text-sm font-bold text-slate-500">Total orders</p>
          </div>
        </div>
        <label className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-500 dark:border-slate-800 dark:bg-slate-900">
          <Search size={18} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by file, shop, status, or code"
            className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
          />
        </label>
      </section>

      {filteredOrders.length === 0 ? (
        <div className="premium-card p-12 text-center">
          <FileText className="mx-auto text-slate-300" size={54} />
          <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">{orders.length ? "No matching orders" : "No orders yet"}</h2>
          <p className="mt-2 text-slate-500">{orders.length ? "Try a different search." : "Create your first smart print order."}</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {filteredOrders.map((order) => (
            <div key={order.id} onClick={() => openDocument(order.fileUrl)} className="premium-card cursor-pointer p-5 transition hover:-translate-y-1">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-cyan-500">{order.orderCode}</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950 dark:text-white">{order.fileName}</h2>
                  <p className="mt-1 text-sm text-slate-500">{order.shop?.name || "Selected shop"}</p>
                </div>
                <Status status={order.status} />
              </div>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
                <Info label="Copies" value={order.copies} />
                <Info label="Pages" value={order.pageCount * order.copies} />
                <Info label="ETA" value={`${order.estimatedMinutes}m`} />
                <Info label="Total" value={`Rs ${order.totalCost}`} />
              </div>

              <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600 dark:bg-slate-950 dark:text-slate-300">
                <p><strong>Side:</strong> {order.printSide || "SINGLE_SIDED"}</p>
                <p><strong>Binding:</strong> {order.bindingType || "NONE"}</p>
                <p><strong>Instructions:</strong> {order.specialInstructions || "None"}</p>
                {order.refundStatus && <p><strong>Refund:</strong> {order.refundStatus} {order.refundAmount ? `(Rs ${order.refundAmount})` : ""}</p>}
                {order.refundFailureReason && <p className="text-red-500"><strong>Refund issue:</strong> {order.refundFailureReason}</p>}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button onClick={(event) => { event.stopPropagation(); setSelectedOrder(order); }} className="premium-button secondary flex-1">
                  <QrCode size={18} />
                  View QR
                </button>
                <button onClick={(event) => { event.stopPropagation(); downloadDocument(order.fileUrl, order.fileName); }} className="premium-button secondary flex-1">
                  <ExternalLink size={18} />
                  Download
                </button>
                {order.shop?.phone && (
                  <a href={`tel:${order.shop.phone}`} onClick={(event) => event.stopPropagation()} className="premium-button secondary flex-1">
                    <Phone size={18} />
                    Call
                  </a>
                )}
                {order.shop?.latitude && order.shop?.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${order.shop.latitude},${order.shop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="premium-button secondary flex-1"
                  >
                    <Navigation size={18} />
                    Map
                  </a>
                )}
                <button onClick={(event) => { event.stopPropagation(); downloadInvoicePdf(order); }} className="premium-button flex-1">
                  <Download size={18} />
                  Invoice
                </button>
                {order.status === "COMPLETED" && !order.customerRating && (
                  <button onClick={(event) => { event.stopPropagation(); setRatingOrder(order); }} className="premium-button success flex-1">
                    Rate shop
                  </button>
                )}
                {canCancel(order) && (
                  <button onClick={(event) => handleCancelOrder(event, order)} className="premium-button secondary flex-1 text-red-500">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="premium-card w-full max-w-sm p-7 text-center">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Pickup QR</h2>
            <div className="mt-5 flex justify-center rounded-3xl bg-white p-5">
              <QRCode value={selectedOrder.orderCode} size={180} />
            </div>
            <p className="mt-4 text-lg font-black text-slate-950 dark:text-white">{selectedOrder.orderCode}</p>
            <button onClick={() => setSelectedOrder(null)} className="premium-button mt-5 w-full secondary">
              Close
            </button>
          </div>
        </div>
      )}

      {ratingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur">
          <div className="premium-card w-full max-w-md p-7">
            <h2 className="text-2xl font-black text-slate-950 dark:text-white">Rate your shop experience</h2>
            <p className="mt-2 text-sm text-slate-500">{ratingOrder.shop?.name || "Selected shop"} - {ratingOrder.fileName}</p>
            <label className="mt-5 block">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Rating</span>
              <select value={ratingValue} onChange={(event) => setRatingValue(event.target.value)} className="field-input mt-2">
                <option value="5">5 - Excellent</option>
                <option value="4">4 - Good</option>
                <option value="3">3 - Average</option>
                <option value="2">2 - Poor</option>
                <option value="1">1 - Bad</option>
              </select>
            </label>
            <label className="mt-4 block">
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Review</span>
              <textarea value={review} onChange={(event) => setReview(event.target.value)} className="field-input mt-2 min-h-28" placeholder="Share your experience..." />
            </label>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button onClick={() => setRatingOrder(null)} className="premium-button secondary">Later</button>
              <button onClick={submitRating} className="premium-button success">Submit rating</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const Info = ({ label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
    <p className="text-xs font-bold text-slate-500">{label}</p>
    <p className="mt-1 font-black text-slate-950 dark:text-white">{value}</p>
  </div>
);

const Status = ({ status }) => (
  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300">
    {status}
  </span>
);

export default OrderHistory;
