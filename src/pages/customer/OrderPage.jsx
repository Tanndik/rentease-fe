import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    // Get user role from localStorage or context
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(userData.role || "CUSTOMER");
    
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = userRole === "SELLER" ? "/seller" : "/customer";
      
      const response = await fetch(`http://localhost:5000/api/orders${endpoint}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch orders");
      }
      
      const data = await response.json();
      setOrders(data);
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }
      
      // Refresh orders list
      fetchOrders();
    } catch (error) {
      setError(error.message);
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-purple-100 text-purple-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "REFUNDED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p className="text-lg">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {orders.length === 0 ? (
        <div className="bg-blue-50 p-4 rounded">
          <p>No orders found. Go to the cars page to rent a car.</p>
          <Link to="/cars" className="text-blue-600 hover:underline mt-2 inline-block">
            Browse Cars
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-3 text-left">Car</th>
                <th className="p-3 text-left">Dates</th>
                <th className="p-3 text-left">Price</th>
                <th className="p-3 text-left">Status</th>
                <th className="p-3 text-left">Payment</th>
                <th className="p-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} className="border-t">
                  <td className="p-3">
                    <div>
                      <p className="font-semibold">{order.car.brand} {order.car.model}</p>
                      <p className="text-sm text-gray-600">{order.car.year}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    <div>
                      <p>From: {new Date(order.startDate).toLocaleDateString()}</p>
                      <p>To: {new Date(order.endDate).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="p-3">
                    ${order.totalPrice.toLocaleString()}
                  </td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div>
                      <span className={`px-2 py-1 rounded text-xs ${getPaymentStatusBadgeColor(order.paymentStatus)}`}>
                        {order.paymentStatus}
                      </span>
                      <p className="text-sm mt-1">{order.paymentMethod}</p>
                      {order.paymentUrl && order.paymentStatus !== "PAID" && (
                        <a 
                          href={order.paymentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm block mt-1"
                        >
                          Pay Now
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="p-3">
                    <div className="flex flex-col space-y-2">
                      <Link 
                        to={`/orders/${order.id}`}
                        className="px-3 py-1 bg-blue-500 text-white text-sm rounded text-center"
                      >
                        View Details
                      </Link>
                      
                      {/* Status update buttons based on current status and user role */}
                      {userRole === "SELLER" && order.status === "PENDING" && order.paymentStatus === "PAID" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "CONFIRMED")}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                        >
                          Confirm Order
                        </button>
                      )}
                      
                      {userRole === "SELLER" && order.status === "CONFIRMED" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "ONGOING")}
                          className="px-3 py-1 bg-purple-500 text-white text-sm rounded"
                        >
                          Start Rental
                        </button>
                      )}
                      
                      {userRole === "SELLER" && order.status === "ONGOING" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                          className="px-3 py-1 bg-green-500 text-white text-sm rounded"
                        >
                          Complete Rental
                        </button>
                      )}
                      
                      {order.status === "PENDING" && (
                        <button
                          onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                          className="px-3 py-1 bg-red-500 text-white text-sm rounded"
                        >
                          Cancel Order
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;