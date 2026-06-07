import { useEffect } from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    Printer,
    ShieldCheck,
    Clock3,
    QrCode
} from "lucide-react";

const Home = () => {

    const navigate =
        useNavigate();

    useEffect(() => {

        const token =
            localStorage.getItem(
                "token"
            );

        const role =
            localStorage.getItem(
                "role"
            );

        if (token && role) {

            if (
                role === "SHOPKEEPER"
            ) {

                navigate(
                    "/shopkeeper/dashboard"
                );

            } else {

                navigate(
                    "/customer/dashboard"
                );
            }
        }

    }, []);

    return (

        <div className="
            min-h-screen
            bg-gradient-to-br
            from-gray-950
            via-gray-900
            to-black
            text-white
            overflow-hidden
        ">

            {/* Navbar */}

            <div className="
                flex
                items-center
                justify-between
                px-10
                py-6
                border-b
                border-gray-800
            ">

                <h1 className="
                    text-3xl
                    font-extrabold
                    tracking-wide
                ">
                    QloudPrint
                </h1>

                <div className="
                    flex
                    gap-4
                ">

                    <button
                        onClick={() =>
                            navigate("/login")
                        }
                        className="
                            px-5
                            py-2
                            rounded-xl
                            border
                            border-gray-700
                            hover:bg-gray-800
                            transition
                        "
                    >
                        Login
                    </button>

                    <button
                        onClick={() =>
                            navigate("/register")
                        }
                        className="
                            px-5
                            py-2
                            rounded-xl
                            bg-white
                            text-black
                            font-semibold
                            hover:scale-105
                            transition
                        "
                    >
                        Get Started
                    </button>

                </div>

            </div>

            {/* Hero Section */}

            <div className="
                max-w-7xl
                mx-auto
                px-8
                py-24
                grid
                lg:grid-cols-2
                gap-16
                items-center
            ">

                {/* Left */}

                <div>

                    <div className="
                        inline-block
                        px-4
                        py-2
                        rounded-full
                        bg-green-500/10
                        text-green-400
                        border
                        border-green-500/20
                        text-sm
                        mb-6
                    ">
                        Smart Cloud Printing Platform
                    </div>

                    <h1 className="
                        text-6xl
                        font-black
                        leading-tight
                    ">
                        Print Documents
                        <span className="
                            text-blue-400
                        ">
                            {" "}Faster,
                        </span>

                        Smarter &
                        Queue-Free
                    </h1>

                    <p className="
                        text-gray-400
                        text-lg
                        mt-8
                        leading-relaxed
                        max-w-2xl
                    ">
                        Upload PDFs, estimate cost instantly,
                        pay online, track print status,
                        and verify pickup securely using QR codes.
                        Built for students, cyber cafes,
                        and modern print shops.
                    </p>

                    <div className="
                        flex
                        gap-5
                        mt-10
                        flex-wrap
                    ">

                        <button
                            onClick={() =>
                                navigate("/register")
                            }
                            className="
                                bg-blue-500
                                hover:bg-blue-600
                                px-8
                                py-4
                                rounded-2xl
                                font-semibold
                                text-lg
                                transition
                                shadow-lg
                                shadow-blue-500/20
                            "
                        >
                            Start Printing
                        </button>

                        <button
                            onClick={() =>
                                navigate("/login")
                            }
                            className="
                                border
                                border-gray-700
                                hover:bg-gray-800
                                px-8
                                py-4
                                rounded-2xl
                                font-semibold
                                text-lg
                                transition
                            "
                        >
                            Login
                        </button>

                    </div>

                </div>

                {/* Right */}

                <div className="
                    grid
                    grid-cols-2
                    gap-6
                ">

                    <div className="
                        bg-gray-900/80
                        border
                        border-gray-800
                        rounded-3xl
                        p-8
                        backdrop-blur-lg
                        hover:-translate-y-2
                        transition
                    ">

                        <Printer
                            size={50}
                            className="text-blue-400"
                        />

                        <h2 className="
                            text-2xl
                            font-bold
                            mt-6
                        ">
                            Instant Upload
                        </h2>

                        <p className="
                            text-gray-400
                            mt-3
                        ">
                            Upload PDFs and get
                            real-time print estimates
                            instantly.
                        </p>

                    </div>

                    <div className="
                        bg-gray-900/80
                        border
                        border-gray-800
                        rounded-3xl
                        p-8
                        mt-12
                        backdrop-blur-lg
                        hover:-translate-y-2
                        transition
                    ">

                        <Clock3
                            size={50}
                            className="text-yellow-400"
                        />

                        <h2 className="
                            text-2xl
                            font-bold
                            mt-6
                        ">
                            Smart Queue
                        </h2>

                        <p className="
                            text-gray-400
                            mt-3
                        ">
                            Optimized print queue
                            for faster order handling
                            and reduced waiting time.
                        </p>

                    </div>

                    <div className="
                        bg-gray-900/80
                        border
                        border-gray-800
                        rounded-3xl
                        p-8
                        backdrop-blur-lg
                        hover:-translate-y-2
                        transition
                    ">

                        <QrCode
                            size={50}
                            className="text-green-400"
                        />

                        <h2 className="
                            text-2xl
                            font-bold
                            mt-6
                        ">
                            QR Verification
                        </h2>

                        <p className="
                            text-gray-400
                            mt-3
                        ">
                            Secure pickup verification
                            using dynamic QR codes.
                        </p>

                    </div>

                    <div className="
                        bg-gray-900/80
                        border
                        border-gray-800
                        rounded-3xl
                        p-8
                        mt-12
                        backdrop-blur-lg
                        hover:-translate-y-2
                        transition
                    ">

                        <ShieldCheck
                            size={50}
                            className="text-purple-400"
                        />

                        <h2 className="
                            text-2xl
                            font-bold
                            mt-6
                        ">
                            Secure Payments
                        </h2>

                        <p className="
                            text-gray-400
                            mt-3
                        ">
                            Integrated online payment
                            flow with safe order confirmation.
                        </p>

                    </div>

                </div>

            </div>

            {/* Footer */}

            <div className="
                border-t
                border-gray-800
                text-center
                py-6
                text-gray-500
                text-sm
            ">

                © 2026 QloudPrint —
                Smart Printing Platform

            </div>

        </div>
    );
};

export default Home;