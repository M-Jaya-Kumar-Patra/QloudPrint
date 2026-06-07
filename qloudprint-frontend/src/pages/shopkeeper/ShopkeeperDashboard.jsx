import { useEffect, useState } from "react";

import {
    getAllOrders,
    updateOrderStatus
} from "../../api/orderApi";

const ShopkeeperDashboard = () => {

    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {

        try {

            const response = await getAllOrders();

            setOrders(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    useEffect(() => {

        fetchOrders();

    }, []);

    const handleStatusChange = async (
        orderId,
        status
    ) => {

        try {

            await updateOrderStatus(
                orderId,
                {
                    status
                }
            );

            fetchOrders();

        } catch (error) {

            console.log(error);
        }
    };

    const getStatusColor = (status) => {

        switch (status) {

            case "PAYMENT_CONFIRMED":
                return "text-yellow-600";

            case "QUEUED":
                return "text-orange-600";

            case "PRINTING":
                return "text-blue-600";

            case "READY_FOR_PICKUP":
                return "text-purple-600";

            case "COMPLETED":
                return "text-green-600";

            case "CANCELLED":
                return "text-red-600";

            default:
                return "text-gray-600";
        }
    };

    return (

        <div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-3xl font-bold mb-8">
                Shopkeeper Dashboard
            </h1>

            <div className="grid gap-6">

                {orders.map((order) => (

                    <div
                        key={order.id}
                        className="bg-white p-6 rounded-xl shadow"
                    >

                        <h2 className="text-xl font-semibold mb-2">
                            {order.fileName}
                        </h2>

                        <p>
                            Customer: {order.user.name}
                        </p>

                        <p>
                            Copies: {order.copies}
                        </p>

                        <p>
                            Pages: {order.pageCount}
                        </p>

                        <p>
                            Estimated Time:
                            {" "}
                            {order.estimatedMinutes} mins
                        </p>

                        <p className="font-semibold">
                            Order Code:
                            {" "}
                            {order.orderCode}
                        </p>

                        <p
                            className={`font-bold mt-2 ${getStatusColor(order.status)}`}
                        >
                            Status: {order.status}
                        </p>

                        <select
                            onChange={(e) =>
                                handleStatusChange(
                                    order.id,
                                    e.target.value
                                )
                            }
                            value={order.status}
                            className="border p-2 rounded mt-4 w-full"
                        >

                            <option value="PAYMENT_CONFIRMED">
                                PAYMENT_CONFIRMED
                            </option>

                            <option value="QUEUED">
                                QUEUED
                            </option>

                            <option value="PRINTING">
                                PRINTING
                            </option>

                            <option value="READY_FOR_PICKUP">
                                READY_FOR_PICKUP
                            </option>

                            <option value="COMPLETED">
                                COMPLETED
                            </option>

                            <option value="CANCELLED">
                                CANCELLED
                            </option>

                        </select>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default ShopkeeperDashboard;