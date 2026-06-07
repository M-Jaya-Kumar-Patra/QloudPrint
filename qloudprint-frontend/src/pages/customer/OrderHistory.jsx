import { useEffect, useState } from "react";

import { QRCode } from "react-qr-code";

import { getCustomerOrders } from "../../api/orderApi";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);

  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await getCustomerOrders();

      setOrders(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-700";

      case "PRINTING":
        return "bg-blue-100 text-blue-700";

      case "COMPLETED":
        return "bg-green-100 text-green-700";

      case "CANCELLED":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div
        className="
                min-h-screen
                flex
                items-center
                justify-center
            "
      >
        <h1
          className="
                    text-2xl
                    font-bold
                "
        >
          Loading Orders...
        </h1>
      </div>
    );
  }

  return (
    <div
      className="
            min-h-screen
            bg-gray-100
            p-6
        "
    >
      <div
        className="
                max-w-6xl
                mx-auto
            "
      >
        <h1
          className="
                    text-4xl
                    font-bold
                    mb-8
                "
        >
          My Orders
        </h1>

        {orders.length === 0 ? (
          <div
            className="
                            bg-white
                            rounded-2xl
                            shadow-md
                            p-10
                            text-center
                        "
          >
            <h2
              className="
                                text-2xl
                                font-semibold
                            "
            >
              No Orders Yet
            </h2>

            <p
              className="
                                text-gray-500
                                mt-3
                            "
            >
              Upload your first print order.
            </p>
          </div>
        ) : (
          <div
            className="
                            grid
                            md:grid-cols-2
                            lg:grid-cols-3
                            gap-6
                        "
          >
            {orders.map((order) => (
              <div
                key={order.id}
                className="
                                            bg-white
                                            rounded-2xl
                                            shadow-lg
                                            p-6
                                            flex
                                            flex-col
                                            gap-4
                                        "
              >
                <div
                  className="
                                            flex
                                            items-center
                                            justify-between
                                        "
                >
                  <h2
                    className="
                                                text-xl
                                                font-bold
                                            "
                  >
                    {order.orderCode}
                  </h2>

                  <span
                    className={`
                                                px-3
                                                py-1
                                                rounded-full
                                                text-sm
                                                font-semibold
                                                ${getStatusColor(order.status)}
                                            `}
                  >
                    {order.status}
                  </span>
                </div>

                <div
                  className="
                                            space-y-2
                                            text-gray-700
                                        "
                >
                  <p>
                    📄 File:
                    <span
                      className="
                                                    font-medium
                                                    ml-2
                                                "
                    >
                      {order.fileName}
                    </span>
                  </p>

                  <p>
                    🖨 Copies:
                    <span
                      className="
                                                    font-medium
                                                    ml-2
                                                "
                    >
                      {order.copies}
                    </span>
                  </p>

                  <p>
                    📑 Total Pages:
                    <span
                      className="
                                                    font-medium
                                                    ml-2
                                                "
                    >
                      {order.pageCount * order.copies}
                    </span>
                  </p>

                  <p>
                    💰 Total Cost:
                    <span
                      className="
                                                    font-bold
                                                    text-green-600
                                                    ml-2
                                                "
                    >
                      ₹{order.totalCost}
                    </span>
                  </p>

                  <p>
                    ⏱ ETA:
                    <span
                      className="
                                                    font-medium
                                                    ml-2
                                                "
                    >
                      {order.estimatedMinutes} mins
                    </span>
                  </p>
                </div>

                <button
                  onClick={() => setSelectedOrder(order)}
                  className="
                                                mt-4
                                                bg-black
                                                text-white
                                                py-3
                                                rounded-xl
                                                hover:opacity-90
                                                transition
                                            "
                >
                  View QR
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selectedOrder && (
        <div
          className="
                        fixed
                        inset-0
                        bg-black/50
                        flex
                        items-center
                        justify-center
                        z-50
                    "
        >
          <div
            className="
                            bg-white
                            rounded-2xl
                            p-8
                            max-w-sm
                            w-full
                            text-center
                            relative
                        "
          >
            <button
              onClick={() => setSelectedOrder(null)}
              className="
                                    absolute
                                    top-4
                                    right-4
                                    text-xl
                                "
            >
              ✕
            </button>

            <h2
              className="
                                text-2xl
                                font-bold
                                mb-4
                            "
            >
              Pickup QR
            </h2>

            <div
              className="
                                flex
                                justify-center
                                mb-5
                            "
            >
              <QRCode value={selectedOrder.orderCode} size={180} />
            </div>

            <p
              className="
                                font-semibold
                                text-lg
                            "
            >
              {selectedOrder.orderCode}
            </p>

            <p
              className="
                                text-gray-500
                                mt-2
                            "
            >
              Show this QR at pickup.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
