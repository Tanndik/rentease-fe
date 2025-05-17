import { useState, useEffect } from "react";

export default function OrderSection() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const [processingOrderId, setProcessingOrderId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");

      // Add status filter if not "ALL"
      const queryParam =
        selectedStatus !== "ALL" ? `?status=${selectedStatus}` : "";

      const response = await fetch(
        `https://rentease-be-production.up.railway.app/api/orders/seller${queryParam}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch orders");
      }

      const data = await response.json();

      // Sort orders: PENDING first, then by creation date (newest first)
      const sortedOrders = data.sort((a, b) => {
        // Priority status order
        const statusPriority = {
          PENDING: 1,
          CONFIRMED: 2,
          ONGOING: 3,
          COMPLETED: 4,
          CANCELLED: 5,
        };

        // First sort by status priority
        const statusDiff = statusPriority[a.status] - statusPriority[b.status];
        if (statusDiff !== 0) return statusDiff;

        // Then sort by date (newest first)
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(sortedOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setProcessingOrderId(orderId);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `https://rentease-be-production.up.railway.app/api/orders/${orderId}/status`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update order status");
      }

      // Show success message
      alert(`Order successfully ${newStatus.toLowerCase()}`);

      // Refresh orders
      fetchOrders();
    } catch (error) {
      console.error("Error updating order status:", error);
      alert(error.message);
    } finally {
      setProcessingOrderId(null);
    }
  };

  const renderStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-blue-100 text-blue-800";
      case "ONGOING":
        return "bg-indigo-100 text-indigo-800";
      case "COMPLETED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderPaymentStatus = (status) => {
    switch (status) {
      case "PAID":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Paid
          </span>
        );
      case "PENDING":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800">
            Payment Pending
          </span>
        );
      case "FAILED":
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
            Payment Failed
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        <p>Error: {error}</p>
        <button
          onClick={fetchOrders}
          className="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">Manage Orders</h2>
        <p className="text-gray-600 mt-1">View and manage your rental orders</p>

        <div className="mt-4 flex flex-wrap gap-2">
          {[
            "ALL",
            "PENDING",
            "CONFIRMED",
            "ONGOING",
            "COMPLETED",
            "CANCELLED",
          ].map((status) => (
            <button
              key={status}
              onClick={() => setSelectedStatus(status)}
              className={`px-4 py-2 rounded-md transition-colors ${
                selectedStatus === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-lg font-medium text-gray-900">
            No orders found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {selectedStatus === "ALL"
              ? "You don't have any orders yet."
              : `You don't have any ${selectedStatus.toLowerCase()} orders.`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="bg-white shadow rounded-lg overflow-hidden border border-gray-200"
            >
              <div className="px-6 py-4">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                  <div>
                    <div className="flex items-center">
                      <h3 className="text-lg font-semibold">
                        Order #{order.id.slice(-6)}
                      </h3>
                      <span className="ml-3">
                        {renderPaymentStatus(order.paymentStatus)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm">
                      Created: {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <span
                    className={`mt-2 md:mt-0 px-3 py-1 rounded-full text-sm font-medium ${renderStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>

                <div className="flex flex-col md:flex-row">
                  {order.car?.imageUrl && (
                    <div className="w-full md:w-1/4 mb-4 md:mb-0">
                      <img
                        src={order.car.imageUrl}
                        alt={order.car.name}
                        className="w-full h-48 object-cover rounded-md"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = "/api/placeholder/400/320";
                        }}
                      />
                    </div>
                  )}
                  <div className="w-full md:w-3/4 md:pl-6">
                    <h4 className="text-lg font-medium">{order.car?.name}</h4>
                    <p className="text-gray-600">
                      {order.car?.brand} {order.car?.model} ({order.car?.year})
                    </p>

                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm text-gray-500">Rental Period</p>
                        <p className="font-medium">
                          {formatDate(order.startDate).split(",")[0]} -{" "}
                          {formatDate(order.endDate).split(",")[0]}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Payment Method</p>
                        <p className="font-medium">
                          {order.paymentMethod.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-blue-600 font-bold text-xl">
                      Rp. {order.totalPrice.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                <div className="flex flex-wrap gap-2">
                  {order.status === "PENDING" && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, "CONFIRMED")}
                        disabled={processingOrderId === order.id}
                        className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                      >
                        {processingOrderId === order.id
                          ? "Processing..."
                          : "Confirm Order"}
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, "CANCELLED")}
                        disabled={processingOrderId === order.id}
                        className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
                      >
                        {processingOrderId === order.id
                          ? "Processing..."
                          : "Cancel Order"}
                      </button>
                    </>
                  )}
                  {order.status === "CONFIRMED" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "ONGOING")}
                      disabled={processingOrderId === order.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {processingOrderId === order.id
                        ? "Processing..."
                        : "Start Rental"}
                    </button>
                  )}
                  {order.status === "ONGOING" && (
                    <button
                      onClick={() => updateOrderStatus(order.id, "COMPLETED")}
                      disabled={processingOrderId === order.id}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50"
                    >
                      {processingOrderId === order.id
                        ? "Processing..."
                        : "Complete Rental"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
