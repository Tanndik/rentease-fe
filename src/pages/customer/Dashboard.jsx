import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, ShoppingCart, Car } from "lucide-react";
import ProfileSection from "./Profile";
import ProductSection from "./Product";
import OrderSection from "./OrderPage";

const CustomerDashboard = () => {
  const [activeSection, setActiveSection] = useState("profile");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login-customer");
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-gray-800 text-white p-6">
        <h1 className="text-2xl font-bold mb-10">Customer Dashboard</h1>

        <nav className="space-y-4">
          <button
            onClick={() => setActiveSection("profile")}
            className={`w-full flex items-center p-3 rounded ${
              activeSection === "profile" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <User className="mr-3" />
            Profile
          </button>

          <button
            onClick={() => setActiveSection("products")}
            className={`w-full flex items-center p-3 rounded ${
              activeSection === "products" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <Car className="mr-3" />
            Products
          </button>

          <button
            onClick={() => setActiveSection("orders")}
            className={`w-full flex items-center p-3 rounded ${
              activeSection === "orders" ? "bg-blue-600" : "hover:bg-gray-700"
            }`}
          >
            <ShoppingCart className="mr-3" />
            My Orders
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded hover:bg-red-600 mt-10"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-gray-100 overflow-y-auto">
        {activeSection === "profile" && <ProfileSection />}
        {activeSection === "products" && <ProductSection />}
        {activeSection === "orders" && <OrderSection />}
      </div>
    </div>
  );
};

export default CustomerDashboard;
