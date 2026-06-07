import { useEffect, useState } from "react";
import { Banknote, Camera, Clock, IndianRupee, Loader2, MapPin, Save, Settings2, Store } from "lucide-react";

import { getMyShop, saveMyShop, uploadShopPhoto } from "../../api/shopApi";
import { toast } from "../../utils/toastStore";

const bindings = [
    { key: "stapling", price: "staplePrice", photo: "staplePhotoUrl", label: "Staple", image: "bg-gradient-to-br from-slate-200 to-slate-500" },
    { key: "spiralBinding", price: "spiralBindingPrice", photo: "spiralBindingPhotoUrl", label: "Spiral binding", image: "bg-[repeating-linear-gradient(90deg,#0f172a_0_5px,#e2e8f0_5px_12px)]" },
    { key: "stickFile", price: "stickFilePrice", photo: "stickFilePhotoUrl", label: "Stick file", image: "bg-gradient-to-r from-amber-200 via-white to-amber-500" },
    { key: "softBinding", price: "softBindingPrice", photo: "softBindingPhotoUrl", label: "Soft binding", image: "bg-gradient-to-br from-cyan-100 to-blue-300" },
    { key: "hardBinding", price: "hardBindingPrice", photo: "hardBindingPhotoUrl", label: "Hard binding", image: "bg-gradient-to-br from-stone-800 to-stone-500" },
];

const ShopProfile = () => {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        address: "",
        phone: "",
        latitude: "20.2961",
        longitude: "85.8245",
        openingTime: "09:00",
        closingTime: "21:00",
        openNow: true,
        colorPrinting: true,
        lamination: false,
        bwPricePerPage: 2,
        colorPricePerPage: 5,
        duplexPricePerPage: 0.5,
        averagePagesPerMinute: 10,
        printSecondsPerPage: 6,
        planName: "Standard",
        shopPhotoUrl: "",
        staplePhotoUrl: "",
        spiralBindingPhotoUrl: "",
        stickFilePhotoUrl: "",
        hardBindingPhotoUrl: "",
        softBindingPhotoUrl: "",
        stapling: true,
        spiralBinding: true,
        stickFile: true,
        hardBinding: false,
        softBinding: true,
        staplePrice: 5,
        spiralBindingPrice: 30,
        stickFilePrice: 15,
        hardBindingPrice: 80,
        softBindingPrice: 45,
        bankAccountHolder: "",
        bankAccountNumber: "",
        bankIfsc: "",
        upiId: "",
        gstNumber: "",
    });

    useEffect(() => {
        const loadShop = async () => {
            try {
                const response = await getMyShop();

                if (response.data) {
                    setFormData((current) => ({ ...current, ...response.data }));
                }
            } catch (error) {
                console.log(error);
            }
        };

        loadShop();
    }, []);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setSaving(true);

        try {
            await saveMyShop({
                ...formData,
                latitude: Number(formData.latitude),
                longitude: Number(formData.longitude),
                bwPricePerPage: Number(formData.bwPricePerPage),
                colorPricePerPage: Number(formData.colorPricePerPage),
                duplexPricePerPage: Number(formData.duplexPricePerPage),
                averagePagesPerMinute: Number(formData.averagePagesPerMinute),
                printSecondsPerPage: Number(formData.printSecondsPerPage),
                staplePrice: Number(formData.staplePrice),
                spiralBindingPrice: Number(formData.spiralBindingPrice),
                stickFilePrice: Number(formData.stickFilePrice),
                hardBindingPrice: Number(formData.hardBindingPrice),
                softBindingPrice: Number(formData.softBindingPrice),
            });

            toast.success("Shop settings saved");
        } catch (error) {
            toast.error(error.response?.data?.message || "Could not save shop");
        } finally {
            setSaving(false);
        }
    };

    const handlePhotoUpload = async (event, fieldName) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        const data = new FormData();
        data.append("file", file);

        try {
            const response = await uploadShopPhoto(data);
            setFormData((current) => ({ ...current, [fieldName]: response.data.url }));
            toast.success("Photo uploaded");
        } catch (error) {
            toast.error(error.response?.data?.message || "Photo upload failed");
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <section className="premium-panel p-6 lg:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="premium-chip">
                            <Settings2 size={16} />
                            Shop command center
                        </div>
                        <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">Control every part of your shop.</h1>
                        <p className="mt-3 max-w-3xl text-slate-500 dark:text-slate-400">
                            Configure services, pricing, queue speed, payout details, availability, and public branding from one place.
                        </p>
                    </div>
                    <button disabled={saving} className="premium-button">
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        Save all settings
                    </button>
                </div>
            </section>

            <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                <section className="premium-card p-6 space-y-5">
                    <Header icon={<Store />} title="Identity and location" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input name="name" label="Shop name" value={formData.name} onChange={handleChange} />
                        <Input name="phone" label="Phone" value={formData.phone} onChange={handleChange} />
                    </div>
                    <Input name="address" label="Full address" value={formData.address} onChange={handleChange} />
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input name="latitude" label="Latitude" value={formData.latitude} onChange={handleChange} />
                        <Input name="longitude" label="Longitude" value={formData.longitude} onChange={handleChange} />
                    </div>
                    <PhotoUpload label="Upload shop photo" onChange={(event) => handlePhotoUpload(event, "shopPhotoUrl")} />
                    {formData.shopPhotoUrl ? (
                        <img src={formData.shopPhotoUrl} alt="Shop preview" className="h-52 w-full rounded-3xl object-cover" />
                    ) : (
                        <div className="flex h-52 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 dark:bg-slate-950">
                            <Camera size={40} />
                        </div>
                    )}
                </section>

                <section className="premium-card p-6 space-y-5">
                    <Header icon={<Clock />} title="Availability and speed" />
                    <div className="grid md:grid-cols-2 gap-4">
                        <Input name="openingTime" label="Opening time" value={formData.openingTime} onChange={handleChange} />
                        <Input name="closingTime" label="Closing time" value={formData.closingTime} onChange={handleChange} />
                    </div>
                    <Toggle name="openNow" label="Accepting orders now" checked={Boolean(formData.openNow)} onChange={handleChange} />
                    <Input name="printSecondsPerPage" label="Seconds per printed page" value={formData.printSecondsPerPage} onChange={handleChange} />
                    <Input name="averagePagesPerMinute" label="Average pages per minute" value={formData.averagePagesPerMinute} onChange={handleChange} />
                    <Input name="planName" label="Shop plan name" value={formData.planName || ""} onChange={handleChange} />
                </section>
            </div>

            <section className="premium-card p-6 space-y-5">
                <Header icon={<IndianRupee />} title="Print pricing" />
                <div className="grid md:grid-cols-3 gap-4">
                    <Input name="bwPricePerPage" label="B/W price per page" value={formData.bwPricePerPage} onChange={handleChange} />
                    <Input name="colorPricePerPage" label="Color price per page" value={formData.colorPricePerPage} onChange={handleChange} />
                    <Input name="duplexPricePerPage" label="Double-side extra per page" value={formData.duplexPricePerPage} onChange={handleChange} />
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                    <Toggle name="colorPrinting" label="Provides color printing" checked={Boolean(formData.colorPrinting)} onChange={handleChange} />
                    <Toggle name="lamination" label="Provides lamination" checked={Boolean(formData.lamination)} onChange={handleChange} />
                </div>
            </section>

            <section className="premium-card p-6 space-y-5">
                <Header icon={<MapPin />} title="Binding catalogue with pricing" />
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                    {bindings.map((binding) => (
                        <div key={binding.key} className="rounded-3xl border border-slate-200 p-4 dark:border-slate-800">
                            {formData[binding.photo] ? (
                                <img src={formData[binding.photo]} alt={binding.label} className="h-28 w-full rounded-2xl object-cover" />
                            ) : (
                                <div className={`h-28 rounded-2xl ${binding.image}`} />
                            )}
                            <Toggle name={binding.key} label={binding.label} checked={Boolean(formData[binding.key])} onChange={handleChange} compact />
                            <Input name={binding.price} label="Price" value={formData[binding.price]} onChange={handleChange} />
                            <PhotoUpload label="Upload photo" onChange={(event) => handlePhotoUpload(event, binding.photo)} compact />
                        </div>
                    ))}
                </div>
            </section>

            <section className="premium-card p-6 space-y-5">
                <Header icon={<Banknote />} title="Payout and billing details" />
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    <Input name="bankAccountHolder" label="Account holder" value={formData.bankAccountHolder || ""} onChange={handleChange} />
                    <Input name="bankAccountNumber" label="Bank account number" value={formData.bankAccountNumber || ""} onChange={handleChange} />
                    <Input name="bankIfsc" label="IFSC" value={formData.bankIfsc || ""} onChange={handleChange} />
                    <Input name="upiId" label="UPI ID" value={formData.upiId || ""} onChange={handleChange} />
                    <Input name="gstNumber" label="GST number" value={formData.gstNumber || ""} onChange={handleChange} />
                </div>
                <p className="rounded-2xl bg-amber-50 p-4 text-sm font-semibold text-amber-700 dark:bg-amber-950/30 dark:text-amber-300">
                    Production payout crediting needs Cashfree/settlement account verification. These details are stored for the payout workflow.
                </p>
            </section>
        </form>
    );
};

const Header = ({ icon, title }) => (
    <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600 dark:bg-cyan-950/40 dark:text-cyan-300">{icon}</div>
        <h2 className="text-xl font-black text-slate-950 dark:text-white">{title}</h2>
    </div>
);

const Input = ({ label, ...props }) => (
    <label className="block">
        <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{label}</span>
        <input {...props} className="field-input mt-2" />
    </label>
);

const PhotoUpload = ({ label, compact = false, ...props }) => (
    <label className={`mt-3 flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 font-black text-slate-600 transition hover:border-cyan-400 hover:bg-cyan-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 ${compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"}`}>
        {label}
        <input type="file" accept="image/*" {...props} className="hidden" />
    </label>
);

const Toggle = ({ label, compact = false, ...props }) => (
    <label className={`mt-3 flex items-center justify-between rounded-2xl border border-slate-200 font-bold text-slate-700 dark:border-slate-800 dark:text-slate-200 ${compact ? "p-3 text-sm" : "p-4"}`}>
        {label}
        <input type="checkbox" {...props} className="h-5 w-5 accent-cyan-500" />
    </label>
);

export default ShopProfile;
