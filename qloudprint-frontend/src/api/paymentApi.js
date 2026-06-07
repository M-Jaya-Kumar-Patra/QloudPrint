import api from "../services/api";

export const createPaymentOrder =
    async (data) => {

        return api.post(
            "/payment/create-order",
            data
        );
    };

export const verifyPayment =
    async (orderId) => {

        return api.get(

            `/payment/verify/${orderId}`
        );
    };
