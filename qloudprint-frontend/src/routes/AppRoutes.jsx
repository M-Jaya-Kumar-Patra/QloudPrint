import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "../components/common/Navbar";

import Home from "../pages/public/Home";
import {
  AboutUs,
  ContactUs,
  FAQ,
  PickupPolicy,
  PricingPolicy,
  PrivacyPolicy,
  RefundCancellationPolicy,
  Sitemap,
  TermsConditions
} from "../pages/public/PublicInfoPages";

import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import VerifyEmail from "../pages/auth/VerifyEmail";

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
import AccountProfile from "../pages/account/AccountProfile";
import ShopPublicProfile from "../pages/customer/ShopPublicProfile";

const AppRoutes = () => {
  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/pricing" element={<PricingPolicy />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/terms-and-conditions" element={<TermsConditions />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/refund-cancellation-policy" element={<RefundCancellationPolicy />} />
        <Route path="/pickup-policy" element={<PickupPolicy />} />
        <Route path="/sitemap" element={<Sitemap />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

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
          path="/customer/shops/:shopId"
          element={
           <ProtectedRoute>
    <DashboardLayout>
        <ShopPublicProfile />
    </DashboardLayout>
</ProtectedRoute>
          }
        />

        <Route
          path="/account"
          element={
           <ProtectedRoute>
    <DashboardLayout>
        <AccountProfile />
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
