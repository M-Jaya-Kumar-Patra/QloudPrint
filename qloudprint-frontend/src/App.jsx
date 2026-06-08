import AppRoutes from "./routes/AppRoutes";
import { useEffect } from "react";
import { warmBackend } from "./services/api";

function App() {
    useEffect(() => {
        warmBackend();
    }, []);

    return <AppRoutes />;
}

export default App;
