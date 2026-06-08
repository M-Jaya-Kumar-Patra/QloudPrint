import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock3, IndianRupee, Loader2, MapPin, Navigation, Phone, Star, Store } from "lucide-react";

import { getShopProfile } from "../../api/shopApi";
import { toast } from "../../utils/toastStore";

const bindingRows = [
  ["Staple", "stapling", "staplePrice", "staplePhotoUrl"],
  ["Spiral binding", "spiralBinding", "spiralBindingPrice", "spiralBindingPhotoUrl"],
  ["Stick file", "stickFile", "stickFilePrice", "stickFilePhotoUrl"],
  ["Soft binding", "softBinding", "softBindingPrice", "softBindingPhotoUrl"],
  ["Hard binding", "hardBinding", "hardBindingPrice", "hardBindingPhotoUrl"],
];

const ShopPublicProfile = () => {
  const { shopId } = useParams();
  const navigate = useNavigate();
  const [shop, setShop] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadShop = async () => {
      try {
        const response = await getShopProfile(shopId);
        setShop(response.data);
      } catch (error) {
        toast.error(error.response?.data?.message || "Could not load shop");
      } finally {
        setLoading(false);
      }
    };

    loadShop();
  }, [shopId]);

  if (loading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-cyan-500" size={46} /></div>;
  }

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)} className="premium-button secondary">
        <ArrowLeft size={18} />
        Back
      </button>

      <section className="premium-panel overflow-hidden p-0">
        {shop?.shopPhotoUrl ? (
          <img src={shop.shopPhotoUrl} alt={shop.name} className="h-72 w-full object-cover" />
        ) : (
          <div className="flex h-72 items-center justify-center bg-slate-200 text-slate-500 dark:bg-slate-900">
            <Store size={54} />
          </div>
        )}
        <div className="p-6 lg:p-8">
          <div className="premium-chip">
            <Store size={16} />
            {shop?.openNow ? "Open now" : "Closed"}
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-950 dark:text-white">{shop?.name}</h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{shop?.address}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {shop?.phone && (
              <a href={`tel:${shop.phone}`} className="premium-button secondary">
                <Phone size={18} />
                Call shop
              </a>
            )}
            {shop?.latitude && shop?.longitude && (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${shop.latitude},${shop.longitude}`}
                target="_blank"
                rel="noreferrer"
                className="premium-button"
              >
                <Navigation size={18} />
                Navigate in Google Maps
              </a>
            )}
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <Info icon={<Star />} label="Rating" value={`${shop?.rating || 0}/5`} />
            <Info icon={<Clock3 />} label="Hours" value={`${shop?.openingTime || "--"} - ${shop?.closingTime || "--"}`} />
            <Info icon={<IndianRupee />} label="B/W" value={`Rs ${shop?.bwPricePerPage || 0}/page`} />
            <Info icon={<MapPin />} label="Location" value={`${shop?.latitude || "--"}, ${shop?.longitude || "--"}`} />
          </div>
        </div>
      </section>

      <section className="premium-card p-6">
        <h2 className="text-2xl font-black text-slate-950 dark:text-white">Binding options</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {bindingRows.filter((row) => shop?.[row[1]]).map(([label, , price, photo]) => (
            <div key={label} className="rounded-2xl border border-slate-200 p-3 dark:border-slate-800">
              {shop?.[photo] ? (
                <img src={shop[photo]} alt={label} className="h-32 w-full rounded-xl object-cover" />
              ) : (
                <div className="h-32 rounded-xl bg-slate-100 dark:bg-slate-950" />
              )}
              <p className="mt-3 font-black text-slate-950 dark:text-white">{label}</p>
              <p className="text-sm font-bold text-slate-500">Rs {shop?.[price] || 0}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Info = ({ icon, label, value }) => (
  <div className="rounded-2xl bg-white/70 p-4 dark:bg-slate-900/70">
    <div className="text-cyan-500">{icon}</div>
    <p className="mt-2 font-black text-slate-950 dark:text-white">{value}</p>
    <p className="text-xs font-bold text-slate-500">{label}</p>
  </div>
);

export default ShopPublicProfile;
