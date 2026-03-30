import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

function ESell() {
  const sellerId = Number(localStorage.getItem("userId"));
  const societyId = localStorage.getItem("societyId");

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

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

  const BASE_URL = "http://localhost:8080/api/products";

  /* ================= FETCH ================= */
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
      alert("✅ Offer Accepted");
      fetchOffers(offer.productId);
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

  return (
    <div className="p-4">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">My Products 🛍️</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          ➕ Sell New Product
        </button>
      </div>

      {/* PRODUCT LIST */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="bg-white p-3 rounded shadow">

            {/* IMAGE */}
            <img
              src={
                p.images?.length > 0
                  ? `${BASE_URL}/image/get/product/${p.id}/${p.images[0]}`
                  : "https://via.placeholder.com/300"
              }
              className="h-40 w-full object-cover rounded mb-2"
            />

            <h3 className="font-bold">{p.title}</h3>
            <p>₹{p.price}</p>
            <p>Stock: {p.stock}</p>
            <p className="text-sm text-gray-500">{p.category}</p>
            <p className="text-xs mt-1">
              {p.codAvailable ? "COD Available" : "Online Only"}
            </p>

            <div className="flex gap-2 mt-2">
              <button
                onClick={() => startEdit(p)}
                className="flex-1 bg-blue-500 text-white p-1 rounded"
              >
                Edit
              </button>
              <button
                onClick={() => deleteProduct(p.id)}
                className="flex-1 bg-red-500 text-white p-1 rounded"
              >
                Delete
              </button>
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

            {/* ✅ SHOW OFFERS */}
<div className="mt-4">
  <h4 className="font-semibold text-lg">Offers Received 💰</h4>
  {offers.length === 0 ? (
    <p className="text-sm text-gray-500">No offers</p>
  ) : (
    offers.map((o) => (
      <div key={o.id} className="border p-2 mt-2 rounded">
        <p><span className="font-semibold">Buyer:</span> {o.buyerName || o.buyerEmail || "Unknown"}</p>
        <p><span className="font-semibold">Offer Price:</span> ₹{o.offerPrice}</p>
        <p className="text-xs"><span className="font-semibold">Status:</span> {o.status}</p>
        <div className="flex gap-2 mt-1">
          {o.status === "PENDING" && (
            <>
              <button onClick={()=>acceptOffer(o)}
                className="bg-green-600 text-white px-2 py-1 text-xs rounded">Accept</button>
              <button onClick={()=>rejectOffer(o)}
                className="bg-red-500 text-white px-2 py-1 text-xs rounded">Reject</button>
            </>
          )}
        </div>
      </div>
    ))
  )}
</div>

            <div className="flex gap-2 mt-3">
              <button onClick={()=>setEditProduct(null)} className="flex-1 bg-gray-400 text-white p-2">Cancel</button>
              <button onClick={updateProduct} className="flex-1 bg-green-600 text-white p-2">
                {loading ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default ESell;