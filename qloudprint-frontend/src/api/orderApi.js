import api from "../services/api";

export const createOrder = async (data) => {

    return await api.post(
        "/customer/orders",
            data,

            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
    );
};

export const getCustomerOrders = async () => {

    return await api.get("/customer/orders");
};

export const getAllOrders = async () => {

    return await api.get(
        "/shopkeeper/orders"
    );
};

export const updateOrderStatus = (
    orderId,
    data
) => {

    return api.put(
        `/shopkeeper/orders/${orderId}/status`,
        data
    );
};

export const getOptimizedQueue = async () => {

    return await api.get(
        "/shopkeeper/orders/optimized-queue"
    );
};

export const estimateOrder =
    async (data) => {

        return api.post(
            "/customer/orders/estimate",
            data,
            {
                headers: {
                    "Content-Type":
                        "multipart/form-data",
                },
            }
        );
    };

export const tempUpload =
    async (data) => {
        return api.post(
            "/customer/orders/temp-upload",
            data,
            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                },
            }
        );
    };


    export const verifyQrOrder =
    async (orderCode) => {

        return await api.get(
            `/shopkeeper/orders/verify/${orderCode}`
        );
    };