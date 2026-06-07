import { useState } from "react";
import { toast } from "../../utils/toastStore";

import { createPaymentOrder } from "../../api/paymentApi";

import { createOrder, tempUpload } from "../../api/orderApi";

import { useNavigate } from "react-router-dom";

const UploadOrder = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    copies: 1,
    colorPrint: false,
    paperSize: "A4",
  });

  const [file, setFile] = useState(null);
  const [estimate, setEstimate] = useState(null);
  const [tempFileData, setTempFileData] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFileChange = async (e) => {
    try {
      const selectedFile = e.target.files[0];

      setFile(selectedFile);

      const data = new FormData();

      data.append("file", selectedFile);

      const response = await tempUpload(data);

      setTempFileData(response.data);

      toast.success("PDF Uploaded");
    } catch (error) {
      console.log(error);

      toast.error("Upload Failed");
    }
  };
  const handleEstimate = () => {
    if (!tempFileData) {
      toast.error("Upload PDF First");

      return;
    }

    const totalPages = tempFileData.pageCount * formData.copies;

    const estimatedMinutes = Math.max(1, Math.ceil(totalPages / 10));

    const costPerPage = formData.colorPrint ? 5 : 2;

    const totalCost = totalPages * costPerPage;

    setEstimate({
      pageCount: tempFileData.pageCount,

      totalPages,

      estimatedMinutes,

      totalCost,
    });

    toast.success("Estimate Generated");
  };
  const handleSubmit = async () => {
    try {
      const data = new FormData();

      data.append("file", file);

      data.append("copies", formData.copies);

      data.append("colorPrint", formData.colorPrint);

      data.append("paperSize", formData.paperSize);

      const response = await createOrder(data);

      toast.success("Order Uploaded");
    } catch (error) {
      toast.error("Upload Failed");
    }
  };

  const handlePayment = async () => {
    try {
      const response = await createPaymentOrder({
        amount: estimate.totalCost,

        customerName: "Jaya",

        customerEmail: "test@test.com",
      });

      const paymentSessionId = response.data.payment_session_id;

      const cashfree = window.Cashfree({
        mode: "sandbox",
      });

      localStorage.setItem(
        "pendingOrder",
        JSON.stringify({
          formData,
          estimate,
          tempFileData,
        }),
      );

      cashfree.checkout({
        paymentSessionId,

        redirectTarget: "_self",
      });
    } catch (error) {
      console.log(error);

      toast.error("Payment Failed");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <h1 className="text-3xl font-bold mb-6">Upload Print Order</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="border p-3 rounded-lg"
          />

          {tempFileData && (
            <div
              className="
            bg-gray-50
            p-4
            rounded-xl
            border
        "
            >
              <p>
                📄 File:
                <span className="font-semibold ml-2">
                  {tempFileData.fileName}
                </span>
              </p>

              <p>
                📑 Pages:
                <span className="font-semibold ml-2">
                  {tempFileData.pageCount}
                </span>
              </p>
            </div>
          )}

          <input
            type="number"
            name="copies"
            value={formData.copies}
            onChange={handleChange}
            placeholder="Copies"
            className="border p-3 rounded-lg"
          />

          <select
            name="paperSize"
            value={formData.paperSize}
            onChange={handleChange}
            className="border p-3 rounded-lg"
          >
            <option value="A4">A4</option>
            <option value="A3">A3</option>
            <option value="Letter">Letter</option>
          </select>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="colorPrint"
              checked={formData.colorPrint}
              onChange={handleChange}
            />
            Color Print
          </label>

          <button
            type="button"
            onClick={handleEstimate}
            className="
        bg-blue-600
        text-white
        p-3
        rounded-lg
        hover:bg-blue-700
        transition
    "
          >
            Estimate Order
          </button>
        </form>
        {estimate && (
          <div
            className="
            mt-8
            bg-gray-50
            border
            border-gray-200
            rounded-2xl
            p-6
        "
          >
            <h2
              className="
                text-2xl
                font-bold
                mb-4
            "
            >
              Order Summary
            </h2>

            <div
              className="
                flex
                flex-col
                gap-3
                text-lg
            "
            >
              <p>
                📄 Pages:
                <span className="font-semibold ml-2">{estimate.pageCount}</span>
              </p>

              <p>
                🖨 Total Pages:
                <span className="font-semibold ml-2">
                  {estimate.totalPages}
                </span>
              </p>

              <p>
                ⏱ ETA:
                <span className="font-semibold ml-2">
                  {estimate.estimatedMinutes} mins
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
                  ₹{estimate.totalCost}
                </span>
              </p>
            </div>

            <button
              onClick={handlePayment}
              className="
        mt-6
        w-full
        bg-green-600
        text-white
        p-3
        rounded-xl
        hover:bg-green-700
        transition
    "
            >
              Proceed To Payment
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadOrder;
