// src/Components/SocietySidebar.jsx
import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Building2,
  Users,
  FileText,
  DollarSign,
  AlertCircle,
  Settings
} from "lucide-react";
import { FaTimes, FaCamera, FaSignOutAlt } from "react-icons/fa";
import api from "../../api/axios";

export default function SocietySidebar({ open, onClose }) {
  // ================= LOCALSTORAGE =================
  const SOCIETY_ADMIN_ID = localStorage.getItem("userId");
  const token = localStorage.getItem("jwtToken");

  const [profile, setProfile] = useState({
    adminName: localStorage.getItem("userName") || "",
    adminEmail: localStorage.getItem("userEmail") || "",
    societyName: localStorage.getItem("societyName") || "",
    mobileNumber: ""
  });

  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= UPLOAD IMAGE =================
  const uploadProfileImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);

    await api.post(
      `/society-admins/image/upload/${SOCIETY_ADMIN_ID}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    try {
      await uploadProfileImage();

      // Update backend profile info
      const res = await api.put(
        `/society-admins/${SOCIETY_ADMIN_ID}/update`,
        {
          adminName: form.adminName,
          mobileNumber: form.mobileNumber
        }
      );

      // Update local state + localStorage
      setProfile(res.data);
      setEditMode(false);
      setShowProfile(false);
      setImagePreview(null);

      localStorage.setItem("userName", res.data.adminName);
      if (res.data.adminEmail) {
        localStorage.setItem("userEmail", res.data.adminEmail);
      }
      alert("Profile update Successfully");

    } catch (err) {
      console.error("Profile update failed", err);
      alert("Profile update failed");
    }
  };

  // ================= PROFILE IMAGE =================
  const getProfileImage = (id) =>
    imagePreview ||
    // eslint-disable-next-line react-hooks/purity
    `${api.defaults.baseURL}/society-admins/image/get/society-admin/${id}?t=${Date.now()}`;

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  // ================= NAV LINKS =================
  const links = [
    { name: "Buildings", path: "/society-admin/dashboard", icon: <Building2 size={20} /> },
    { name: "Members / Flats", path: "/society-admin/flatstable", icon: <Users size={20} /> },
    { name: "Notices", path: "/society-admin/notices", icon: <FileText size={20} /> },
    { name: "Complaints", path: "/society-admin/complaints", icon: <AlertCircle size={20} /> },
    { name: "Payments", path: "/society-admin/payments", icon: <DollarSign size={20} /> },
    { name: "Settings", path: "/society-admin/settings", icon: <Settings size={20} /> }
  ];

  return (
    <>
      {/* OVERLAY */}
      {open && <div onClick={onClose} className="fixed inset-0 bg-black/50 z-30 lg:hidden" />}

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (
        <>
          <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/50 z-40" />

          <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Profile" : "My Profile"}
              </h2>
              <FaTimes
                className="cursor-pointer"
                onClick={() => { setShowProfile(false); setEditMode(false); }}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={getProfileImage(SOCIETY_ADMIN_ID)}
                  onError={(e) => (e.target.src = "/default-avatar.png")}
                  className="h-28 w-28 rounded-full border object-cover"
                  alt="profile"
                />
                
                {editMode && (
                  <label
                    htmlFor="profileImage"
                    className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer"
                  >
                    <FaCamera />
                  </label>
                )}
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              <h3 className="text-lg font-semibold">{profile.adminName}</h3>
              <p className="text-gray-600">{profile.societyName}</p>

              {editMode ? (
                <>
                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Enter full name"
                    value={form.adminName}
                    onChange={(e) => setForm({ ...form, adminName: e.target.value })}
                  />

                  <input
                    className="border p-2 w-full rounded bg-gray-100"
                    value={form.adminEmail}
                    disabled
                  />

                  <input
                    className="border p-2 w-full rounded"
                    placeholder="Enter mobile number"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      setForm({ ...form, mobileNumber: e.target.value })
                    }
                  />

                  <button
                    onClick={handleUpdate}
                    className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded w-full"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  {profile.mobileNumber && (
                    <p className="text-gray-600">📞 {profile.mobileNumber}</p>
                  )}

                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-3 text-indigo-600 font-medium"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="mt-2 flex items-center gap-2 text-red-500 font-medium"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed top-0 left-0 h-screen w-64 z-40 text-white
        bg-linear-to-b from-[#0f2027] via-[#203a43] to-[#2c5364]
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className="p-4">
          {profile && (
            <div
              onClick={() => setShowProfile(true)}
              className="flex flex-col items-center mb-8 cursor-pointer"
            >
              <img
                src={getProfileImage(SOCIETY_ADMIN_ID)}
                className="h-25 w-25 rounded-full border-4 border-white/20 object-cover"
                alt="profile"
              />
              <h2 className="mt-2 font-semibold">{profile.adminName}</h2>
              <p className="text-xs text-gray-300">{profile.adminEmail}</p>
            </div>
          )}

          <nav className="flex flex-col gap-2">
            {links.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => onClose && onClose()}
                className={({ isActive }) =>
                  `flex items-center gap-3 p-2 rounded-md transition ${
                    isActive
                      ? "bg-white/20 text-orange-400"
                      : "hover:bg-white/10"
                  }`
                }
              >
                {link.icon}
                {link.name}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}
