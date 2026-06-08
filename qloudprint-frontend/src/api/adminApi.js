import api from "../services/api";

export const getPlatformAnalytics = async () => {
    return api.get("/admin/analytics");
};

export const updatePlatformSettings = async (data) => {
    return api.put("/admin/analytics/settings", data);
};

export const getAdminPayouts = async () => {
    return api.get("/admin/analytics/payouts");
};

export const settleAdminPayout = async (orderId, data) => {
    return api.post(`/admin/analytics/payouts/${orderId}/settle`, data);
};
