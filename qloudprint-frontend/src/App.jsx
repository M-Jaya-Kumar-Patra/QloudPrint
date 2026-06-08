import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { warmBackend } from "./services/api";
import SessionExpiredModal from "./components/common/SessionExpiredModal";

function App() {
    useEffect(() => {
        warmBackend();
    }, []);

    return (
        <>
            <AppRoutes />
            <SessionExpiredModal />
        </>
    );
}

export default App;
