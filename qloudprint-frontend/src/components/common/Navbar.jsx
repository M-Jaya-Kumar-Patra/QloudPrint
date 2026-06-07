import { useContext } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {

    const navigate = useNavigate();

    const { token, logout } = useContext(AuthContext);

    const handleLogout = () => {

        logout();

        navigate("/login");
    };

    return (
        <nav className="bg-white shadow-md px-8 py-4 flex items-center justify-between">

            <h1 className="text-2xl font-bold text-blue-600">
                QloudPrint
            </h1>

            <div className="flex items-center gap-4">

                <Link
                    to="/"
                    className="hover:text-blue-600"
                >
                    Home
                </Link>

                {!token ? (
                    <>

                        <Link
                            to="/login"
                            className="hover:text-blue-600"
                        >
                            Login
                        </Link>

                        <Link
                            to="/register"
                            className="hover:text-blue-600"
                        >
                            Register
                        </Link>

                    </>
                ) : (
                    <>

                        <Link
                            to="/customer/dashboard"
                            className="hover:text-blue-600"
                        >
                            Dashboard
                        </Link>

                        <Link
    to="/upload"
    className="hover:text-blue-600"
>
    Upload
</Link>

                        <button
                            onClick={handleLogout}
                            className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                        >
                            Logout
                        </button>

                    </>
                )}

            </div>

        </nav>
    );
};

export default Navbar;