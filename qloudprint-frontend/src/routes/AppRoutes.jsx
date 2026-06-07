import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/common/Navbar";

import Home from "../pages/public/Home";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

import CustomerDashboard from "../pages/customer/CustomerDashboard";
import ShopkeeperDashboard from "../pages/shopkeeper/ShopkeeperDashboard";

import UploadOrder from "../pages/customer/UploadOrder";

import ProtectedRoute from "./ProtectedRoute";
import OptimizedQueue from "../pages/shopkeeper/OptimizedQueue";
import DashboardLayout from "../layouts/DashboardLayout";
import PaymentSuccess from "../pages/payment/PaymentSuccess";
import OrderHistory from "../pages/customer/OrderHistory";
import ScanQr from "../pages/shopkeeper/ScanQr";
import ShopProfile from "../pages/shopkeeper/ShopProfile";
import PlatformAnalytics from "../pages/admin/PlatformAnalytics";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
    path="/payment-success"
    element={<PaymentSuccess />}
/>

        <Route
          path="/customer/dashboard"
          element={
           <ProtectedRoute>
    <DashboardLayout>
        <CustomerDashboard />
    </DashboardLayout>
</ProtectedRoute>
          }
        />

        <Route
          path="/customer/orders"
          element={
           <ProtectedRoute>
    <DashboardLayout>
        <OrderHistory />
    </DashboardLayout>
</ProtectedRoute>
          }
        />

        <Route
          path="/shopkeeper/dashboard"
          element={
            <ProtectedRoute>
            <DashboardLayout>
                <ShopkeeperDashboard />
            </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopkeeper/optimized-queue"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <OptimizedQueue />
            </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <UploadOrder />
            </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/shopkeeper/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <ShopProfile />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <PlatformAnalytics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        <Route
    path="/shopkeeper/scan-qr"
    element={<ScanQr />}
/>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
