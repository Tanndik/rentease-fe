import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userRole, setUserRole] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [showPaymentError, setShowPaymentError] = useState(false);

  useEffect(() => {
    // Get user role from localStorage
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    setUserRole(userData.role || "CUSTOMER");

    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://rentease-be-production.up.railway.app/api/orders/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch order details");
      }

      const data = await response.json();
      setOrder(data);
      setMessages(data.messages || []);

      // Don't automatically fetch payment details as it may fail
      // We'll let the user trigger that manually
      setLoading(false);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  const fetchPaymentDetails = async (orderId) => {
    setLoadingPayment(true);
    setError(""); // Clear previous errors
    setShowPaymentError(false);

    try {
      const token = localStorage.getItem("token");
      console.log(`Fetching payment details for order: ${orderId}`);

      const response = await fetch(
        `https://rentease-be-production.up.railway.app/api/payments/${orderId}/details`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log(`Payment details response status: ${response.status}`);

      // Handle common error cases
      if (response.status === 400) {
        const errorData = await response.json();
        console.log("Payment details error (400):", errorData);

        // Show a specialized error message
        setShowPaymentError(true);
        setError(
          `Payment information not available: ${
            errorData.message || "No payment token found for this order"
          }`
        );
        setLoadingPayment(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Payment details received:", data);

      // Check for expected data structure
      if (!data.va_numbers || data.va_numbers.length === 0) {
        console.log("Response doesn't contain VA numbers:", data);
        setShowPaymentError(true);
        setError("No virtual account numbers found in payment response");
        setLoadingPayment(false);
        return;
      }

      setPaymentDetails(data);
      setLoadingPayment(false);
    } catch (error) {
      console.error("Payment details error:", error);
      setShowPaymentError(true);
      setError(`Failed to load payment details: ${error.message}`);
      setLoadingPayment(false);
    }
  };

  const handlePayment = () => {
    if (order) {
      if (paymentDetails) {
        // If we're already showing payment details, toggle them off
        setPaymentDetails(null);
        return;
      }

      if (order.paymentMethod === "VIRTUAL_ACCOUNT") {
        fetchPaymentDetails(order.id);
      } else if (order.paymentUrl) {
        // For other payment methods, just open the payment URL
        window.open(order.paymentUrl, "_blank");
      }
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `https://rentease-be-production.up.railway.app/api/orders/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update order status");
      }

      // Refresh order details
      fetchOrderDetails();
    } catch (error) {
      setError(error.message);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`https://rentease-be-production.up.railway.app/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: id,
          content: message,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      // Clear message input and refresh order details to show new message
      setMessage("");
      fetchOrderDetails();
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <p className="text-lg">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error || "Order not found"}
        </div>
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Order Details</h1>
        <button
          onClick={() => navigate("/orders")}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Back to Orders
        </button>
      </div>

      {error && !showPaymentError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Order Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Order ID</p>
              <p className="font-medium">{order.id}</p>
            </div>
            <div>
              <p className="text-gray-600">Created At</p>
              <p className="font-medium">
                {new Date(order.createdAt).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Status</p>
              <span
                className={`px-2 py-1 rounded text-xs ${getStatusBadgeColor(
                  order.status
                )}`}
              >
                {order.status}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Payment Status</p>
              <span
                className={`px-2 py-1 rounded text-xs ${getPaymentStatusBadgeColor(
                  order.paymentStatus
                )}`}
              >
                {order.paymentStatus}
              </span>
            </div>
            <div>
              <p className="text-gray-600">Payment Method</p>
              <p className="font-medium">{order.paymentMethod}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Price</p>
              <p className="font-semibold text-lg">
                Rp. {order.totalPrice.toLocaleString()}
              </p>
            </div>

            {/* Payment Actions */}
            {order.paymentStatus !== "PAID" && (
              <div>
                {/* Payment button */}
                <button
                  onClick={handlePayment}
                  disabled={loadingPayment}
                  className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600 mt-4 disabled:bg-gray-400"
                >
                  {loadingPayment
                    ? "Loading Payment Details..."
                    : paymentDetails
                    ? "Hide Payment Details"
                    : "View Payment Details"}
                </button>

                {/* Alternative payment URL link */}
                {order.paymentUrl && (
                  <div className="mt-2 text-center">
                    <a
                      href={order.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Or pay directly on payment gateway
                    </a>
                  </div>
                )}

                {/* Payment Error Display */}
                {showPaymentError && error && (
                  <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
                    <p className="font-medium text-red-800">
                      Unable to show VA details
                    </p>
                    <p className="text-red-700 mt-1">{error}</p>
                    {order.paymentUrl && (
                      <p className="mt-2">
                        Please use the "Pay directly" link above to complete
                        your payment.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Virtual Account Payment Details */}
            {paymentDetails && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-lg mb-2">
                  Virtual Account Payment
                </h3>

                <div className="space-y-3">
                  {paymentDetails.va_numbers &&
                  paymentDetails.va_numbers.length > 0 ? (
                    paymentDetails.va_numbers.map((va, index) => (
                      <div key={index} className="border-b pb-2">
                        <p className="font-medium">{va.bank} Virtual Account</p>
                        <div className="flex items-center mt-1">
                          <p className="text-lg font-mono bg-gray-100 px-2 py-1 rounded">
                            {va.va_number}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(va.va_number);
                              alert("VA Number copied to clipboard!");
                            }}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            Copy
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="border-b pb-2">
                      <p className="text-red-500">
                        No VA numbers found in the payment details
                      </p>
                    </div>
                  )}

                  <div>
                    <p className="font-medium">Amount to Pay</p>
                    <p className="text-lg">
                      Rp. {" "}
                      {parseInt(
                        paymentDetails.gross_amount || "0"
                      ).toLocaleString()}
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">Payment Status</p>
                    <p className="capitalize">
                      {paymentDetails.transaction_status || "Unknown"}
                    </p>
                  </div>

                  {paymentDetails.expiry_time && (
                    <div>
                      <p className="font-medium">Expires At</p>
                      <p>
                        {new Date(paymentDetails.expiry_time).toLocaleString()}
                      </p>
                    </div>
                  )}

                  <div className="pt-2">
                    <div className="bg-yellow-50 p-3 rounded border border-yellow-100">
                      <p className="text-sm">
                        <span className="font-semibold">
                          Payment Instructions:
                        </span>{" "}
                        Transfer the exact amount to the virtual account number
                        above before the expiry time. The payment will be
                        confirmed automatically.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Rest of the component remains the same */}
        {/* Car & Rental Period */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Car Information</h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Car</p>
              <p className="font-medium">
                {order.car.brand} {order.car.model} ({order.car.year})
              </p>
            </div>
            <div>
              <p className="text-gray-600">License Plate</p>
              <p className="font-medium">{order.car.licensePlate}</p>
            </div>
            <div>
              <p className="text-gray-600">Rental Period</p>
              <div>
                <p className="font-medium">
                  From: {new Date(order.startDate).toLocaleDateString()}
                </p>
                <p className="font-medium">
                  To: {new Date(order.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <p className="text-gray-600">Number of Days</p>
              <p className="font-medium">
                {Math.ceil(
                  (new Date(order.endDate) - new Date(order.startDate)) /
                    (1000 * 60 * 60 * 24)
                )}{" "}
                days
              </p>
            </div>
            <div>
              <p className="text-gray-600">Daily Rate</p>
              <p className="font-medium">
                Rp. {order.car.price.toLocaleString()} / day
              </p>
            </div>
          </div>
        </div>

        {/* Seller Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {userRole === "SELLER"
              ? "Customer Information"
              : "Seller Information"}
          </h2>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600">Name</p>
              <p className="font-medium">
                {userRole === "SELLER"
                  ? order.customer.name
                  : order.seller.name}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Email</p>
              <p className="font-medium">
                {userRole === "SELLER"
                  ? order.customer.email
                  : order.seller.email}
              </p>
            </div>
            <div>
              <p className="text-gray-600">Phone</p>
              <p className="font-medium">
                {userRole === "SELLER"
                  ? order.customer.phoneNumber
                  : order.seller.phoneNumber}
              </p>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="space-y-4">
            {/* Status update buttons based on role and current status */}
            {userRole === "SELLER" &&
              order.status === "PENDING" &&
              order.paymentStatus === "PAID" && (
                <button
                  onClick={() => handleStatusUpdate("CONFIRMED")}
                  className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Confirm Order
                </button>
              )}

            {userRole === "SELLER" && order.status === "CONFIRMED" && (
              <button
                onClick={() => handleStatusUpdate("ONGOING")}
                className="w-full py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
              >
                Start Rental
              </button>
            )}

            {userRole === "SELLER" && order.status === "ONGOING" && (
              <button
                onClick={() => handleStatusUpdate("COMPLETED")}
                className="w-full py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                Complete Rental
              </button>
            )}

            {order.status === "PENDING" && (
              <button
                onClick={() => handleStatusUpdate("CANCELLED")}
                className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Messages Section */}
      <div className="mt-8 bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Messages</h2>

        <div className="border rounded-lg p-4 mb-4 max-h-80 overflow-y-auto">
          {messages.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No messages yet</p>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg ${
                    msg.sender.id ===
                    (userRole === "SELLER" ? order.sellerId : order.customerId)
                      ? "bg-blue-100 ml-8"
                      : "bg-gray-100 mr-8"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="font-medium">{msg.sender.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatDate(msg.createdAt)}
                    </p>
                  </div>
                  <p>{msg.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={sendMessage} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type your message..."
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default OrderDetailPage;
