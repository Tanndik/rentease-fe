import React, { useState, useEffect } from "react";

function ProductSection() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCar, setNewCar] = useState({
    name: "",
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    price: "",
    description: "",
    imageUrl: null,
  });

  useEffect(() => {
    fetchUserCars();
  }, []);

  const fetchUserCars = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      console.log("Fetching cars from: https://rentease-be.vercel.app/api/cars/my-cars");

      const response = await fetch("https://rentease-be.vercel.app/api/cars/my-cars", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed with status: ${response.status}`
        );
      }

      const data = await response.json();
      console.log("Fetched cars:", data);
      setCars(data);
      setError(null);
    } catch (error) {
      console.error("Error fetching user cars:", error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCar = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        throw new Error("Authentication token not found. Please log in again.");
      }

      // Log the newCar state before submission
      console.log("New Car Data:", newCar);

      // Use JSON instead of FormData for initial debugging
      const response = await fetch("https://rentease-be.vercel.app/api/cars", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCar),
      });

      // Parse response
      const responseData = await response.json();
      console.log("Response Status:", response.status);
      console.log("Response Data:", responseData);

      if (!response.ok) {
        throw new Error(responseData.message || "Failed to add car");
      }

      // Reset form and update state
      setNewCar({
        name: "",
        brand: "",
        model: "",
        year: "",
        licensePlate: "",
        price: "",
        description: "",
        imageUrl: null,
      });
      setIsAddModalOpen(false);

      // Refresh the car list
      fetchUserCars();
    } catch (error) {
      console.error("Error adding car:", error);
      alert(error.message);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;

    // Log each input change
    console.log(`Input Change - Name: ${name}, Value:`, value);

    setNewCar((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  if (loading) {
    return <div className="text-center py-10">Loading your cars...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-red-500">{error}</p>
        <button
          onClick={fetchUserCars}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">My Cars</h2>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Add New Car
        </button>
      </div>

      {/* Car Grid */}
      {cars.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500">You don't have any cars listed yet.</p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add Your First Car
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cars.map((car) => (
            <div key={car.id} className="bg-white shadow-md rounded-lg p-4">
              {car.imageUrl && (
                <img
                  src={car.imageUrl}
                  alt={car.name}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <h3 className="text-xl font-semibold">{car.name}</h3>
              <p className="text-gray-600">
                {car.brand} {car.model} ({car.year})
              </p>
              <p className="text-blue-600 font-bold mt-2">
                {typeof car.price === "number"
                  ? `Rp ${car.price.toLocaleString()}`
                  : `Rp ${car.price}`}
              </p>
              <p className="text-sm text-gray-500 mt-2">{car.description}</p>
              <div className="mt-2">
                <span
                  className={`px-2 py-1 rounded text-sm ${
                    car.isAvailable
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {car.isAvailable ? "Available" : "Not Available"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Car Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-8 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">Add New Car</h2>
            <form onSubmit={handleAddCar} className="space-y-4">
              <input
                type="text"
                name="name"
                value={newCar.name}
                onChange={handleInputChange}
                placeholder="Car Name"
                required
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                name="brand"
                value={newCar.brand}
                onChange={handleInputChange}
                placeholder="Brand"
                required
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                name="model"
                value={newCar.model}
                onChange={handleInputChange}
                placeholder="Model"
                required
                className="w-full border rounded-md p-2"
              />
              <input
                type="number"
                name="year"
                value={newCar.year}
                onChange={handleInputChange}
                placeholder="Year"
                required
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                name="licensePlate"
                value={newCar.licensePlate}
                onChange={handleInputChange}
                placeholder="License Plate"
                required
                className="w-full border rounded-md p-2"
              />
              <input
                type="number"
                name="price"
                value={newCar.price}
                onChange={handleInputChange}
                placeholder="Price"
                required
                className="w-full border rounded-md p-2"
              />
              <textarea
                name="description"
                value={newCar.description}
                onChange={handleInputChange}
                placeholder="Description"
                className="w-full border rounded-md p-2"
              />
              <input
                type="text"
                name="imageUrl"
                placeholder="Image URL"
                onChange={handleInputChange}
                className="w-full border rounded-md p-2"
              />
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md"
                >
                  Add Car
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductSection;
