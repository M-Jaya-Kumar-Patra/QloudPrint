import {
    LayoutDashboard,
    Upload,
    ListOrdered,
    LogOut,
    History,
    QrCode
} from "lucide-react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import { useContext } from "react";

import { AuthContext }
from "../../context/AuthContext";

const Sidebar = () => {

    const navigate =
        useNavigate();

    const { logout } =
        useContext(AuthContext);

    const role =
        localStorage.getItem("role");

    const handleLogout = () => {

        logout();

        navigate("/");
    };

    return (

        <div className="
            w-64
            h-screen
            bg-gray-900
            text-white
            p-6
            fixed
            flex
            flex-col
            justify-between
        ">

            <div>

                <h1 className="
                    text-2xl
                    font-bold
                    mb-10
                ">
                    QloudPrint
                </h1>

                <div className="
                    flex
                    flex-col
                    gap-4
                ">

                    {/* Dashboard */}

                    <Link
                        to={
                            role === "SHOPKEEPER"
                                ? "/shopkeeper/dashboard"
                                : "/customer/dashboard"
                        }
                        className="
                            flex items-center gap-3
                            p-3 rounded-lg
                            hover:bg-gray-800
                            transition
                        "
                    >

                        <LayoutDashboard size={20} />

                        Dashboard

                    </Link>

                    {/* CUSTOMER ROUTES */}

                    {
                        role === "CUSTOMER" && (

                            <>
                                <Link
                                    to="/upload"
                                    className="
                                        flex items-center gap-3
                                        p-3 rounded-lg
                                        hover:bg-gray-800
                                        transition
                                    "
                                >

                                    <Upload size={20} />

                                    Upload

                                </Link>

                                <Link
                                    to="/customer/orders"
                                    className="
                                        flex items-center gap-3
                                        p-3 rounded-lg
                                        hover:bg-gray-800
                                        transition
                                    "
                                >

                                    <History size={20} />

                                    My Orders

                                </Link>
                            </>
                        )
                    }

                    {/* SHOPKEEPER ROUTES */}

                    {
                        role === "SHOPKEEPER" && (

                            <>
                                <Link
                                    to="/shopkeeper/optimized-queue"
                                    className="
                                        flex items-center gap-3
                                        p-3 rounded-lg
                                        hover:bg-gray-800
                                        transition
                                    "
                                >

                                    <ListOrdered size={20} />

                                    Queue

                                </Link>

                                <Link
                                    to="/shopkeeper/scan-qr"
                                    className="
                                        flex items-center gap-3
                                        p-3 rounded-lg
                                        hover:bg-gray-800
                                        transition
                                    "
                                >

                                    <QrCode size={20} />

                                    Scan QR

                                </Link>
                            </>
                        )
                    }

                </div>

            </div>

            {/* Logout */}

            <button
                onClick={handleLogout}
                className="
                    flex items-center gap-3
                    p-3 rounded-lg
                    hover:bg-red-500
                    transition
                "
            >

                <LogOut size={20} />

                Logout

            </button>

        </div>
    );
};

export default Sidebar;