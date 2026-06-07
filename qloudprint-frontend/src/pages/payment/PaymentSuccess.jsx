import { useEffect, useState, useRef  } from "react";

import { useNavigate }
from "react-router-dom";

import { toast }
from "../../utils/toastStore";

import { verifyPayment }
from "../../api/paymentApi";

import { createOrder }
from "../../api/orderApi";

import { QRCode } from "react-qr-code";


const PaymentSuccess = () => {

    const navigate = useNavigate();
    
    const hasVerified =
    useRef(false);

    const [orderSuccess, setOrderSuccess] =
    useState(false);

const [orderData, setOrderData] =
    useState(null);

    useEffect(() => {

    if (hasVerified.current) {
        return;
    }

    hasVerified.current = true;

        const verify = async () => {

            try {

                const params =
                    new URLSearchParams(
                        window.location.search
                    );

                const orderId =
                    params.get("order_id");

                const pendingOrder =
                    JSON.parse(
                        localStorage.getItem(
                            "pendingOrder"
                        )
                    );

                if (!pendingOrder) {

                    toast.error(
                        "Pending order missing"
                    );

                    navigate("/");

                    return;
                }

                const verifyResponse =
                    await verifyPayment(orderId);

                if (verifyResponse.data.success) {

                    console.log(pendingOrder);

                    const orderResponse = await createOrder({
                        paymentOrderId: orderId,

                        fileUrl:
                            pendingOrder.tempFileData.fileUrl,

                        fileName:
                            pendingOrder.tempFileData.fileName,

                        pageCount:
                            pendingOrder.tempFileData.pageCount,

                        copies:
                            pendingOrder.formData.copies,

                        colorPrint:
                            pendingOrder.formData.colorPrint,

                        paperSize:
                            pendingOrder.formData.paperSize
                    });


                    console.log(orderResponse.data);
                    

                    setOrderSuccess(true);

setOrderData(orderResponse.data);

setTimeout(() => {

    localStorage.removeItem(
                        "pendingOrder"
                    );

    navigate("/customer/dashboard");

}, 4000);

                } else {

                    toast.error(
                        "Payment Verification Failed"
                    );
                }

            } catch (error) {

                console.log(error);

                console.log(error.response);

                console.log(error.response?.data);

                toast.error(
                    "Order creation failed"
                );
            }
        };

        verify();

    }, []);

    return (

    <div className="
        min-h-screen
        flex
        items-center
        justify-center
        bg-gray-50
        px-4
    ">

        {

            orderSuccess ? (

                <div className="
                    bg-white
                    shadow-xl
                    rounded-2xl
                    p-10
                    max-w-md
                    w-full
                    text-center
                ">

                    <div className="
                        text-6xl
                        mb-4
                    ">
                        ✅
                    </div>

                    <h1 className="
                        text-3xl
                        font-bold
                        text-green-600
                    ">
                        Order Confirmed
                    </h1>

                    <p className="
                        text-gray-600
                        mt-3
                    ">
                        Your print request has been
                        successfully placed.
                    </p>

                    <div className="
                        mt-6
                        space-y-2
                        text-left
                    ">

                        <div>
                            📄 Pages:
                            <strong>
                                {" "}
                                {orderData?.totalPages}
                            </strong>
                        </div>

                        <div>
                            💰 Total:
                            <strong>
                                {" "}
                                ₹{orderData?.totalCost}
                            </strong>
                        </div>

                        <div>
                            ⏱ Estimated Pickup:
                            <strong>
                                {" "}
                                {orderData?.estimatedMinutes}
                                {" "}minutes
                            </strong>
                        </div>

                        <div>
    🧾 Order Code:
    <strong>
        {" "}
        {orderData?.orderCode}
    </strong>
</div>

{
    orderData?.orderCode && (

        <div className="mt-6 flex justify-center">

            <QRCode
                value={orderData.orderCode}
                size={140}
            />

        </div>
    )
}

                    </div>

                    <p className="
                        mt-6
                        text-sm
                        text-gray-500
                    ">
                        You will be redirected to
                        dashboard shortly...
                    </p>

                </div>

            ) : (

                <div className="
                    text-center
                ">

                    <h1 className="
                        text-3xl
                        font-bold
                    ">
                        Verifying Payment...
                    </h1>

                    <p className="
                        mt-3
                        text-gray-500
                    ">
                        Please wait while we
                        confirm your payment.
                    </p>

                </div>
            )
        }

    </div>
);
};

export default PaymentSuccess;