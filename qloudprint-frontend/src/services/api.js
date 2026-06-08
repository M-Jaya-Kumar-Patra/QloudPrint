import axios from "axios";

const baseUrl = (import.meta.env.VITE_BASE_URL || "").replace(/\/$/, "");

const api = axios.create({
    baseURL: `${baseUrl}/api`,
    timeout: 120000,
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
        if (error.code === "ECONNABORTED") {
            return Promise.reject({
                ...error,
                response: {
                    data: {
                        message: "Server is waking up and taking too long to respond. Please try again in a minute.",
                    },
                },
            });
        }

        if (!error.response) {
            return Promise.reject({
                ...error,
                response: {
                    data: {
                        message: "Could not connect to the server. Please check the backend URL and CORS settings.",
                    },
                },
            });
        }

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

export const warmBackend = () => {
    if (!baseUrl) {
        return;
    }

    axios
        .get(`${baseUrl}/api/health`, { timeout: 120000 })
        .catch(() => {});
};
