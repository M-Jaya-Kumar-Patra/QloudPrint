import {
    BarChart3,
    History,
    LayoutDashboard,
    ListOrdered,
    LogOut,
    QrCode,
    Store,
    Upload
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";

import { AuthContext } from "../../context/AuthContext";
import BrandLogo from "../common/BrandLogo";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useContext(AuthContext);
    const role = localStorage.getItem("role");

    const customerLinks = [
        { to: "/customer/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/upload", label: "New Order", icon: Upload },
        { to: "/customer/orders", label: "Orders & Invoices", icon: History },
    ];

    const shopLinks = [
        { to: "/shopkeeper/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/shopkeeper/profile", label: "Shop Settings", icon: Store },
        { to: "/shopkeeper/optimized-queue", label: "Live Queue", icon: ListOrdered },
        { to: "/shopkeeper/scan-qr", label: "Pickup QR", icon: QrCode },
    ];

    const adminLinks = [
        { to: "/admin/analytics", label: "Platform Analytics", icon: BarChart3 },
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

    return (
        <aside className="fixed bottom-0 left-0 top-auto z-40 flex h-20 w-full flex-row items-center justify-between border-t border-slate-200 bg-white/95 p-3 shadow-xl shadow-slate-200/50 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/95 dark:shadow-black/20 lg:top-0 lg:h-screen lg:w-72 lg:flex-col lg:items-stretch lg:border-r lg:border-t-0 lg:p-5">
            <div>
                <div className="hidden px-2 py-3 lg:block">
                    <BrandLogo />
                </div>

                <nav className="flex gap-1 overflow-x-auto lg:mt-8 lg:block lg:space-y-2 lg:overflow-visible">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const active = location.pathname === link.to;

                        return (
                            <Link
                                key={link.to}
                                to={link.to}
                                className={`group flex min-w-max items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold transition lg:gap-3 lg:px-4 ${
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

            <div className="flex items-center gap-2 lg:block lg:space-y-3">
                <div className="hidden rounded-3xl border border-cyan-200 bg-cyan-50 p-4 dark:border-cyan-900 dark:bg-cyan-950/30 lg:block">
                    <p className="text-sm font-black text-slate-950 dark:text-white">Realtime enabled</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                        Orders, status changes, and queues update through live events.
                    </p>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-2xl px-3 py-3 text-sm font-bold text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30 lg:w-full lg:gap-3 lg:px-4"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
