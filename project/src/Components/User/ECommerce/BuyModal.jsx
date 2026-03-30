import React, { useState, useEffect } from "react";
import api from "../../../api/axios";

function BuyModal({ product, onClose }) {
  const buyerId = Number(localStorage.getItem("userId"));

  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [loading, setLoading] = useState(false);

  // ✅ Address States
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showAddressForm, setShowAddressForm] = useState(false);

  // ✅ IMAGE SLIDER STATE (NEW)
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    if (product && !product.codAvailable) {
      setPaymentMethod("UPI");
    }
  }, [product]);

  const [newAddress, setNewAddress] = useState({
    name: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    phone: "",
  });

  if (!product) return null;

  /* ================= FETCH ADDRESSES ================= */
  const fetchAddresses = async () => {
    try {
      const res = await api.get(`/addresses/user/${buyerId}`);
      setAddresses(res.data || []);

      if (res.data.length === 0) {
        setShowAddressForm(true);
      }
    } catch (err) {
      console.error("Address fetch error:", err);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  /* ================= QUANTITY ================= */
  const handleQuantityChange = (delta) => {
    setQuantity((prev) => {
      const newQty = prev + delta;
      if (newQty < 1) return 1;
      if (newQty > product.stock) return product.stock;
      return newQty;
    });
  };

  /* ================= IMAGE SLIDER ================= */
  const nextImage = () => {
    if (!product.images?.length) return;
    setCurrentImage((prev) => (prev + 1) % product.images.length);
  };

  const prevImage = () => {
    if (!product.images?.length) return;
    setCurrentImage(
      (prev) => (prev - 1 + product.images.length) % product.images.length
    );
  };

  /* ================= ADDRESS ================= */
  const handleAddressChange = (e) => {
    setNewAddress({ ...newAddress, [e.target.name]: e.target.value });
  };

  const saveAddress = async () => {
    try {
      const res = await api.post("/addresses", {
        ...newAddress,
        userId: buyerId,
      });

      alert("✅ Address Saved");
      setShowAddressForm(false);
      fetchAddresses();
      setSelectedAddressId(res.data.id);
    } catch (err) {
      console.error(err);
      alert("❌ Failed to save address");
    }
  };

  /* ================= BUY ================= */
  const handleBuy = async () => {
    if (!selectedAddressId) {
      alert("❌ Please select address");
      return;
    }

    const totalAmount = product.price * quantity;

    try {
      setLoading(true);

      if (paymentMethod === "COD") {
        await api.post("/orders", {
          buyerId,
          societyId: product.societyId,
          productIds: [product.id],
          quantities: [quantity],
          totalAmount,
          status: "PLACED",
          paymentMethod,
          addressId: selectedAddressId,
        });

        alert("🛒 Order Placed (COD)");
        onClose();
      } else {
        const confirmPayment = window.confirm(
          `Pay ₹${totalAmount} using UPI?`
        );

        if (!confirmPayment) return;

        await api.post("/orders", {
          buyerId,
          societyId: product.societyId,
          productIds: [product.id],
          quantities: [quantity],
          totalAmount,
          status: "PAID",
          paymentMethod,
          addressId: selectedAddressId,
        });

        alert("✅ Payment Success & Order Placed");
        onClose();
      }
    } catch (err) {
      console.error(err);
      alert("❌ Order Failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md max-h-[95vh] overflow-y-auto p-4">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold">{product.title}</h2>
          <button onClick={onClose}>✕</button>
        </div>

        {/* ✅ IMAGE SLIDER */}
        <div className="relative">
          <img
            src={
              product.images?.length > 0
                ? `http://localhost:8080/api/products/image/get/product/${product.id}/${product.images[currentImage]}`
                : "https://via.placeholder.com/300"
            }
            className="w-full h-40 object-cover rounded mb-2"
          />

          {product.images?.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-2 top-1/2 bg-black text-white px-2 py-1 rounded"
              >
                ‹
              </button>
              <button
                onClick={nextImage}
                className="absolute right-2 top-1/2 bg-black text-white px-2 py-1 rounded"
              >
                ›
              </button>
            </>
          )}
        </div>

        {/* PRICE */}
        <p className="font-bold text-orange-500 mb-2">
          ₹{product.price * quantity}
        </p>

        {/* QUANTITY */}
        <div className="flex justify-between mb-3">
          <span>Quantity</span>
          <div className="flex border rounded">
            <button onClick={() => handleQuantityChange(-1)} className="px-3">-</button>
            <span className="px-4">{quantity}</span>
            <button onClick={() => handleQuantityChange(1)} className="px-3">+</button>
          </div>
        </div>

        {/* PAYMENT */}
        <div className="mb-3">
          <span>Payment</span>
          <div className="flex gap-3 text-sm">
            <label>
              <input
                type="radio"
                value="UPI"
                checked={paymentMethod === "UPI"}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              UPI
            </label>

            {product.codAvailable && (
              <label>
                <input
                  type="radio"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                COD
              </label>
            )}
          </div>
        </div>

        {/* ADDRESS */}
        {!showAddressForm ? (
          <>
            <div className="mb-3">
              <span className="font-semibold">Select Address</span>

              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className={`border p-2 mt-2 rounded cursor-pointer ${
                    selectedAddressId === addr.id ? "border-green-500" : ""
                  }`}
                  onClick={() => setSelectedAddressId(addr.id)}
                >
                  <p className="font-semibold">{addr.name}</p>
                  <p className="text-sm">
                    {addr.line1}, {addr.city}, {addr.state}
                  </p>
                  <p className="text-xs">{addr.phone}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAddressForm(true)}
              className="text-blue-600 text-sm"
            >
              ➕ Add New Address
            </button>
          </>
        ) : (
          <>
            <div className="mt-3">
              <span className="font-semibold">Add Address</span>

              <input name="name" placeholder="Full Name" onChange={handleAddressChange} className="w-full border p-2 mt-1" />
              <input name="line1" placeholder="Address Line 1" onChange={handleAddressChange} className="w-full border p-2 mt-1" />

              <div className="flex gap-2">
                <input name="city" placeholder="City" onChange={handleAddressChange} className="w-1/2 border p-2 mt-1" />
                <input name="state" placeholder="State" onChange={handleAddressChange} className="w-1/2 border p-2 mt-1" />
              </div>

              <button
                onClick={saveAddress}
                className="bg-blue-600 text-white w-full py-2 mt-2 rounded"
              >
                Save Address
              </button>
            </div>
          </>
        )}

        {/* BUTTONS */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-300 py-2 rounded">
            Cancel
          </button>

          <button
            onClick={handleBuy}
            disabled={loading}
            className="flex-1 bg-green-600 text-white py-2 rounded"
          >
            {loading ? "Processing..." : "Place Order"}
          </button>
        </div>

      </div>
    </div>
  );
}

export default BuyModal;