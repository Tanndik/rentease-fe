import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const OrderForm = ({ car, onClose }) => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("VIRTUAL_ACCOUNT");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Calculate total price based on selected dates
  const calculateTotalPrice = () => {
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    return days > 0 ? days * car.price : 0;
  };

  const totalPrice = calculateTotalPrice();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://rentease-be-production.up.railway.app/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          carId: car.id,
          startDate,
          endDate,
          paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order");
      }

      setIsLoading(false);
      
      // If we have a payment URL from Midtrans, redirect to it
      if (data.order.paymentUrl) {
        window.location.href = data.order.paymentUrl;
      } else {
        // Otherwise, redirect to the orders page
        navigate("/orders");
      }
    } catch (error) {
      setIsLoading(false);
      setError(error.message);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6">Book This Car</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full p-2 border rounded"
            min={new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full p-2 border rounded"
            min={startDate || new Date().toISOString().split("T")[0]}
            required
          />
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            <option value="VIRTUAL_ACCOUNT">Virtual Account</option>
            <option value="CASH">Cash on Delivery</option>
          </select>
        </div>
        
        <div className="mb-6">
          <h3 className="text-lg font-semibold">Order Summary</h3>
          <div className="flex justify-between mt-2">
            <span>Car:</span>
            <span>{car.brand} {car.model}</span>
          </div>
          <div className="flex justify-between">
            <span>Price per day:</span>
            <span>Rp. {car.price.toLocaleString()}</span>
          </div>
          <div className="flex justify-between font-bold text-lg mt-2">
            <span>Total Price:</span>
            <span>Rp. {totalPrice.toLocaleString()}</span>
          </div>
        </div>
        
        <div className="flex justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Place Order"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm;