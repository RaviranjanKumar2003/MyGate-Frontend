import React, { useState } from "react";
import axios from "../../api/axios"; // use your centralized axios instance
import { useNavigate } from "react-router-dom";

const BASE_URL = "/auth"; // axios already has baseURL

function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${BASE_URL}/register`, form);

      // Optional: auto-login after register
      // localStorage.setItem("jwtToken", res.data.token);

      alert("✅ Registration successful. Please login.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "❌ Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleRegister}
        className="bg-white p-6 rounded-xl shadow w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-center">
          Super Admin Register
        </h2>

        <input
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email Address"
          value={form.email}
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded"
          required
        />

        <input
          name="mobileNumber"
          placeholder="Mobile Number"
          value={form.mobileNumber}
          onChange={handleChange}
          className="border p-2 w-full mb-3 rounded"
        />

        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          className="border p-2 w-full mb-4 rounded"
          required
        />

        <button
          type="submit"
          className="bg-indigo-600 text-white w-full py-2 rounded hover:bg-indigo-700 transition-colors"
        >
          Register
        </button>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-indigo-600 cursor-pointer font-medium"
          >
            Login
          </span>
        </p>
      </form>
    </div>
  );
}

export default Register;
