import { useEffect, useState }
from "react";

import {
    Html5QrcodeScanner
}
from "html5-qrcode";

import {
    verifyQrOrder,
    updateOrderStatus
}
from "../../api/orderApi";

const ScanQr = () => {

    const [order, setOrder] =
        useState(null);

    useEffect(() => {

        const scanner =
            new Html5QrcodeScanner(
                "reader",
                {
                    fps: 10,
                    qrbox: 250,
                },
                false
            );

        scanner.render(

            async (decodedText) => {
                console.log(decodedText);

                try {

                    const response =
                        await verifyQrOrder(
                            decodedText
                        );

                    setOrder(
                        response.data
                    );

                    scanner.clear();

                } catch (error) {

                    console.log(error);
                }
            },

            (error) => {

                console.log(error);
            }
        );

        return () => {

            scanner.clear()
                .catch(() => {});
        };

    }, []);

    const markCompleted =
        async () => {

            try {

                await updateOrderStatus(
                    order.id,
                    "COMPLETED"
                );

                alert(
                    "Order Completed"
                );

            } catch (error) {

                console.log(error);
            }
        };

    return (

        <div className="
            min-h-screen
            bg-gray-100
            p-6
        ">

            <h1 className="
                text-3xl
                font-bold
                mb-6
            ">
                Scan QR
            </h1>

            {

                !order && (

                    <div
                        id="reader"
                        className="
                            bg-white
                            p-4
                            rounded-xl
                            shadow-lg
                            max-w-md
                        "
                    />
                )
            }

            {

                order && (

                    <div className="
                        mt-8
                        bg-white
                        p-6
                        rounded-xl
                        shadow-lg
                        max-w-md
                    ">

                        <h2 className="
                            text-2xl
                            font-bold
                            mb-4
                        ">
                            Order Found
                        </h2>

                        <div className="
                            space-y-2
                        ">

                            <p>
                                🧾 Code:
                                {" "}
                                {order.orderCode}
                            </p>

                            <p>
                                👤 Customer:
                                {" "}
                                {order.user.name}
                            </p>

                            <p>
                                📄 File:
                                {" "}
                                {order.fileName}
                            </p>

                            <p>
                                💰 Amount:
                                {" "}
                                ₹{order.totalCost}
                            </p>

                            <p>
                                📌 Status:
                                {" "}
                                {order.status}
                            </p>

                        </div>

                        <button
                            onClick={
                                markCompleted
                            }
                            className="
                                mt-6
                                bg-green-600
                                text-white
                                px-6
                                py-3
                                rounded-xl
                            "
                        >
                            Mark Completed
                        </button>

                    </div>
                )
            }

        </div>
    );
};

export default ScanQr;
