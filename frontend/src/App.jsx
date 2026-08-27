import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Signup";
import { useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Menu from "./pages/customer/Menu";
import MenuManagement from "./pages/admin/MenuManagement";
import Cart from "./pages/customer/Cart";
import OrderTracking from "./pages/customer/OrderTracking";
import { Link } from "react-router-dom";
import KitchenQueue from "./pages/kitchen/KitchenQueue";
import WaiterDashboard from "./pages/waiter/WaiterDashboard";
import TableManagement from "./pages/admin/TableManagement";
import AdminOrders from "./pages/admin/AdminOrders";
import RiderDashboard from "./pages/rider/RiderDashboard";
import DashboardOverview from "./pages/admin/DashboardOverview";
import AiReport from "./pages/admin/AiReport";
import PromotionManagement from "./pages/admin/PromotionManagement";
import SystemSettings from "./pages/admin/SystemSettings";
import Navbar from "./components/common/Navbar";
import AdminLayout from "./components/admin/AdminLayout";
import NotFound from "./pages/NotFound";
import Home from "./pages/customer/Home";
import UserManagement from "./pages/admin/UserManagement";
import MyOrders from "./pages/customer/MyOrders";
import { AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order/:orderId" element={<OrderTracking />} />
        <Route
          path="/kitchen"
          element={
            <ProtectedRoute allowedRoles={["kitchen"]}>
              <KitchenQueue />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-dashboard-bg.jpg">
                <DashboardOverview />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-menu-bg.jpg">
                <MenuManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/waiter"
          element={
            <ProtectedRoute allowedRoles={["waiter"]}>
              <WaiterDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/tables"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-tables-bg.jpg">
                <TableManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-users-bg.jpg">
                <UserManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-orders-bg.jpg">
                <AdminOrders />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/rider"
          element={
            <ProtectedRoute allowedRoles={["rider"]}>
              <RiderDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-orders"
          element={
            <ProtectedRoute allowedRoles={["customer"]}>
              <MyOrders />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/ai-report"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-ai-report-bg.jpg">
                <AiReport />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/promotions"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-promotions-bg.jpg">
                <PromotionManagement />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout backgroundImage="/images/admin-settings-bg.jpg">
                <SystemSettings />
              </AdminLayout>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
}

export default App;