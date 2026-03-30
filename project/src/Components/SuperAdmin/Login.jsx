// src/Components/Login.jsx
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
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const res = await api.post("/auth/login", { email, password });

    const {
      token,
      role,
      userType,  // 🔥 NormalUserType for NORMAL_USER
      id,
      name,
      email: userEmail,
      societyId,
      societyName
    } = res.data;

    // Save all info in localStorage
    localStorage.setItem("jwtToken", token);
    localStorage.setItem("userRole", role);
    localStorage.setItem("userType", userType || ""); // null ke liye empty string
    localStorage.setItem("userId", id);           
    localStorage.setItem("userName", name);
    localStorage.setItem("userEmail", userEmail);
    localStorage.setItem("societyId", societyId || "");
    localStorage.setItem("societyName", societyName || "");

    // Redirect to proper dashboard
    navigate(ROLE_DASHBOARD_MAP[role]);
  } catch (err) {
    console.error(err);
    setError("Invalid credentials or server error");
  }
};

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-3xl mb-4">Login</h1>

      <form onSubmit={handleLogin} className="flex flex-col gap-2 w-64">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border p-2"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border p-2"
          required
        />

        <button type="submit" className="bg-blue-500 text-white p-2 mt-2">
          Login
        </button>
      </form>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
}


























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
//   const navigate = useNavigate();
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [otpSent, setOtpSent] = useState(false);
//   const [otp, setOtp] = useState("");
//   const [error, setError] = useState("");

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       // Step 1: validate email/password with backend
//       await api.post("/auth/login", { email, password });

//       // Step 2: Send OTP
//       await api.post("/otp/send", { email });
//       setOtpSent(true);
//     } catch (err) {
//       console.error(err);
//       setError("Invalid credentials or server error");
//     }
//   };

//   const handleVerifyOtp = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const res = await api.post("/otp/verify", { email, otp });
//       const { token, role, id, name, email: userEmail, societyId, societyName } = res.data;

//       localStorage.setItem("jwtToken", token);
//       localStorage.setItem("userRole", role);
//       localStorage.setItem("userId", id);
//       localStorage.setItem("userName", name);
//       localStorage.setItem("userEmail", userEmail);
//       localStorage.setItem("societyId", societyId);
//       localStorage.setItem("societyName", societyName);

//       navigate(ROLE_DASHBOARD_MAP[role]);
//     } catch (err) {
//       console.error(err);
//       setError("Invalid OTP or server error");
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4">
//       <div className="bg-gray-800 p-8 rounded-2xl shadow-xl w-full max-w-sm flex flex-col items-center">
//         <h1 className="text-3xl font-bold text-white mb-6">Sign In</h1>

//         {!otpSent ? (
//           <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full">
//             <div className="relative">
//               <span className="absolute left-3 top-3 text-gray-400">👤</span>
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="pl-10 w-full p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <span className="absolute left-3 top-3 text-gray-400">🔒</span>
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="pl-10 w-full p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                 required
//               />
//             </div>

//             <button
//               type="submit"
//               className="bg-indigo-500 hover:bg-indigo-600 text-white py-3 rounded-xl font-semibold transition"
//             >
//               Send OTP
//             </button>
//           </form>
//         ) : (
//           <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 w-full">
//             <p className="text-gray-300 text-sm text-center">OTP sent to your email</p>
//             <input
//               type="text"
//               placeholder="Enter OTP"
//               value={otp}
//               onChange={(e) => setOtp(e.target.value)}
//               className="w-full p-3 rounded-xl bg-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
//               required
//             />
//             <button
//               type="submit"
//               className="bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition"
//             >
//               Verify OTP
//             </button>
//           </form>
//         )}

//         <div className="flex justify-between items-center w-full mt-4 text-gray-400 text-sm">
//           <span
//             className="hover:text-white cursor-pointer"
//             onClick={() => navigate("/register")}
//           >
//             Register
//           </span>
//           <span className="hover:text-white cursor-pointer">Remember Me</span>
//         </div>

//         {error && <p className="text-red-500 mt-3">{error}</p>}
//       </div>
//     </div>
//   );
// }