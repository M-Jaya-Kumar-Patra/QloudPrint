import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { warmBackend } from "./services/api";
import SessionExpiredModal from "./components/common/SessionExpiredModal";
import { BrowserRouter } from "react-router-dom";

function App() {
    useEffect(() => {
        warmBackend();
    }, []);

    return (
        <BrowserRouter>
            <AppRoutes />
            <SessionExpiredModal />
        </BrowserRouter>
    );
}

export default App;
