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

      setMessage("✅ Society created successfully");

      setFormData({
        name: "",
        city: "",
        address: "",
        adminName: "",
        adminEmail: "",
        adminMobileNumber: "",
        adminPassword: ""
      });

      if (onSuccess) setTimeout(() => onSuccess(), 800);

    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "❌ Failed to create society");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex sm:mt-15">

      {/* RIGHT CONTENT */}
      <div className="flex-1 p-6 overflow-y-auto">

        <div className="max-w-3xl mx-auto">

          <div className="bg-white mt-5 rounded-2xl shadow-md hover:shadow-lg transition p-6 border">

            {/* HEADER */}
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-800">
                🏢 Create Society
              </h1>
              <p className="text-sm text-gray-500">
                Add a new society with admin details
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">

              {/* ===== Society Details ===== */}
              <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-2">
                  Society Details
                </h2>

                <input
                  type="text"
                  name="name"
                  placeholder="Society Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <input
                    type="text"
                    name="city"
                    placeholder="City"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>

              {/* ===== Divider ===== */}
              <div className="border-t pt-4"></div>

              {/* ===== Admin Details ===== */}
              <div>
                <h2 className="text-sm font-semibold text-gray-600 mb-2">
                  Admin Details
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                  <input
                    type="text"
                    name="adminName"
                    placeholder="Admin Name"
                    value={formData.adminName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <input
                    type="email"
                    name="adminEmail"
                    placeholder="Admin Email"
                    value={formData.adminEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <input
                    type="text"
                    name="adminMobileNumber"
                    placeholder="Mobile Number"
                    value={formData.adminMobileNumber}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                  <input
                    type="password"
                    name="adminPassword"
                    placeholder="Password"
                    value={formData.adminPassword}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  />

                </div>
              </div>

              {/* ===== BUTTON ===== */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-lg font-medium transition shadow ${
                  loading ? "opacity-60 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Creating..." : "Create Society"}
              </button>

              {/* ===== MESSAGE ===== */}
              {message && (
                <p className="text-center text-green-600 text-sm">{message}</p>
              )}

              {error && (
                <p className="text-center text-red-600 text-sm">{error}</p>
              )}

            </form>

          </div>

        </div>
      </div>
    </div>
  );
}

export default CreateSociety;