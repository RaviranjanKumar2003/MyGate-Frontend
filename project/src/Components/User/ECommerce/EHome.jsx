import React, { useEffect, useState } from "react";
import api from "../../../api/axios";
import BuyModal from "./BuyModal";

/* ================= IMAGE SLIDER ================= */
function ProductImageSlider({ images, productId, baseUrl }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!images || images.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <img
        src="https://via.placeholder.com/300x200"
        className="w-full h-40 sm:h-48 object-cover rounded-lg"
      />
    );
  }

  const next = () => {
    setCurrentIndex((prev) =>
      prev === images.length - 1 ? 0 : prev + 1
    );
  };

  const prev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? images.length - 1 : prev - 1
    );
  };

  return (
    <div className="relative w-full">
      <img
        src={`${baseUrl}/image/get/product/${productId}/${images[currentIndex]}`}
        alt="product"
        className="w-full h-40 sm:h-48 object-cover rounded-lg"
      />

      {/* LEFT BUTTON */}
      {images.length > 1 && (
        <button
          onClick={prev}
          className="absolute left-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
        >
          ‹
        </button>
      )}

      {/* RIGHT BUTTON */}
      {images.length > 1 && (
        <button
          onClick={next}
          className="absolute right-1 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded"
        >
          ›
        </button>
      )}

      {/* DOTS */}
      <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-1">
        {images.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full ${
              i === currentIndex ? "bg-white" : "bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

function EHome() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const buyerId = Number(localStorage.getItem("userId"));
  const BASE_URL = "http://localhost:8080/api/products";

  const [selectedProduct, setSelectedProduct] = useState(null);

  /* ================= FETCH PRODUCTS ================= */
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products`);
      setProducts(res.data || []);
    } catch (err) {
      console.error("Error fetching products:", err);
    } finally {
      setLoading(false);
    }
  };

//============= OFFER
const sendOffer = async (product) => {
  const price = prompt("Enter your offer price");

  if (!price || isNaN(price) || Number(price) <= 0) {
    alert("❌ Invalid price");
    return;
  }

  try {
    await api.post("/offers", {
      productId: Number(product.id),
      buyerId: Number(buyerId),
      offerPrice: Number(price), // ✅ FIXED (price → offerPrice)
    });

    alert("✅ Offer Sent");
  } catch (err) {
    console.error("Offer Error:", err.response?.data || err);
    alert("❌ Failed");
  }
};


  /* ================= FETCH CATEGORIES ================= */
  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error("Category fetch error:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  /* ================= ADD TO CART ================= */
  const addToCart = async (product) => {
    if (product.stock === 0) {
      alert("❌ Out of Stock");
      return;
    }

    try {
      await api.post(`/carts/${buyerId}/add`, null, {
  params: {
    productId: product.id,
    quantity: 1,
    societyId: product.societyId, // ADD THIS
  },
});
      alert("✅ Added to Cart");
    } catch (err) {
      console.error("Add to cart error:", err);
      alert("❌ Failed to add");
    }
  };

  /* ================= BUY NOW ================= */
  const buyNow = async (product) => {
    if (product.stock === 0) {
      alert("❌ Out of Stock");
      return;
    }

    try {
      const quantity = 1;
      const totalAmount = product.price * quantity;

      await api.post(`/orders`, {
        buyerId: buyerId,
        societyId: product.societyId,
        status: "PLACED",
        productIds: [product.id],
        quantities: [quantity],
        totalAmount: totalAmount,
      });

      alert("🛒 Order Placed Successfully!");
      fetchProducts();
    } catch (err) {
      console.error("Order error:", err);
      alert("❌ Order Failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredProducts = products
    .filter((p) => p.sellerId !== buyerId)
    .filter((p) => {
      if (!selectedCategory) return true;
      const categoryName = categories.find(
        (c) => c.id === Number(selectedCategory)
      )?.name;
      return (
        String(p.categoryId) === String(selectedCategory) ||
        (categoryName &&
          p.category?.toLowerCase() === categoryName.toLowerCase())
      );
    });

  return (
    <div className="w-screen sm:w-auto p-2 sm:p-4">

      {/* CATEGORY FILTER */}
      <div className="flex gap-2 sm:gap-3 overflow-x-auto mb-4 py-1 px-1">
        <button
          onClick={() => setSelectedCategory("")}
          className={`flex-shrink-0 px-4 py-2 rounded-full border ${
            selectedCategory === "" ? "bg-orange-500 text-white" : "bg-white"
          }`}
        >
          All
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 px-4 py-2 rounded-full border ${
              Number(selectedCategory) === Number(cat.id)
                ? "bg-orange-500 text-white"
                : "bg-white"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* LOADING */}
      {loading ? (
        <div className="text-center py-10 text-gray-500">
          Loading products...
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">

          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <div
                key={product.id}
                className="bg-white rounded-xl shadow hover:shadow-lg transition flex flex-col justify-between p-3"
              >
                {/* IMAGE SLIDER */}
                <div className="relative">
                  <ProductImageSlider
                    images={product.images}
                    productId={product.id}
                    baseUrl={BASE_URL}
                  />

                  {product.codAvailable && (
                    <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      COD
                    </span>
                  )}
                </div>

                {/* DETAILS */}
                <div className="mt-3">
                  <h3 className="font-semibold">{product.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2">
                    {product.description}
                  </p>

                  <p className="text-gray-400 text-xs mt-1">
                    {product.category}
                  </p>

                  <p className="text-lg font-bold text-orange-500 mt-2">
                    ₹{product.price}
                  </p>

                  <p className="text-xs mt-1">
                    {product.codAvailable ? (
                      <span className="text-green-600 font-semibold">
                        🚚 COD Available
                      </span>
                    ) : (
                      <span className="text-red-500 font-semibold">
                        🚚 COD Not Available
                      </span>
                    )}
                  </p>

                  {product.stock === 0 && (
                    <p className="text-red-500 text-sm font-semibold">
                      Out of Stock
                    </p>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => addToCart(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-orange-500 text-white py-2 rounded"
                    >
                      Add
                    </button>

                    <button
                      onClick={() => setSelectedProduct(product)}
                      disabled={product.stock === 0}
                      className="flex-1 bg-green-600 text-white py-2 rounded"
                    >
                      Buy
                    </button>

                    
                  </div>
                  <button
              onClick={() => sendOffer(product)}
              className="w-full bg-purple-600 text-white py-2 mt-2 rounded"
            >
              Make Offer 💰
            </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-10">
              🚫 No products found
            </div>
          )}


        </div>
      )}

      {/* BUY MODAL */}
      {selectedProduct && (
        <BuyModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

    </div>
  );
}

export default EHome;