import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import RegisterCustomer from "./pages/customer/Register";
import LoginCustomer from "./pages/customer/Login";
import RegisterSeller from "./pages/seller/Register";
import LoginSeller from "./pages/seller/Login";
import SellerDashboard from "./pages/seller/Dashboard";
import CustomerDashboard from "./pages/customer/Dashboard";
import ProfileSectionSeller from "./pages/seller/Profile";
import ProfileSectionCustomer from "./pages/customer/Profile";
import ProductSellerSection from "./pages/seller/Product";
import ProductCustomerSection from "./pages/customer/Product";
import OrderSellerSection from "./pages/seller/Order";
import OrderCustomerSection from "./pages/customer/OrderPage";
import OrderDetailPage from "./pages/customer/OrderDetailPage";
import OrdersPage from "./pages/customer/OrderPage";

function App() {
  return (
    <div className="container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register-customer" element={<RegisterCustomer />} />
          <Route path="/login-customer" element={<LoginCustomer />} />
          <Route path="/register-seller" element={<RegisterSeller />} />
          <Route path="/login-seller" element={<LoginSeller />} />
          <Route path="/dashboard-seller" element={<SellerDashboard />} />
          <Route path="/dashboard-customer" element={<CustomerDashboard />} />
          <Route
            path="/profile-section-seller"
            element={<ProfileSectionSeller />}
          />
          <Route
            path="/profile-section-customer"
            element={<ProfileSectionCustomer />}
          />
          <Route
            path="/product-section-seller"
            element={<ProductSellerSection />}
          />
          <Route
            path="/product-section-customer"
            element={<ProductCustomerSection />}
          />
          <Route
            path="/order-section-seller"
            element={<OrderSellerSection />}
          />
          <Route
            path="/order-section-customer"
            element={<OrderCustomerSection />}
          />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/:id" element={<OrderDetailPage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
