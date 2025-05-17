import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ProfileSection from "./Profile";
import ProductSection from "./Product";
import OrderSection from "./Order";

function SellerDashboard() {
  const [activeSection, setActiveSection] = useState("profile");
  const [userData, setUserData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (!token || userRole !== "SELLER") {
      navigate("/login-seller");
      return;
    }

    // Fetch user data
    const fetchUserData = async () => {
      try {
        const response = await fetch("https://rentease-be-production.up.railway.app/api/users/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const data = await response.json();
        setUserData(data);
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Optional: Add error handling toast or notification
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/login-seller");
  };

  const renderSection = () => {
    switch (activeSection) {
      case "profile":
        return <ProfileSection userData={userData} />;
      case "products":
        return <ProductSection />;
      case "orders":
        return <OrderSection />;
      default:
        return <ProfileSection userData={userData} />;
    }
  };

  return (
    <div className="flex h-screen w-screen bg-gray-100">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-md">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold">Seller Dashboard</h2>
          <p className="text-sm text-gray-500">
            {userData ? userData.name : "Loading..."}
          </p>
        </div>
        <nav className="p-4">
          <ul className="space-y-2">
            <li>
              <button
                onClick={() => setActiveSection("profile")}
                className={`w-full text-left p-2 rounded ${
                  activeSection === "profile"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("products")}
                className={`w-full text-left p-2 rounded ${
                  activeSection === "products"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                My Products
              </button>
            </li>
            <li>
              <button
                onClick={() => setActiveSection("orders")}
                className={`w-full text-left p-2 rounded ${
                  activeSection === "orders"
                    ? "bg-blue-100 text-blue-600"
                    : "hover:bg-gray-100"
                }`}
              >
                Orders
              </button>
            </li>
            <li>
              <button
                onClick={handleLogout}
                className="w-full text-left p-2 rounded hover:bg-red-100 hover:text-red-600"
              >
                Logout
              </button>
            </li>
          </ul>
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-10 overflow-y-auto">{renderSection()}</div>
    </div>
  );
}

export default SellerDashboard;
