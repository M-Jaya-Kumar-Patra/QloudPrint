import axios from "axios";

const baseUrl = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

const api = axios.create({
    baseURL: `${baseUrl}/api`,
});

api.interceptors.request.use((config) => {

    const token = localStorage.getItem("token");

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            sessionStorage.setItem("sessionExpired", "true");

            if (!window.location.pathname.includes("/login")) {
                window.location.href = "/login?session=expired";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
