import { useEffect, useState } from "react";

import { getCustomerOrders } from "../../api/orderApi";

import stompClient from "../../services/websocket";

import DashboardCard from "../../components/dashboard/DashboardCard";

import StatusBadge from "../../components/dashboard/StatusBadge";

import StatCard from "../../components/dashboard/StatCard";

import AnalyticsChart from "../../components/dashboard/AnalyticsChart";

import DashboardLayout from "../../layouts/DashboardLayout";

const CustomerDashboard = () => {

    const [orders, setOrders] = useState([]);

    const fetchOrders = async () => {

        try {

            const response = await getCustomerOrders();

            setOrders(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    useEffect(() => {

        fetchOrders();

    }, []);

    useEffect(() => {

    stompClient.onConnect = () => {

        console.log("Connected to WebSocket");

        stompClient.subscribe(
            "/topic/orders",
            (message) => {

                const updatedOrder = JSON.parse(
                    message.body
                );

                setOrders((prevOrders) =>
                    prevOrders.map((order) =>
                        order.id === updatedOrder.id
                            ? updatedOrder
                            : order
                    )
                );
            }
        );
    };

    stompClient.activate();

    return () => {
        stompClient.deactivate();
    };

}, []);

const totalOrders = orders.length;

const pendingOrders = orders.filter(
    (order) =>
        order.status === "PENDING"
).length;

const completedOrders = orders.filter(
    (order) =>
        order.status === "COMPLETED"
).length;

const totalEstimatedTime = orders.reduce(
    (total, order) =>
        total + order.estimatedMinutes,
    0
);

    return (
<div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-3xl font-bold mb-8">
                My Orders
            </h1>

            <div className="
    grid
    grid-cols-1
    md:grid-cols-2
    lg:grid-cols-4
    gap-6
    mb-10
">

    <StatCard
        title="Total Orders"
        value={totalOrders}
    />

    <StatCard
        title="Pending Orders"
        value={pendingOrders}
    />

    <StatCard
        title="Completed Orders"
        value={completedOrders}
    />

    <StatCard
        title="Total Wait Time"
        value={`${totalEstimatedTime} mins`}
    />

</div>

<AnalyticsChart
    orders={orders}
/>

            <div className="grid mt-10 gap-6">

                {orders.map((order) => (

                    <DashboardCard>

    <div className="flex items-center justify-between">

        <h2 className="text-xl font-semibold">
            {order.fileName}
        </h2>

        <StatusBadge
            status={order.status}
        />

    </div>

    <div className="mt-4 space-y-2">

        <p>
            Copies: {order.copies}
        </p>

        <p>
            Paper Size: {order.paperSize}
        </p>

        <p>
            Color Print:
            {" "}
            {order.colorPrint ? "Yes" : "No"}
        </p>

        <p>
            Estimated Time:
            {" "}
            {order.estimatedMinutes} mins
        </p>

    </div>

    <a
        href={order.fileUrl}
        target="_blank"
        rel="noreferrer"
        className="
            inline-block
            mt-4
            text-blue-500
            hover:underline
        "
    >
        View File
    </a>

</DashboardCard>
                ))}

            </div>

        </div>
    );
};

export default CustomerDashboard;