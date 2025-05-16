import React, { useState, useEffect } from "react";
import OrderForm from "./OrderForm";

const ProductsSection = () => {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({
    brand: "",
    minYear: "",
    maxYear: "",
    minPrice: "",
    maxPrice: "",
  });
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);
  const [showOrderForm, setShowOrderForm] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [products, filters]);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("https://rentease-be.vercel.app/api/cars", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      setProducts(data);
      setFilteredProducts(data);
    } catch (error) {
      console.error("Failed to fetch products");
    }
  };

  const applyFilters = () => {
    let result = products;

    if (filters.brand) {
      result = result.filter((product) =>
        product.brand.toLowerCase().includes(filters.brand.toLowerCase())
      );
    }

    if (filters.minYear) {
      result = result.filter(
        (product) => product.year >= parseInt(filters.minYear)
      );
    }

    if (filters.maxYear) {
      result = result.filter(
        (product) => product.year <= parseInt(filters.maxYear)
      );
    }

    if (filters.minPrice) {
      result = result.filter(
        (product) => product.price >= parseFloat(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      result = result.filter(
        (product) => product.price <= parseFloat(filters.maxPrice)
      );
    }

    setFilteredProducts(result);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleOrderClick = (product) => {
    setSelectedCar(product);
    setShowOrderForm(true);
  };

  const closeOrderForm = () => {
    setShowOrderForm(false);
    setSelectedCar(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Available Cars</h2>

      <div className="mb-6 grid grid-cols-5 gap-4">
        <input
          type="text"
          name="brand"
          placeholder="Brand"
          value={filters.brand}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="minYear"
          placeholder="Min Year"
          value={filters.minYear}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="maxYear"
          placeholder="Max Year"
          value={filters.maxYear}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="minPrice"
          placeholder="Min Price"
          value={filters.minPrice}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
        <input
          type="number"
          name="maxPrice"
          placeholder="Max Price"
          value={filters.maxPrice}
          onChange={handleFilterChange}
          className="p-2 border rounded"
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="border rounded p-4">
            <img
              src={product.imageUrl || "/api/placeholder/300/200"}
              alt={product.name}
              className="w-full h-48 object-cover mb-4"
            />
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="text-gray-600">Brand: {product.brand}</p>
            <p className="text-gray-600">Year: {product.year}</p>
            <p className="text-gray-600">Model: {product.model}</p>
            <p className="font-bold text-blue-600">
              Price: ${product.price.toLocaleString()}/day
            </p>
            <button 
              className="mt-4 w-full bg-blue-500 text-white p-2 rounded"
              onClick={() => handleOrderClick(product)}
            >
              Rent Now
            </button>
          </div>
        ))}
      </div>

      {/* Order Form Modal */}
      {showOrderForm && selectedCar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <OrderForm car={selectedCar} onClose={closeOrderForm} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsSection;