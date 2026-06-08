import api from "../services/api";

export const getPlatformAnalytics = async () => {
    return api.get("/admin/analytics");
};

export const updatePlatformSettings = async (data) => {
    return api.put("/admin/analytics/settings", data);
};
