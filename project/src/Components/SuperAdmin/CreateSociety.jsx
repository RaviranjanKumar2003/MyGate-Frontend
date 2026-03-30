import React, { useState } from "react";
import api from "../../api/axios";

function CreateSociety({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    city: "",
    address: "",
    adminName: "",
    adminEmail: "",
    adminMobileNumber: "",
    adminPassword: ""
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      setLoading(true);

      // ✅ JSON payload as per backend DTO
      const payload = {
        name: formData.name,
        city: formData.city,
        address: formData.address,
        isActive: "ACTIVE",

        societyAdmin: {
          adminName: formData.adminName,
          adminEmail: formData.adminEmail,
          mobileNumber: formData.adminMobileNumber,
          adminPassword: formData.adminPassword
        }
      };

      await api.post("/societies", payload);

      setMessage("✅ Society & Society Admin created successfully");

      setFormData({
        name: "",
        city: "",
        address: "",
        adminName: "",
        adminEmail: "",
        adminMobileNumber: "",
        adminPassword: ""
      });

      if (onSuccess) {
        setTimeout(() => onSuccess(), 800);
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "❌ Failed to create society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-xl">
      <h1
        className="mb-6 text-3xl font-extrabold
        bg-linear-to-r from-indigo-400 to-pink-400
        bg-clip-text text-transparent"
      >
        Create Society
      </h1>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 space-y-4"
      >
        {/* ===== Society Details ===== */}
        <h2 className="text-lg font-bold text-gray-700">Society Details</h2>

        <input
          type="text"
          name="name"
          placeholder="Society Name"
          value={formData.name}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <input
          type="text"
          name="city"
          placeholder="City"
          value={formData.city}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <textarea
          name="address"
          placeholder="Address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        {/* ===== Society Admin Details ===== */}
        <h2 className="text-lg font-bold text-gray-700 pt-4">
          Society Admin Details
        </h2>

        <input
          type="text"
          name="adminName"
          placeholder="Admin Name"
          value={formData.adminName}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <input
          type="email"
          name="adminEmail"
          placeholder="Admin Email"
          value={formData.adminEmail}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <input
          type="text"
          name="adminMobileNumber"
          placeholder="Admin Mobile Number"
          value={formData.adminMobileNumber}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <input
          type="password"
          name="adminPassword"
          placeholder="Admin Password"
          value={formData.adminPassword}
          onChange={handleChange}
          required
          className="w-full rounded-lg border px-3 py-2 focus:ring-2 focus:ring-indigo-400 outline-none"
        />

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 rounded-xl font-semibold text-white
            bg-linear-to-r from-indigo-500 to-pink-500
            ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          {loading ? "Creating..." : "Create Society"}
        </button>

        {message && (
          <p className="text-center text-sm text-green-600">{message}</p>
        )}

        {error && (
          <p className="text-center text-sm text-red-600">{error}</p>
        )}
      </form>
    </div>
  );
}

export default CreateSociety;
