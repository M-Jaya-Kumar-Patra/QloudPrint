import api from "../services/api";

export const registerUser = async (userData) => {
    return await api.post("/auth/register", userData);
};

export const loginUser = async (userData) => {
    return await api.post("/auth/login", userData);
};

export const forgotPassword = async (email) => {
    return api.post("/auth/forgot-password", { email });
};

export const resetPassword = async (data) => {
    return api.post("/auth/reset-password", data);
};

export const getMyProfile = async () => {
    return api.get("/auth/me");
};
