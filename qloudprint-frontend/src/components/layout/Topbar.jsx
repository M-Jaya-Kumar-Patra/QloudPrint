import { Bell, Menu, Search } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import ThemeToggle from "../common/ThemeToggle";
import BrandLogo from "../common/BrandLogo";



const Topbar = () => {
    const role = localStorage.getItem("role") || "CUSTOMER";
    const navigate = useNavigate();
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const query = params.get("q") || "";

    const handleSearch = (event) => {
        const nextParams = new URLSearchParams(location.search);

        if (event.target.value) {
            nextParams.set("q", event.target.value);
        } else {
            nextParams.delete("q");
        }

        navigate(`${location.pathname}${nextParams.toString() ? `?${nextParams.toString()}` : ""}`, { replace: true });
    };

    return (
        <div className="
            sticky top-0 z-30
            min-h-20
            bg-white/80
            dark:bg-slate-950/80
            backdrop-blur-xl
            border-b
            border-slate-200
            dark:border-slate-800
            flex
            items-center
            justify-between
            px-6
        ">

            <div>
    <div className="lg:hidden">
        <BrandLogo />
    </div>

    <div className="hidden lg:block">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-cyan-500">
            {role.toLowerCase()} workspace
        </p>
        <h1 className="text-2xl font-black text-slate-950 dark:text-white">
            Command Center
        </h1>
    </div>
</div>

            <div className="
                flex
                items-center
                gap-3
            ">
                <label className="hidden h-11 w-72 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 text-slate-400 shadow-sm dark:border-slate-800 dark:bg-slate-900 md:flex">
                    <Search size={18} />
                    <input value={query} onChange={handleSearch} placeholder="Search orders, shops, invoices" className="w-full bg-transparent text-sm font-semibold text-slate-900 outline-none placeholder:text-slate-400 dark:text-white" />
                </label>
                <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
                    <Bell size={19} />
                    <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </button>
                <ThemeToggle />
                <button
    onClick={() => window.dispatchEvent(new Event("open-right-drawer"))}
    className="flex lg:hidden h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
>
    <Menu size={22} />
</button>
            </div>

        </div>
    );
};

export default Topbar;
