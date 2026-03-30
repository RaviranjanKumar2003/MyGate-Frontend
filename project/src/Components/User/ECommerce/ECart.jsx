import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

function ECart() {
  const buyerId = Number(localStorage.getItem("userId"));
  const BASE_URL = "http://localhost:8080/api/products";

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  /* ================= FETCH CART WITH PRODUCT DETAILS ================= */
  const fetchCart = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/carts/${buyerId}`);
      const cart = res.data; // { productIds: [...], quantities: [...] }

      if (cart && cart.productIds && cart.productIds.length > 0) {
        // Fetch full product details for each product in cart
        const productsRes = await Promise.all(
          cart.productIds.map((id) => api.get(`/products/${id}`))
        );

        const items = productsRes.map((pRes, index) => ({
          ...pRes.data,
          quantity: cart.quantities[index], // Attach quantity from cart
        }));

        setCartItems(items);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Cart fetch error:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  /* ================= REMOVE FROM CART ================= */
  const removeFromCart = async (productId) => {
    if (!window.confirm("Remove this item from cart?")) return;
    try {
      await api.delete(`/carts/${buyerId}/remove`, { params: { productId } });
      alert("✅ Removed");
      fetchCart();
    } catch (err) {
      console.error("Remove cart error:", err);
      alert("❌ Failed to remove");
    }
  };

  /* ================= FETCH OFFERS ================= */
  const fetchOffers = async (productId) => {
    try {
      const res = await api.get(`/offers/product/${productId}`);
      return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
      console.error("Offer fetch error:", err);
      return [];
    }
  };

  return (
    <div className="p-5">
      <h2 className="text-2xl font-bold mb-4">🛒 My Cart</h2>

      {loading ? (
        <p className="text-gray-500">Loading cart...</p>
      ) : cartItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {cartItems.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              BASE_URL={BASE_URL}
              removeFromCart={removeFromCart}
              fetchOffers={fetchOffers}
            />
          ))}
        </div>
      ) : (
        <p className="text-gray-500">Your cart is empty 🚫</p>
      )}
    </div>
  );
}

/* ================= CART ITEM COMPONENT ================= */
function CartItem({ item, BASE_URL, removeFromCart, fetchOffers }) {
  const [offers, setOffers] = useState([]);
  const [loadingOffers, setLoadingOffers] = useState(false);

  useEffect(() => {
    const loadOffers = async () => {
      setLoadingOffers(true);
      const fetched = await fetchOffers(item.id);
      setOffers(fetched);
      setLoadingOffers(false);
    };
    loadOffers();
  }, [item.id, fetchOffers]);

  return (
    <div className="bg-white p-3 rounded shadow flex flex-col">
      <img
        src={
          item.images?.length > 0
            ? `${BASE_URL}/image/get/product/${item.id}/${item.images[0]}`
            : "https://via.placeholder.com/300x200"
        }
        alt={item.title}
        className="h-40 w-full object-cover rounded mb-2"
      />

      <h3 className="font-bold">{item.title}</h3>
      <p className="text-gray-500 text-sm line-clamp-2">{item.description}</p>
      <p className="mt-1 text-orange-500 font-bold">₹{item.price}</p>
      <p className="text-xs mt-1">
        Quantity: {item.quantity} | Stock: {item.stock} |{" "}
        {item.codAvailable ? "COD Available" : "Online Only"}
      </p>

      <button
        onClick={() => removeFromCart(item.id)}
        className="bg-red-500 text-white py-1 mt-2 rounded"
      >
        Remove
      </button>

      {/* OFFERS */}
      <div className="mt-3">
        <h4 className="font-semibold text-sm mb-1">Offers</h4>
        {loadingOffers ? (
          <p className="text-gray-500 text-xs">Loading offers...</p>
        ) : offers.length > 0 ? (
          offers.map((o) => (
            <div key={o.id} className="text-xs text-gray-700 border-b py-1">
              Buyer ID: {o.buyerId} | ₹{o.offerPrice} |{" "}
              {new Date(o.offerTime).toLocaleString()}
            </div>
          ))
        ) : (
          <p className="text-gray-400 text-xs">No offers yet</p>
        )}
      </div>
    </div>
  );
}

export default ECart;