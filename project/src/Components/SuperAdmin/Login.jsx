// // src/Components/Login.jsx
// import React, { useState } from "react";
// import api from "../../api/axios";
// import { useNavigate } from "react-router-dom";

// const ROLE_DASHBOARD_MAP = {
//   SUPER_ADMIN: "/super-admin/dashboard",
//   SOCIETY_ADMIN: "/society-admin/dashboard",
//   STAFF: "/staff/dashboard",
//   NORMAL_USER: "/user/dashboard",
// };

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//   e.preventDefault();
//   try {
//     const res = await api.post("/auth/login", { email, password });

//     const {
//       token,
//       role,
//       userType,  // 🔥 NormalUserType for NORMAL_USER
//       id,
//       name,
//       email: userEmail,
//       societyId,
//       societyName
//     } = res.data;

//     // Save all info in localStorage
//     localStorage.setItem("jwtToken", token);
//     localStorage.setItem("userRole", role);
//     localStorage.setItem("userType", userType || ""); // null ke liye empty string
//     localStorage.setItem("userId", id);           
//     localStorage.setItem("userName", name);
//     localStorage.setItem("userEmail", userEmail);
//     localStorage.setItem("societyId", societyId || "");
//     localStorage.setItem("societyName", societyName || "");

//     // Redirect to proper dashboard
//     navigate(ROLE_DASHBOARD_MAP[role]);
//   } catch (err) {
//     console.error(err);
//     setError("Invalid credentials or server error");
//   }
// };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen">
//       <h1 className="text-3xl mb-4">Login</h1>

//       <form onSubmit={handleLogin} className="flex flex-col gap-2 w-64">
//         <input
//           type="email"
//           placeholder="Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="border p-2"
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="border p-2"
//           required
//         />

//         <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
//           Login
//         </button>
//       </form>

//       {error && <p className="text-red-500 mt-2">{error}</p>}
//     </div>
//   );
// }




import React, { useState } from "react";
import api from "../../api/axios";
import { useNavigate } from "react-router-dom";

const ROLE_DASHBOARD_MAP = {
  SUPER_ADMIN: "/super-admin/dashboard",
  SOCIETY_ADMIN: "/society-admin/dashboard",
  STAFF: "/staff/dashboard",
  NORMAL_USER: "/user/dashboard",
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      const {
        token,
        role,
        userType,
        id,
        name,
        email: userEmail,
        societyId,
        societyName
      } = res.data;

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userRole", role);
      localStorage.setItem("userType", userType || "");
      localStorage.setItem("userId", id);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", userEmail);
      localStorage.setItem("societyId", societyId || "");
      localStorage.setItem("societyName", societyName || "");

      navigate(ROLE_DASHBOARD_MAP[role]);
    } catch (err) {
      console.error(err);
      setError("Invalid credentials or server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] px-4">
      
      {/* Background subtle gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-slate-900 to-black opacity-90"></div>

      {/* Card */}
      <div className="relative w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-6 sm:p-8">
        
        {/* Title */}
        <h1 className="text-3xl font-semibold text-white text-center mb-6">
          Sign in to your account
        </h1>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label className="text-sm text-gray-300">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full p-3 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm text-gray-300">Password</label>
            <div className="relative mt-1">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 pr-12 rounded-lg bg-white/10 border border-white/10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                required
              />

              {/* Toggle Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-gray-300 hover:text-white"
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium p-3 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-6">
          © 2026 Your Company
        </p>
      </div>
    </div>
  );
}
