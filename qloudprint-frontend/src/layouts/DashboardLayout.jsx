import Sidebar from "../components/layout/Sidebar";

import Topbar from "../components/layout/Topbar";
import { PublicFooter } from "../pages/public/PublicInfoPages";
import { QrCode } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DashboardLayout = ({
    children
}) => {
    const navigate = useNavigate();
    const role = localStorage.getItem("role");

    return (
        <div className="min-h-screen bg-slate-100 text-slate-950 dark:bg-slate-950 dark:text-white lg:flex">

            <Sidebar />

            <div className="
    lg:ml-72
    lg:pt-0
    flex-1
    bg-slate-100
    dark:bg-slate-950
    min-h-screen
">

                <Topbar />

                <div className="p-5 lg:p-8">
                    {children}
                </div>

                <PublicFooter />

            </div>

            {role === "SHOPKEEPER" && (
                <button
                    type="button"
                    onClick={() => navigate("/shopkeeper/scan-qr")}
                    className="fixed bottom-5 right-5 z-40 inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-400 text-slate-950 shadow-2xl shadow-cyan-500/30 transition hover:-translate-y-1 hover:bg-cyan-300 focus:outline-none focus:ring-4 focus:ring-cyan-300/40 lg:bottom-8 lg:right-8"
                    title="Scan pickup QR"
                    aria-label="Scan pickup QR"
                >
                    <QrCode size={28} />
                </button>
            )}

        </div>
    );
};

export default DashboardLayout;
