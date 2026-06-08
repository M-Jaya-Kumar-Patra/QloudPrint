import {
    BarChart3,
    History,
    LayoutDashboard,
    ListOrdered,
    LogOut,
    QrCode,
    Store,
    Upload,
    UserCircle,
    X
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext, useEffect, useState } from "react";

import { AuthContext } from "../../context/AuthContext";
import BrandLogo from "../common/BrandLogo";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const role = localStorage.getItem("role");
    const [open, setOpen] = useState(false);

    useEffect(() => {
    const openDrawer = () => setOpen(true);

    window.addEventListener("open-right-drawer", openDrawer);

    return () => {
        window.removeEventListener("open-right-drawer", openDrawer);
    };
}, []);


    const customerLinks = [
        { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/upload", label: "New Order", icon: Upload },
        { to: "/customer/orders", label: "Orders & Invoices", icon: History },
        { to: "/account", label: "Profile", icon: UserCircle },
    ];

    const shopLinks = [
        { to: "/shopkeeper/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/shopkeeper/profile", label: "Shop Settings", icon: Store },
        { to: "/shopkeeper/optimized-queue", label: "Live Queue", icon: ListOrdered },
        { to: "/shopkeeper/scan-qr", label: "Pickup QR", icon: QrCode },
        { to: "/account", label: "Profile", icon: UserCircle },
    ];

    const adminLinks = [
        { to: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
        { to: "/account", label: "Profile", icon: UserCircle },
    ];

    const links = role === "SHOPKEEPER" ? shopLinks : role === "ADMIN" ? adminLinks : customerLinks;

    const handleLogout = () => {
        const confirmed = window.confirm("Are you sure you want to logout?");

        if (!confirmed) {
            return;
        }

        logout();
        navigate("/");
    };

    const navContent = (
        <>
            <div>
                <div className="flex items-center justify-between px-2 py-3">
                    <BrandLogo />
                    <button onClick={() => setOpen(false)} className="rounded-2xl border border-slate-200 p-2 text-slate-600 dark:border-slate-800 dark:text-slate-300 lg:hidden">
                        <X size={20} />
                    </button>
                </div>

                <nav className="mt-8 space-y-2">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = location.pathname === link.to;

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                onClick={() => setOpen(false)}
                                className={`group flex items-center gap-3 rounded-2xl px-4 py-3 font-bold transition ${
                                    active
                                        ? "bg-slate-950 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-950"
                                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white"
                                }`}
                            >
                                <Icon size={20} />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="space-y-3">
                <div className="rounded-3xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30">
                    <p className="text-sm font-black text-slate-950 dark:text-white">Realtime enabled</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Orders, status changes, and queues update through live events.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            

            {open && <button aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden" />}

            <aside className={`fixed right-0 top-0 z-50 flex h-screen w-72 flex-col justify-between border-l border-slate-200 bg-white/95 p-5 shadow-xl shadow-slate-200/50 backdrop-blur-xl transition-transform dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/20 lg:left-0 lg:right-auto lg:translate-x-0 lg:border-l-0 lg:border-r ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}`}>
               {navContent}
            </aside>
        </>
    );
};

export default Sidebar;
