import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import DashboardLayout from "../layouts/DashboardLayout";

const Home = lazy(() => import("../pages/public/Home"));
const Login = lazy(() => import("../pages/auth/Login"));
const Register = lazy(() => import("../pages/auth/Register"));
const ForgotPassword = lazy(() => import("../pages/auth/ForgotPassword"));
const CustomerDashboard = lazy(() => import("../pages/customer/CustomerDashboard"));
const ShopkeeperDashboard = lazy(() => import("../pages/shopkeeper/ShopkeeperDashboard"));
const UploadOrder = lazy(() => import("../pages/customer/UploadOrder"));
const OptimizedQueue = lazy(() => import("../pages/shopkeeper/OptimizedQueue"));
const PaymentSuccess = lazy(() => import("../pages/payment/PaymentSuccess"));
const OrderHistory = lazy(() => import("../pages/customer/OrderHistory"));
const ScanQr = lazy(() => import("../pages/shopkeeper/ScanQr"));
const ShopProfile = lazy(() => import("../pages/shopkeeper/ShopProfile"));
const PlatformAnalytics = lazy(() => import("../pages/admin/PlatformAnalytics"));
const ManualPayouts = lazy(() => import("../pages/admin/ManualPayouts"));
const AccountProfile = lazy(() => import("../pages/account/AccountProfile"));
const ShopPublicProfile = lazy(() => import("../pages/customer/ShopPublicProfile"));

const lazyPublicPage = (exportName) =>
  lazy(() =>
    import("../pages/public/PublicInfoPages").then((module) => ({
      default: module[exportName],
    }))
  );

const AboutUs = lazyPublicPage("AboutUs");
const ContactUs = lazyPublicPage("ContactUs");
const FAQ = lazyPublicPage("FAQ");
const PickupPolicy = lazyPublicPage("PickupPolicy");
const PricingPolicy = lazyPublicPage("PricingPolicy");
const PrivacyPolicy = lazyPublicPage("PrivacyPolicy");
const RefundCancellationPolicy = lazyPublicPage("RefundCancellationPolicy");
const Sitemap = lazyPublicPage("Sitemap");
const TermsConditions = lazyPublicPage("TermsConditions");

const RouteLoader = () => (
  <div className="min-h-screen bg-slate-50 dark:bg-slate-950" />
);

const ProtectedDashboardRoute = ({ children }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const AppRoutes = () => {
  return (
      <Suspense fallback={<RouteLoader />}>
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
          <Route path="/payment-success" element={<PaymentSuccess />} />

          <Route path="/customer/dashboard" element={<ProtectedDashboardRoute><CustomerDashboard /></ProtectedDashboardRoute>} />
          <Route path="/customer/orders" element={<ProtectedDashboardRoute><OrderHistory /></ProtectedDashboardRoute>} />
          <Route path="/shopkeeper/dashboard" element={<ProtectedDashboardRoute><ShopkeeperDashboard /></ProtectedDashboardRoute>} />
          <Route path="/shopkeeper/optimized-queue" element={<ProtectedDashboardRoute><OptimizedQueue /></ProtectedDashboardRoute>} />
          <Route path="/upload" element={<ProtectedDashboardRoute><UploadOrder /></ProtectedDashboardRoute>} />
          <Route path="/shopkeeper/profile" element={<ProtectedDashboardRoute><ShopProfile /></ProtectedDashboardRoute>} />
          <Route path="/customer/shops/:shopId" element={<ProtectedDashboardRoute><ShopPublicProfile /></ProtectedDashboardRoute>} />
          <Route path="/account" element={<ProtectedDashboardRoute><AccountProfile /></ProtectedDashboardRoute>} />
          <Route path="/admin/analytics" element={<ProtectedDashboardRoute><PlatformAnalytics /></ProtectedDashboardRoute>} />
          <Route path="/admin/payouts" element={<ProtectedDashboardRoute><ManualPayouts /></ProtectedDashboardRoute>} />
          <Route path="/shopkeeper/scan-qr" element={<ScanQr />} />
        </Routes>
      </Suspense>
  );
};

export default AppRoutes;
