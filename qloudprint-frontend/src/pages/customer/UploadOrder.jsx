import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Check,
  Clock3,
  Phone,
  Eye,
  FileText,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  Paperclip,
  Sparkles,
  Store,
  UploadCloud
} from "lucide-react";

import { createPaymentOrder } from "../../api/paymentApi";
import { tempUpload } from "../../api/orderApi";
import { getShopRecommendations } from "../../api/shopApi";
import { toast } from "../../utils/toastStore";

const bindingOptions = [
  { id: "NONE", label: "No binding", sample: "bg-slate-100" },
  { id: "STAPLE", label: "Staple", sample: "bg-gradient-to-br from-slate-200 to-slate-400" },
  { id: "SPIRAL", label: "Spiral", sample: "bg-[repeating-linear-gradient(90deg,#0f172a_0_5px,#e2e8f0_5px_12px)]" },
  { id: "STICK_FILE", label: "Stick file", sample: "bg-gradient-to-r from-amber-200 via-white to-amber-500" },
  { id: "SOFT_BINDING", label: "Soft binding", sample: "bg-gradient-to-br from-cyan-100 to-blue-300" },
  { id: "HARD_BINDING", label: "Hard binding", sample: "bg-gradient-to-br from-stone-800 to-stone-500" },
];

const UploadOrder = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [location, setLocation] = useState({ latitude: "", longitude: "" });
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [loadingUpload, setLoadingUpload] = useState(false);
  const [findingShops, setFindingShops] = useState(false);
  const [paying, setPaying] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const activeItem = items.find((item) => item.id === activeId) || items[0];

  const totals = useMemo(() => {
    return items.reduce(
      (summary, item) => {
        const pages = Number(item.pageCount || 0) * Number(item.copies || 1);
        const basePagePrice = item.colorPrint ? 5 : 2;
        const sideExtra = item.printSide === "DOUBLE_SIDED" ? 0.5 : 0;
        const bindingCost = bindingPrice(item.bindingType);
        const cost = pages * (basePagePrice + sideExtra) + bindingCost;

        return {
          pages: summary.pages + pages,
          cost: summary.cost + cost,
          minutes: summary.minutes + Math.max(1, Math.ceil(pages / 10)),
        };
      },
      { pages: 0, cost: 0, minutes: 0 },
    );
  }, [items]);

  const updateItem = (id, patch) => {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, ...patch } : item)));
    setShops([]);
    setSelectedShop(null);
  };

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);

    if (!files.length) {
      return;
    }

    setLoadingUpload(true);

    try {
      const uploaded = [];

      for (const file of files) {
        const data = new FormData();
        data.append("file", file);

        const response = await tempUpload(data);

        uploaded.push({
          id: `${Date.now()}-${file.name}`,
          fileUrl: response.data.fileUrl,
          fileName: response.data.fileName,
          pageCount: response.data.pageCount,
          copies: 1,
          paperSize: "A4",
          printSide: "SINGLE_SIDED",
          colorPrint: false,
          bindingType: "NONE",
          specialInstructions: "",
        });
      }

      setItems((current) => [...current, ...uploaded]);
      setActiveId(uploaded[0]?.id);
      toast.success(`${uploaded.length} file added`);
    } catch (error) {
      console.log(error);
      toast.error("Upload failed");
    } finally {
      setLoadingUpload(false);
    }
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Location is not available in this browser");
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: Number(position.coords.latitude.toFixed(6)),
          longitude: Number(position.coords.longitude.toFixed(6)),
        });
        setIsLocating(false);
        toast.success("Location added");
      },
      () => {
        setIsLocating(false);
        toast.error("Could not access location");
      },
    );
  };

  const handleFindShops = async () => {
    if (!items.length) {
      toast.error("Upload at least one PDF");
      return;
    }

    if (!location.latitude || !location.longitude) {
      toast.error("Enter your location or use GPS first");
      return;
    }

    setFindingShops(true);

    try {
      const response = await getShopRecommendations({
        latitude: Number(location.latitude),
        longitude: Number(location.longitude),
        pageCount: Math.max(1, totals.pages),
        copies: 1,
        colorPrint: items.some((item) => item.colorPrint),
      });

      setShops(response.data);
      setSelectedShop(response.data[0] || null);
      toast.success(response.data.length ? "Shops ranked live" : "No matching open shops found");
    } catch (error) {
      console.log(error);
      toast.error("Could not find shops");
    } finally {
      setFindingShops(false);
    }
  };

  const vendorTotal = useMemo(() => {
    if (!selectedShop) {
      return totals.cost;
    }

    return items.reduce((total, item) => {
      const shop = selectedShop.shop;
      const pages = Number(item.pageCount || 0) * Number(item.copies || 1);
      const pagePrice = item.colorPrint ? shop.colorPricePerPage : shop.bwPricePerPage;
      const sideExtra = item.printSide === "DOUBLE_SIDED" ? shop.duplexPricePerPage || 0.5 : 0;
      const cost = pages * (Number(pagePrice || 0) + Number(sideExtra || 0)) + shopBindingPrice(shop, item.bindingType);

      return total + cost;
    }, 0);
  }, [items, selectedShop, totals.cost]);

  const handlePayment = async () => {
    if (!selectedShop || !items.length) {
      toast.error("Select a shop first");
      return;
    }

    if (!window.Razorpay) {
      toast.error("Razorpay checkout is still loading. Please try again.");
      return;
    }

    setPaying(true);

    try {
      const response = await createPaymentOrder({
        amount: vendorTotal,
        customerName: "QloudPrint Customer",
        customerEmail: "customer@qloudprint.local",
      });

      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          items,
          selectedShop,
          estimate: {
            totalPages: totals.pages,
            totalCost: vendorTotal,
            estimatedMinutes: selectedShop.waitingMinutes,
          },
        }),
      );

      const paymentOrder = response.data;

      const razorpay = new window.Razorpay({
        key: paymentOrder.key_id,
        amount: paymentOrder.amount,
        currency: paymentOrder.currency || "INR",
        name: "QloudPrint",
        description: "Print order payment",
        order_id: paymentOrder.id,
        prefill: {
          name: "QloudPrint Customer",
          email: "customer@qloudprint.local",
        },
        theme: {
          color: "#22d3ee",
        },
        handler: (paymentResponse) => {
          const params = new URLSearchParams({
            razorpay_order_id: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
          });

          navigate(`/payment-success?${params.toString()}`);
        },
        modal: {
          ondismiss: () => {
            setPaying(false);
            toast.error("Payment was not completed");
          },
        },
      });

      razorpay.open();
    } catch (error) {
      console.log(error);
      toast.error("Payment failed");
      setPaying(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="premium-panel p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="premium-chip">
              <Sparkles size={16} />
              Multi-file smart order
            </div>
            <h1 className="mt-4 text-3xl lg:text-5xl font-black text-slate-950 dark:text-white">
              Build a print order with item-level control.
            </h1>
            <p className="mt-3 max-w-3xl text-slate-500 dark:text-slate-400">
              Upload multiple PDFs, preview files, set separate print specs, compare vendors, and pay only after the best shop is selected.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Metric label="Files" value={items.length} />
            <Metric label="Pages" value={totals.pages} />
            <Metric label="Estimate" value={`Rs ${Math.round(vendorTotal)}`} />
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[0.42fr_0.58fr]">
        <section className="premium-card p-5">
          <label className="flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 text-center transition hover:border-cyan-500 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-cyan-400">
            {loadingUpload ? <Loader2 className="animate-spin text-cyan-500" size={44} /> : <UploadCloud className="text-cyan-500" size={44} />}
            <span className="mt-4 text-lg font-black text-slate-950 dark:text-white">Upload PDF files</span>
            <span className="text-sm text-slate-500">Select one or many files</span>
            <input type="file" accept=".pdf" multiple onChange={handleFiles} disabled={loadingUpload} className="hidden" />
          </label>

          <div className="mt-5 space-y-3">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveId(item.id)}
                className={`w-full rounded-2xl border p-4 text-left transition ${
                  activeItem?.id === item.id
                    ? "border-cyan-400 bg-cyan-50 dark:bg-cyan-950/30"
                    : "border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950"
                }`}
              >
                <div className="flex items-start gap-3">
                  <FileText className="mt-1 text-cyan-500" size={20} />
                  <div className="min-w-0">
                    <p className="truncate font-black text-slate-950 dark:text-white">{item.fileName}</p>
                    <p className="text-sm text-slate-500">{item.pageCount} pages • {item.copies} copies</p>
                  </div>
                </div>
              </button>
            ))}

            {!items.length && (
              <div className="rounded-2xl border border-slate-200 p-5 text-center text-slate-500 dark:border-slate-800">
                Uploaded files will appear here.
              </div>
            )}
          </div>
        </section>

        <section className="premium-card p-5">
          {activeItem ? (
            <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
              <div>
                <div className="mb-3 flex items-center gap-2 font-black text-slate-950 dark:text-white">
                  <Eye size={18} />
                  File preview
                </div>
                <iframe
                  title={activeItem.fileName}
                  src={activeItem.fileUrl}
                  className="h-[460px] w-full rounded-3xl border border-slate-200 bg-slate-100 dark:border-slate-800"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-950 dark:text-white">{activeItem.fileName}</h2>
                  <p className="text-sm text-slate-500">Configure this document individually.</p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Field label="Copies">
                    <input className="field-input" type="number" min="1" value={activeItem.copies} onChange={(event) => updateItem(activeItem.id, { copies: event.target.value })} />
                  </Field>
                  <Field label="Paper size">
                    <select className="field-input" value={activeItem.paperSize} onChange={(event) => updateItem(activeItem.id, { paperSize: event.target.value })}>
                      <option>A4</option>
                      <option>A3</option>
                      <option>Letter</option>
                      <option>Legal</option>
                    </select>
                  </Field>
                  <Field label="Print side">
                    <select className="field-input" value={activeItem.printSide} onChange={(event) => updateItem(activeItem.id, { printSide: event.target.value })}>
                      <option value="SINGLE_SIDED">Single sided</option>
                      <option value="DOUBLE_SIDED">Double sided</option>
                    </select>
                  </Field>
                  <label className="mt-6 flex items-center justify-between rounded-2xl border border-slate-200 p-4 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-200">
                    Color print
                    <input type="checkbox" checked={activeItem.colorPrint} onChange={(event) => updateItem(activeItem.id, { colorPrint: event.target.checked })} className="h-5 w-5 accent-cyan-500" />
                  </label>
                </div>

                <div>
                  <p className="mb-3 text-sm font-bold text-slate-600 dark:text-slate-300">Binding</p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
                    {bindingOptions.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => updateItem(activeItem.id, { bindingType: option.id })}
                        className={`rounded-2xl border p-3 text-left transition ${
                          activeItem.bindingType === option.id
                            ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30"
                            : "border-slate-200 dark:border-slate-800"
                        }`}
                      >
                        <div className={`h-16 rounded-xl ${option.sample}`} />
                        <div className="mt-2 flex items-center justify-between text-sm font-black text-slate-950 dark:text-white">
                          {option.label}
                          {activeItem.bindingType === option.id && <Check size={16} className="text-cyan-500" />}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Extra printing instructions">
                  <textarea
                    className="field-input min-h-28"
                    value={activeItem.specialInstructions}
                    onChange={(event) => updateItem(activeItem.id, { specialInstructions: event.target.value })}
                    placeholder="Example: print pages 1-5 only, keep first page color, call before printing..."
                  />
                </Field>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[520px] flex-col items-center justify-center text-center">
              <Paperclip className="text-slate-300" size={54} />
              <h2 className="mt-4 text-2xl font-black text-slate-950 dark:text-white">Upload a PDF to begin</h2>
              <p className="mt-2 text-slate-500">Preview and print options appear here.</p>
            </div>
          )}
        </section>
      </div>

      <section className="premium-card p-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
          <Field label="Customer latitude">
            <input className="field-input" value={location.latitude} placeholder="Enter latitude or use GPS" onChange={(event) => setLocation((current) => ({ ...current, latitude: event.target.value }))} />
          </Field>
          <Field label="Customer longitude">
            <input className="field-input" value={location.longitude} placeholder="Enter longitude or use GPS" onChange={(event) => setLocation((current) => ({ ...current, longitude: event.target.value }))} />
          </Field>
          <button onClick={handleUseLocation} disabled={isLocating} className="premium-button secondary">
            {isLocating ? <Loader2 className="animate-spin" size={18} /> : <Navigation size={18} />}
            Use GPS
          </button>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button onClick={handleFindShops} disabled={!items.length || !location.latitude || !location.longitude || findingShops} className="premium-button flex-1">
            {findingShops ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
            Find best shops
          </button>
          <button onClick={handlePayment} disabled={!selectedShop || paying} className="premium-button success flex-1">
            {paying ? <Loader2 className="animate-spin" size={18} /> : <IndianRupee size={18} />}
            Pay Rs {Math.round(vendorTotal)}
          </button>
        </div>

        {!items.length && (
          <div className="mt-4 flex items-center gap-2 rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
            <AlertCircle size={18} />
            Upload files before searching shops.
          </div>
        )}
      </section>

      {shops.length > 0 && (
        <section className="grid gap-4 lg:grid-cols-3">
          {shops.map((item) => (
            <div
              key={item.shop.id}
              onClick={() => setSelectedShop(item)}
              className={`premium-card cursor-pointer p-5 text-left transition hover:-translate-y-1 ${
                selectedShop?.shop?.id === item.shop.id ? "ring-2 ring-cyan-400" : ""
              }`}
            >
              {selectedShop?.shop?.id === item.shop.id && (
                <div className="mb-3 inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-black text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  SELECTED
                </div>
              )}
              {item.shop.shopPhotoUrl ? (
                <img src={item.shop.shopPhotoUrl} alt={item.shop.name} className="h-36 w-full rounded-3xl object-cover" />
              ) : (
                <div className="h-36 rounded-3xl bg-gradient-to-br from-cyan-200 via-white to-emerald-200 dark:from-cyan-950 dark:via-slate-900 dark:to-emerald-950" />
              )}
              <div className="mt-4 flex items-center justify-between">
                <div className="premium-chip">{item.badge}</div>
                <span className="font-black text-cyan-500">{item.recommendationScore}%</span>
              </div>
              {Boolean(item.tags?.length) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h3 className="mt-3 text-xl font-black text-slate-950 dark:text-white">{item.shop.name}</h3>
              <p className="mt-1 text-sm text-slate-500">{item.shop.address}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <Mini icon={<MapPin size={15} />} label="Km" value={item.distanceKm} />
                <Mini icon={<Clock3 size={15} />} label="Wait" value={`${item.waitingMinutes}m`} />
                <Mini icon={<IndianRupee size={15} />} label="Total" value={`Rs ${Math.round(selectedShop?.shop?.id === item.shop.id ? vendorTotal : item.estimatedPrice)}`} />
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {item.shop.phone && (
                  <a
                    href={`tel:${item.shop.phone}`}
                    onClick={(event) => event.stopPropagation()}
                    className="premium-button secondary min-h-0 px-3 py-2 text-sm"
                  >
                    <Phone size={16} />
                    Call
                  </a>
                )}
                {item.shop.latitude && item.shop.longitude && (
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${item.shop.latitude},${item.shop.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    onClick={(event) => event.stopPropagation()}
                    className="premium-button secondary min-h-0 px-3 py-2 text-sm"
                  >
                    <Navigation size={16} />
                    Navigate
                  </a>
                )}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/customer/shops/${item.shop.id}`);
                  }}
                  className="premium-button secondary min-h-0 px-3 py-2 text-sm"
                >
                  <Store size={16} />
                  Profile
                </button>
              </div>
            </div>
          ))}
        </section>
      )}
    </div>
  );
};

const bindingPrice = (type) => {
  const map = { NONE: 0, STAPLE: 5, SPIRAL: 30, STICK_FILE: 15, HARD_BINDING: 80, SOFT_BINDING: 45 };
  return map[type] || 0;
};

const shopBindingPrice = (shop, type) => {
  const map = {
    NONE: 0,
    STAPLE: shop.staplePrice,
    SPIRAL: shop.spiralBindingPrice,
    STICK_FILE: shop.stickFilePrice,
    HARD_BINDING: shop.hardBindingPrice,
    SOFT_BINDING: shop.softBindingPrice,
  };
  return Number(map[type] || 0);
};

const Field = ({ label, children }) => (
  <label className="block">
    <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
    <div className="mt-2">{children}</div>
  </label>
);

const Metric = ({ label, value }) => (
  <div className="rounded-2xl bg-white/70 p-4 text-center shadow-sm dark:bg-slate-900/70">
    <p className="text-xl font-black text-slate-950 dark:text-white">{value}</p>
    <p className="text-xs font-bold text-slate-500">{label}</p>
  </div>
);

const Mini = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-slate-50 p-3 text-center dark:bg-slate-950">
    <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-xl bg-white text-cyan-500 dark:bg-slate-900">{icon}</div>
    <p className="mt-1 text-sm font-black text-slate-950 dark:text-white">{value}</p>
    <p className="text-[11px] text-slate-500">{label}</p>
  </div>
);

export default UploadOrder;
