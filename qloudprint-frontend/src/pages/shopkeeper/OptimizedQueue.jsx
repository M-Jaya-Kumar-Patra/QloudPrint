import { useEffect, useState } from "react";

import {
    getOptimizedQueue
} from "../../api/orderApi";

const OptimizedQueue = () => {

    const [orders, setOrders] = useState([]);

    const fetchQueue = async () => {

        try {

            const response =
                await getOptimizedQueue();

            setOrders(response.data);

        } catch (error) {

            console.log(error);
        }
    };

    useEffect(() => {

        fetchQueue();

    }, []);

    return (
        <div className="min-h-screen bg-gray-100 p-10">

            <h1 className="text-3xl font-bold mb-8">
                Optimized Print Queue
            </h1>

            <div className="grid gap-6">

                {orders.map((order, index) => (

                    <div
                        key={order.id}
                        className="bg-white p-6 rounded-xl shadow flex items-center justify-between"
                    >

                        <div>

                            <h2 className="text-xl font-semibold">
                                #{index + 1}
                                {" "}
                                {order.fileName}
                            </h2>

                            <p>
                                Copies:
                                {" "}
                                {order.copies}
                            </p>

                            <p>
                                Estimated Time:
                                {" "}
                                {order.estimatedMinutes}
                                {" "}
                                mins
                            </p>

                            <p>
                                Priority Score:
                                {" "}
                                {order.priorityScore}
                            </p>

                        </div>

                        <div className="text-right">

                            <p className="font-bold text-blue-600">
                                {order.status}
                            </p>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
};

export default OptimizedQueue;