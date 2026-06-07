import axios from "axios";

const BASE_URL =
    "http://localhost:8080/api/payment";

export const createPaymentOrder =
    async (data) => {

        return axios.post(
            `${BASE_URL}/create-order`,
            data
        );
    };

export const verifyPayment =
    async (orderId) => {

        return axios.get(

            `${BASE_URL}/verify/${orderId}`,

            {
                headers: {
                    Authorization:
                        `Bearer ${localStorage.getItem("token")}`
                }
            }
        );
    };