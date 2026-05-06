import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

import stompClient from "../../../socket"; // path apne project ke hisaab se
import { toast } from "react-toastify";



function ESell() {
    
  const [flatImages, setFlatImages] = useState([]);       // new images
  const [existingFlatImages, setExistingFlatImages] = useState([]); // old images
  
  const [showFlatModal, setShowFlatModal] = useState(false);
  const [myFlats, setMyFlats] = useState([]);
  const [selectedFlat, setSelectedFlat] = useState(null);
  const [listingType, setListingType] = useState("SELL");
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");


  const sellerId = Number(localStorage.getItem("userId"));
  const societyId = localStorage.getItem("societyId");

  const userType = localStorage.getItem("userType"); // OWNER / TENANT

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const [flatListings, setFlatListings] = useState([]);

  const [editProduct, setEditProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [offers, setOffers] = useState([]); // ✅ Offers state

  const [showCreate, setShowCreate] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    stock: 1,
    codAvailable: true
  });
  const [newImages, setNewImages] = useState([]);

  const BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/products`
  : "http://localhost:8080/api/products";



  // ✅ FLAT EDIT + OFFERS STATES
const [editFlat, setEditFlat] = useState(null);
const [flatOffers, setFlatOffers] = useState([]);
const [viewFlatOffers, setViewFlatOffers] = useState(null);
const [flatOfferCounts, setFlatOfferCounts] = useState({});

  /* ================= FETCH ================= */
 /*================================================================================*/   
  const fetchMyFlats = async () => {
  try {
    const res = await api.get(
      `/users/society/${societyId}/user/${sellerId}`
    );

    const user = res.data;

    // flat ko same format me convert kar do
    const flat = user.flatNumber
      ? [{
          id: user.flatId,
          flatNumber: user.flatNumber
        }]
      : [];

    setMyFlats(flat);
  } catch (err) {
    console.error(err);
  }
};
   
  useEffect(() => {
  fetchMyFlats();
}, []);


const fetchFlatOfferCount = async (flatId) => {
  try {
    const res = await api.get(`/flat-offers/flat/${flatId}`);
    setFlatOfferCounts(prev => ({
      ...prev,
      [flatId]: res.data.length
    }));
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (flatListings.length > 0) {
    flatListings.forEach(f => fetchFlatOfferCount(f.id));
  }
}, [flatListings]);


const createFlatListing = async () => {
  if (!selectedFlat) {
    alert("Select flat first");
    return;
  }

  try {
    const payload = {
      flatId: selectedFlat.id,
      ownerId: sellerId,
      societyId: Number(societyId),   // ✅ FIX
      type: listingType.toUpperCase(),
      price: listingType === "SELL" ? Number(price) : null,
      rent: listingType === "RENT" ? Number(rent) : null,
      description: ""
    };

    console.log("FINAL PAYLOAD:", payload); // 👈 CHECK THIS

    const res = await api.post("/flat-listings/create", payload);

    const flatId = res.data.id;

    // 👉 IMAGE UPLOAD
    if (flatImages.length > 0) {
       const formData = new FormData();
       flatImages.forEach(img => formData.append("images", img));

      await api.post(`/flat-listings/flat-listings/${flatId}/images`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

setFlatImages([]); // reset

    fetchFlatListings();
    alert("Flat Published & Live Now 🚀");
    setShowFlatModal(false);

  } catch (err) {
    console.error("ERROR:", err.response?.data);
    alert(err.response?.data || "Server Error");
  }
};



const fetchFlatListings = async () => {
  try {
    const res = await api.get(`/flat-listings/owner/${sellerId}`);
    setFlatListings(res.data || []);
  } catch (err) {
    console.error("Flat fetch error:", err);
  }
};



useEffect(() => {
  fetchFlatListings();
}, []);
/*=======================================================================*/

  const fetchMyProducts = async () => {
    try {
      const res = await api.get(`/products/seller/${sellerId}`);
      setProducts(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await api.get(`/categories/society/${societyId}`);
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOffers = async (productId) => {
    try {
      const res = await api.get(`/offers/product/${productId}`);
      setOffers(res.data || []);
    } catch (err) {
      console.error("Offer fetch error:", err);
    }
  };

  useEffect(() => {
    fetchMyProducts();
    fetchCategories();
  }, []);

  /* ================= DELETE ================= */
  const deleteProduct = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await api.delete(`/products/${id}`, { params: { userId: sellerId } });
      alert("✅ Deleted");
      fetchMyProducts();
    } catch {
      alert("❌ Delete failed");
    }
  };


  const deleteFlat = async (id) => {
  if (!window.confirm("Delete this flat?")) return;

  try {
    await api.delete(`/flat-listings/${id}`, {
      params: { userId: sellerId }
    });

    alert("✅ Flat Deleted");
    fetchFlatListings();
  } catch (err) {
    console.error(err);
    alert("❌ Delete failed");
  }
};


const deleteFlatImage = async (imgName) => {
  try {
    await api.delete(`/flat-listings/${editFlat.id}/image`, {
      params: { imageName: imgName }
    });

    setExistingFlatImages(prev =>
      prev.filter(i => i !== imgName)
    );

  } catch (err) {
    console.error(err);
    alert("❌ Delete failed");
  }
};


const startEditFlat = (flat) => {
  setEditFlat(flat);
  setExistingFlatImages(flat.images || []);
  setFlatImages([]);
};

const updateFlat = async () => {
  try {
    await api.put(
      `/flat-listings/${editFlat.id}`,
      {
        type: editFlat.type,
        price: editFlat.price,
        rent: editFlat.rent,
        description: editFlat.description
      },
      { params: { userId: sellerId } }
    );

    // 👉 new images upload
if (flatImages.length > 0) {
  const formData = new FormData();
  flatImages.forEach(img => formData.append("images", img));

  await api.post(
    `/flat-listings/flat-listings/${editFlat.id}/images`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
}

    alert("✅ Flat Updated");
    setEditFlat(null);
    fetchFlatListings();
  } catch (err) {
    console.error(err);
    alert("❌ Update failed");
  }
};


const fetchFlatOffers = async (flatId) => {
  try {
    const res = await api.get(`/flat-offers/flat/${flatId}`);
    setFlatOffers(res.data || []);
  } catch (err) {
    console.error(err);
  }
};

const viewOffersFlat = (flat) => {
  setViewFlatOffers(flat);
  fetchFlatOffers(flat.id);
};

useEffect(() => {
  if (viewFlatOffers?.id) {
    fetchFlatOffers(viewFlatOffers.id);
  }
}, [viewFlatOffers]);


const acceptFlatOffer = async (offer) => {
  try {
    await api.put(`/flat-offers/${offer.id}`, {
      ...offer,
      status: "ACCEPTED"
    });

    fetchFlatOffers(offer.flatId);
  } catch {
    alert("❌ Failed");
  }
};

const rejectFlatOffer = async (offer) => {
  try {
    await api.put(`/flat-offers/${offer.id}`, {
      ...offer,
      status: "REJECTED"
    });

    fetchFlatOffers(offer.flatId);
  } catch {
    alert("❌ Failed");
  }
};


const FLAT_IMAGE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/flat-listings`
  : "http://localhost:8080/api/flat-listings";


  /* ================= CREATE ================= */
  const createProduct = async () => {
    try {
      setLoading(true);

      const res = await api.post(`/products`, {
        ...newProduct,
        sellerId,
        societyId,
      });

      const productId = res.data.id;

      if (newImages.length > 0) {
        const formData = new FormData();
        newImages.forEach((img) => formData.append("images", img));

        await api.post(
          `/products/society/${societyId}/product/image/upload/${productId}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      alert("✅ Product Added");
      setShowCreate(false);
      setNewImages([]);
      fetchMyProducts();
    } catch (err) {
      console.error(err);
      alert("❌ Create failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= EDIT ================= */
  const startEdit = (product) => {
    setEditProduct({
      ...product,
      codAvailable: product.codAvailable ?? true
    });
    setExistingImages(product.images || []);
    setImages([]);
    fetchOffers(product.id); // ✅ Load offers when editing a product
  };

  /* ================= UPDATE ================= */
  const updateProduct = async () => {
    try {
      setLoading(true);

      await api.put(
        `/products/${editProduct.id}`,
        {
          title: editProduct.title,
          description: editProduct.description,
          price: editProduct.price,
          stock: editProduct.stock,
          category: editProduct.category,
          codAvailable: editProduct.codAvailable
        },
        { params: { userId: sellerId } }
      );

      if (images.length > 0) {
        const formData = new FormData();
        images.forEach((img) => formData.append("images", img));

        await api.post(
          `/products/society/${societyId}/product/image/upload/${editProduct.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      alert("✅ Updated");
      setEditProduct(null);
      await fetchMyProducts();
    } catch (err) {
      console.error(err.response?.data);
      alert("❌ Update failed");
    } finally {
      setLoading(false);
    }
  };

  /* ================= ACCEPT / REJECT OFFERS ================= */
  const acceptOffer = async (offer) => {
  try {
    await api.put(`/offers/${offer.id}`, {
      ...offer,
      status: "ACCEPTED",
    });

    fetchOffers(offer.productId); // ✅ direct refresh
  } catch {
    alert("❌ Failed to accept offer");
  }
};

  const rejectOffer = async (offer) => {
    try {
      await api.put(`/offers/${offer.id}`, {
        ...offer,
        status: "REJECTED",
      });
      alert("❌ Offer Rejected");
      fetchOffers(offer.productId);
    } catch {
      alert("❌ Failed to reject offer");
    }
  };

  
/*============================= ofer message ==================*/
  useEffect(() => {
  if (!sellerId || !stompClient?.connected) return;

  const subscription = stompClient.subscribe(
    `/topic/offer/${sellerId}`,
    (msg) => {
      toast.success(msg.body);

      if (editProduct?.id) {
        fetchOffers(editProduct.id);
      }

      fetchMyProducts();
    }
  );

  return () => subscription.unsubscribe();
}, [sellerId, editProduct]);

/*===========================offer count ================*/
const [offerCounts, setOfferCounts] = useState({});

const fetchOfferCount = async (productId) => {
  try {
    const res = await api.get(`/offers/product/${productId}`);
    setOfferCounts(prev => ({
      ...prev,
      [productId]: res.data.length
    }));
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  if (products.length > 0) {
    products.forEach(p => fetchOfferCount(p.id));
  }
}, [products]);

/*================== offer list =================*/
const [viewOffersProduct, setViewOffersProduct] = useState(null);

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">

        {/* TITLE */}
        <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-800 tracking-tight">
          My Products 🛍️
        </h2>

         {/* BUTTON GROUP */}
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">

          {/* SELL PRODUCT */}
          <button
            onClick={() => setShowCreate(true)}
            className=" group relative overflow-hidden px-5 py-3 rounded-xl bg-linear-to-r from-blue-500 to-indigo-600 text-white font-semibold shadow-lg hover:shadow-blue-400/50 transform hover:scale-105 active:scale-95 transition-all duration-300" >
            <span className="relative  flex items-center justify-center gap-2">
              ➕ Sell Product
            </span>

            {/* glow effect */}
            <span className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition"></span>
          </button>

           {/* PUBLISH FLAT */}
           {userType === "OWNER" && (
              <button
            onClick={() => setShowFlatModal(true)}
            className=" group relative overflow-hidden px-5 py-3 rounded-xl bg-linear-to-r from-emerald-500 to-teal-600 text-white font-semibold shadow-lg hover:shadow-emerald-400/50 transform hover:scale-105 active:scale-95 transition-all duration-300 ">
            <span className="relative  flex items-center justify-center gap-2">
              🏠 Publish Flat
            </span>

            {/* glow effect */}
            <span className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 transition"></span>
          </button>
           )}
        
        </div>
      </div>

      {/* PRODUCT LIST */}
      {/* ================= PRODUCTS ================= */}
<div className="h-105 overflow-y-auto pr-2">
  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
    {products.map((p) => (
      <div
        key={p.id}
        className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition duration-300 overflow-hidden border group"
      >
        {/* IMAGE */}
        <div className="relative overflow-hidden">
          <img
            src={
              p.images?.length > 0
                ? `${BASE_URL}/image/get/product/${p.id}/${p.images[0]}`
                : "https://via.placeholder.com/300"
            }
            className="h-44 w-full object-cover group-hover:scale-105 transition duration-300"
          />

          {/* OFFER BADGE */}
          {offerCounts[p.id] > 0 && (
            <span className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow">
              🔥 {offerCounts[p.id]} Offers
            </span>
          )}
        </div>

        {/* CONTENT */}
        <div className="p-3">
          <h3 className="font-semibold text-lg truncate">{p.title}</h3>

          <p className="text-green-600 font-bold text-xl">₹{p.price}</p>

          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>Stock: {p.stock}</span>
            <span>{p.category}</span>
          </div>

          <p className="text-xs mt-1 text-gray-600">
            {p.codAvailable ? "🚚 COD Available" : "💳 Online Only"}
          </p>

          {/* BUTTONS */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => startEdit(p)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-1 rounded-lg text-sm transition"
            >
              ✏️ Edit
            </button>

            <button
              onClick={() => {
                setViewOffersProduct(p);
                fetchOffers(p.id);
              }}
              className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-1 rounded-lg text-sm transition"
            >
              💰 Offers
            </button>

            <button
              onClick={() => deleteProduct(p.id)}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white py-1 rounded-lg text-sm transition"
            >
              🗑️
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

{/* ================= FLATS ================= */}
<h2 className="text-2xl font-bold mt-10 mb-4 text-gray-800">
  My Flat Listings 🏠
</h2>

<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
  {flatListings.map((f) => (
    <div
      key={f.id}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border group"
    >

      {/* IMAGE */}
      <div className="relative h-48 overflow-hidden">
        <img
          src={
            f.images?.length > 0
            ? `${FLAT_IMAGE_URL}/flat/image/${f.id}/${f.images[0]}`
            : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2"
          }
          className="w-full h-full object-cover group-hover:scale-110 transition duration-500"
        />

        {/* TYPE BADGE */}
        <span className="absolute top-3 left-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
          {f.type}
        </span>
        {flatOfferCounts[f.id] > 0 && (
          <span className="absolute top-10 left-3 bg-green-600 text-white text-xs px-2 py-1 rounded-full shadow">
      🔥       {flatOfferCounts[f.id]} Offers
          </span>
        )}

        {/* STATUS BADGE */}
        <span
          className={`absolute top-3 right-3 text-xs px-3 py-1 rounded-full font-semibold shadow
            ${
              f.status === "ACTIVE"
                ? "bg-green-600 text-white"
                : f.status === "PENDING"
                ? "bg-yellow-500 text-white"
                : "bg-red-500 text-white"
            }`}
        >
          {f.status}
        </span>
      </div>

      {/* CONTENT */}
      <div className="p-4">

        {/* TITLE */}
        <h3 className="text-lg font-semibold text-gray-800">
          🏠 Flat Id {f.flatNumber || `: ${f.flatId}`}
        </h3>

        {/* PRICE */}
        <p className="text-2xl font-bold mt-1 text-indigo-600">
          {f.type === "SELL"
            ? `₹${f.price}`
            : `₹${f.rent} / month`}
        </p>

        {/* DETAILS */}
        <div className="flex justify-between text-sm text-gray-500 mt-2">
          <span>Society ID: {f.societyId}</span>
          <span>{new Date(f.createdAt).toLocaleDateString()}</span>
        </div>

        {/* DESCRIPTION */}
        {f.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {f.description}
          </p>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex gap-2 mt-4">

          <button
            onClick={() => startEditFlat(f)}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white py-2 rounded-lg text-sm transition"
          >
            ✏️ Edit
          </button>

          <button
            onClick={() => viewOffersFlat(f)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition"
          >
            💰 Offers
          </button>

          <button
            onClick={() => deleteFlat(f.id)}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg text-sm transition"
          >
            🗑️
          </button>

        </div>
      </div>
    </div>
  ))}
</div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-full max-w-md">

            <h3 className="font-bold mb-2">Sell Product</h3>

            <input placeholder="Title"
              onChange={(e)=>setNewProduct({...newProduct,title:e.target.value})}
              className="w-full border p-2 mb-2"/>
            <input placeholder="Price" type="number"
              onChange={(e)=>setNewProduct({...newProduct,price:e.target.value})}
              className="w-full border p-2 mb-2"/>
            <input placeholder="Stock" type="number"
              onChange={(e)=>setNewProduct({...newProduct,stock:Number(e.target.value)})}
              className="w-full border p-2 mb-2"/>
            <textarea placeholder="Description"
              onChange={(e)=>setNewProduct({...newProduct,description:e.target.value})}
              className="w-full border p-2 mb-2"/>
            <select
              value={newProduct.category}
              onChange={(e)=>setNewProduct({...newProduct,category:e.target.value})}
              className="w-full border p-2 mb-2"
            >
              <option value="">Select Category</option>
              {categories.map((c)=>(<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>

            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox"
                checked={newProduct.codAvailable}
                onChange={(e)=>setNewProduct({...newProduct,codAvailable:e.target.checked})}/>
              <label>Cash on Delivery Available</label>
            </div>

            <input type="file" multiple
              onChange={(e)=>setNewImages([...newImages,...Array.from(e.target.files)])}/>

            <div className="flex gap-2 flex-wrap mt-2">
              {newImages.map((img,i)=>(<img key={i} src={URL.createObjectURL(img)} className="h-16 w-16"/>))}
            </div>

            <button type="button" onClick={()=>document.getElementById("createMore").click()}
              className="bg-blue-500 text-white px-2 py-1 mt-2 rounded">+ Add More Images</button>
            <input id="createMore" type="file" multiple hidden
              onChange={(e)=>setNewImages([...newImages,...Array.from(e.target.files)])}/>

            <div className="flex gap-2 mt-3">
              <button onClick={()=>setShowCreate(false)} className="flex-1 bg-gray-400 text-white p-2">Cancel</button>
              <button onClick={createProduct} className="flex-1 bg-green-600 text-white p-2">
                {loading ? "Adding..." : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showFlatModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-full max-w-md">

            <h3 className="font-bold mb-2">Publish Your Flat 🏠</h3>

            {/* SELECT FLAT */}
            <select
              className="w-full border p-2 mb-2"
              onChange={(e) => {
                const flat = myFlats.find(f => f.id === Number(e.target.value));
                setSelectedFlat(flat);
              }}
            >
               <option value="">Select Flat</option>

              {myFlats.map(f => (
                <option key={f.id} value={f.id}>
                  {f.flatNumber}
                </option>
              ))}
            </select>

      {/* TYPE */}
      <select
        className="w-full border p-2 mb-2"
        value={listingType}
        onChange={(e) => setListingType(e.target.value)}
      >
        <option value="SELL">Sell Flat</option>
        <option value="RENT">Rent Flat</option>
      </select>

      {/* PRICE / RENT */}
      {listingType === "SELL" ? (
        <input
          placeholder="Enter Price"
          className="w-full border p-2 mb-2"
          onChange={(e) => setPrice(e.target.value)}
        />
      ) : (
        <input
          placeholder="Enter Rent"
          className="w-full border p-2 mb-2"
          onChange={(e) => setRent(e.target.value)}
        />
      )}

      <input
  type="file"
  multiple
  onChange={(e) =>
    setFlatImages([...flatImages, ...Array.from(e.target.files)])
  }
/>

<button
  type="button"
  onClick={() => document.getElementById("createFlatMore").click()}
  className="bg-blue-500 text-white px-2 py-1 mt-2 rounded"
>
  + Add More Images
</button>

<input
  id="createFlatMore"
  type="file"
  multiple
  hidden
  onChange={(e) =>
    setFlatImages([...flatImages, ...Array.from(e.target.files)])
  }
/>

<div className="flex gap-2 mt-2 flex-wrap">
  {flatImages.map((img, i) => (
    <img
      key={i}
      src={URL.createObjectURL(img)}
      className="h-16 w-16"
    />
  ))}
</div>

      <div className="flex gap-3 mt-4">
  <button
    onClick={() => setShowFlatModal(false)}
    className="flex-1 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
  >
    Cancel
  </button>

  <button
    onClick={createFlatListing}
    className="flex-1 py-2 rounded-lg bg-linear-to-r from-green-500 to-emerald-600 text-white font-semibold hover:scale-105 transition"
  >
    Publish 🚀
  </button>
</div>

    </div>
  </div>
)}

      {/* EDIT MODAL */}
      {editProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-full max-w-md">

            <h3 className="font-bold mb-2">Edit Product</h3>

            <input value={editProduct.title}
              onChange={(e)=>setEditProduct({...editProduct,title:e.target.value})}
              className="w-full border p-2 mb-2"/>
            <input value={editProduct.price} type="number"
              onChange={(e)=>setEditProduct({...editProduct,price:e.target.value})}
              className="w-full border p-2 mb-2"/>
            <select value={editProduct.category}
              onChange={(e)=>setEditProduct({...editProduct,category:e.target.value})}
              className="w-full border p-2 mb-2">
              {categories.map((c)=>(<option key={c.id} value={c.name}>{c.name}</option>))}
            </select>

            <div className="flex items-center gap-2 mb-2">
              <input type="checkbox"
                checked={editProduct.codAvailable}
                onChange={(e)=>setEditProduct({...editProduct,codAvailable:e.target.checked})}/>
              <label>Cash on Delivery Available</label>
            </div>

            {/* EXISTING IMAGES */}
            <div className="flex gap-2 flex-wrap">
              {existingImages.map((img,i)=>(<img key={i}
                src={`${BASE_URL}/image/get/product/${editProduct.id}/${img}`}
                className="h-16 w-16"/>))}
            </div>

            {/* NEW IMAGES */}
            <input type="file" multiple
              onChange={(e)=>setImages([...images,...Array.from(e.target.files)])}/>
            <div className="flex gap-2 flex-wrap mt-2">
              {images.map((img,i)=>(<img key={i} src={URL.createObjectURL(img)} className="h-16 w-16"/>))}
            </div>
            <button onClick={()=>document.getElementById("editMore").click()}
              className="bg-blue-500 text-white px-2 py-1 mt-2">+ Add More Images</button>
            <input id="editMore" type="file" multiple hidden
              onChange={(e)=>setImages([...images,...Array.from(e.target.files)])}/>

            <div className="flex gap-2 mt-3">
              <button onClick={()=>setEditProduct(null)} className="flex-1 bg-gray-400 text-white p-2">Cancel</button>
              <button onClick={updateProduct} className="flex-1 bg-green-600 text-white p-2">
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}


      {editFlat && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
    <div className="bg-white p-5 rounded-2xl w-full max-w-md shadow-xl">

      <h3 className="font-bold text-lg mb-3 text-gray-800">
        Edit Flat 🏠
      </h3>

      {/* TYPE */}
      <select
        value={editFlat.type}
        onChange={(e)=>setEditFlat({...editFlat,type:e.target.value})}
        className="w-full border p-2 mb-2 rounded"
      >
        <option value="SELL">Sell</option>
        <option value="RENT">Rent</option>
      </select>

      {/* PRICE / RENT */}
      {editFlat.type === "SELL" ? (
        <input
          value={editFlat.price || ""}
          onChange={(e)=>setEditFlat({...editFlat,price:e.target.value})}
          placeholder="Enter Price"
          className="w-full border p-2 mb-2 rounded"
        />
      ) : (
        <input
          value={editFlat.rent || ""}
          onChange={(e)=>setEditFlat({...editFlat,rent:e.target.value})}
          placeholder="Enter Rent"
          className="w-full border p-2 mb-2 rounded"
        />
      )}

      {/* DESCRIPTION */}
      <textarea
        placeholder="Description"
        value={editFlat.description || ""}
        onChange={(e)=>setEditFlat({...editFlat,description:e.target.value})}
        className="w-full border p-2 mb-2 rounded"
      />

      {/* ================= EXISTING IMAGES ================= */}
      <h4 className="text-sm font-semibold mt-2 text-gray-700">
        Existing Images
      </h4>

      <div className="flex gap-2 flex-wrap mt-2">
        {existingFlatImages.length === 0 && (
          <p className="text-xs text-gray-400">No images</p>
        )}

        {existingFlatImages.map((img, i) => (
          <div key={i} className="relative group">
            <img
              src={`${FLAT_IMAGE_URL}/flat/image/${editFlat.id}/${img}`}
              className="h-16 w-16 object-cover rounded border"
            />

            {/* DELETE BUTTON */}
            <button
              onClick={() => deleteFlatImage(img)}
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ================= ADD NEW IMAGES ================= */}
      <h4 className="text-sm font-semibold mt-3 text-gray-700">
        Add New Images
      </h4>

      {/* MAIN INPUT */}
      <input
        type="file"
        multiple
        onChange={(e)=>
          setFlatImages([
            ...flatImages,
            ...Array.from(e.target.files)
          ])
        }
        className="mt-2"
      />

      {/* ADD MORE BUTTON */}
      <button
        type="button"
        onClick={() => document.getElementById("editFlatMore").click()}
        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 mt-2 rounded text-sm"
      >
        + Add More Images
      </button>

      <input
        id="editFlatMore"
        type="file"
        multiple
        hidden
        onChange={(e)=>
          setFlatImages([
            ...flatImages,
            ...Array.from(e.target.files)
          ])
        }
      />

      {/* PREVIEW NEW IMAGES */}
      <div className="flex gap-2 flex-wrap mt-2">
        {flatImages.map((img, i) => (
          <div key={i} className="relative group">
            <img
              src={URL.createObjectURL(img)}
              className="h-16 w-16 object-cover rounded border"
            />

            {/* REMOVE NEW IMAGE */}
            <button
              onClick={() =>
                setFlatImages(flatImages.filter((_, index) => index !== i))
              }
              className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 rounded-full opacity-0 group-hover:opacity-100 transition"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={()=>setEditFlat(null)}
          className="flex-1 bg-gray-400 hover:bg-gray-500 text-white p-2 rounded"
        >
          Cancel
        </button>

        <button
          onClick={updateFlat}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white p-2 rounded"
        >
          Update
        </button>
      </div>

    </div>
  </div>
)}

      {viewOffersProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-full max-w-md">

           <h3 className="font-bold text-lg mb-2">
             Offers for {viewOffersProduct.title} 💰
           </h3>

      {offers.length === 0 ? (
        <p className="text-sm text-gray-500">No offers</p>
      ) : (
        offers.map((o) => (
          <div key={o.id} className="border p-2 mt-2 rounded">
            <p>
              <span className="font-semibold">Buyer:</span>{" "}
              {o.buyerName || o.buyerEmail || "Unknown"}
            </p>
            <p>
              <span className="font-semibold">Offer:</span> ₹{o.offerPrice}
            </p>
            <p className="text-xs">
              <span className="font-semibold">Status:</span> {o.status}
            </p>

            {o.status === "PENDING" && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => acceptOffer(o)}
                  className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                >
                  Accept
                </button>
                <button
                  onClick={() => rejectOffer(o)}
                  className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}
      <button
        onClick={() => setViewOffersProduct(null)}
        className="w-full bg-gray-500 text-white mt-3 p-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

{viewFlatOffers && (
  <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
    <div className="bg-white p-4 rounded w-full max-w-md">

      <h3 className="font-bold mb-2">
        Flat Offers 💰
      </h3>

      {flatOffers.length === 0 ? (
        <p>No offers</p>
      ) : (
        flatOffers.map(o => (
          <div key={o.id} className="border p-2 mt-2 rounded">
            <p>Buyer: {o.buyerName}</p>
            <p>Offer: ₹{o.offerPrice}</p>
            <p>Status: {o.status}</p>

            {o.status === "PENDING" && (
              <div className="flex gap-2 mt-1">
                <button
                  onClick={()=>acceptFlatOffer(o)}
                  className="bg-green-600 text-white px-2 py-1 text-xs rounded"
                >
                  Accept
                </button>
                <button
                  onClick={()=>rejectFlatOffer(o)}
                  className="bg-red-500 text-white px-2 py-1 text-xs rounded"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        ))
      )}

      <button
        onClick={()=>setViewFlatOffers(null)}
        className="w-full bg-gray-500 text-white mt-3 p-2 rounded"
      >
        Close
      </button>
    </div>
  </div>
)}

    </div>
  );
}

export default ESell;