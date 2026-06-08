import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { LogIn, ShieldAlert } from "lucide-react";

import { AuthContext } from "../../context/AuthContext";

const SessionExpiredModal = () => {
    const navigate = useNavigate();
    const { sessionExpired, setSessionExpired } = useContext(AuthContext);

    if (!sessionExpired) {
        return null;
    }

    const handleLoginAgain = () => {
        setSessionExpired(false);
        navigate("/login");
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur">
            <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-7 text-center shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-300">
                    <ShieldAlert size={32} />
                </div>
                <h2 className="mt-5 text-3xl font-black text-slate-950 dark:text-white">Session expired</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-300">
                    Your login session has ended for security. Please login again to continue using QloudPrint.
                </p>
                <button onClick={handleLoginAgain} className="premium-button mt-7 w-full">
                    <LogIn size={18} />
                    Login again
                </button>
            </div>
        </div>
    );
};

export default SessionExpiredModal;
