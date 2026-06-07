import api from "../services/api";

export const getPlatformAnalytics = async () => {
    return api.get("/admin/analytics");
};
