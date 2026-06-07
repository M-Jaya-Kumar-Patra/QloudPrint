import api from "../services/api";

export const saveMyShop = async (data) => {
    return api.post("/shops/me", data);
};

export const getMyShop = async () => {
    return api.get("/shops/me");
};

export const getShopRecommendations = async (params) => {
    return api.get("/shops/recommendations", {
        params,
    });
};

export const uploadShopPhoto = async (data) => {
    return api.post("/shops/upload-photo", data, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
};
