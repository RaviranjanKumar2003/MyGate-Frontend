import React, { useEffect, useState } from "react";
import {
  Home,
  Users,
  Truck,
  CreditCard,
  AlertCircle,
  MessageCircle,
  ShoppingBag,
  X
} from "lucide-react";
import { FaCamera, FaSignOutAlt  } from "react-icons/fa";
import { QrCode } from "lucide-react";

import api from "../../api/axios";


function UserSidebar({
  sidebarOpen,
  setSidebarOpen,
  activeScreen,
  setActiveScreen,
  userProfile,
  onLogout,
  menuItems = [] // Updated: now dynamic menu
}) {
  /* ================= STATE ================= */
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const SOCIETY_ID = localStorage.getItem("societyId");

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* ================= PREFILL FORM ================= */
  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || "",
        email: userProfile.email || "",
        mobileNumber: userProfile.mobileNumber || ""
      });
    }
  }, [userProfile]);

  /* ================= IMAGE ================= */
  const getProfileImage = (id) =>
    imagePreview ||
    // eslint-disable-next-line react-hooks/purity
    `${api.defaults.baseURL}/users/image/get/user/${id}?t=${Date.now()}`;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    const fd = new FormData();
    fd.append("image", imageFile);
    await api.post(
      `/users/society/${SOCIETY_ID}/image/upload/${userProfile.id}`,
      fd
    );
  };

  const handleUpdate = async () => {
    try {
      await uploadImage();
      await api.put(
        `/users/society/${userProfile.societyId}/user/${userProfile.id}`,
        {
          name: form.name,
          mobileNumber: form.mobileNumber
        }
      );
      window.location.reload();
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      alert("Profile update failed");
    }
  };

  /* ================= ICON MAP ================= */
  const ICON_MAP = {
    DASHBOARD: <Home size={18} />,
    VISITORS: <Users size={18} />,
    DELIVERIES: <Truck size={18} />,
    PAYMENTS: <CreditCard size={18} />,
    COMPLAINTS: <AlertCircle size={18} />,
    CommunityChat: <MessageCircle size={18} />,
    SocietyBazaar: <ShoppingBag size={18} />,
    MY_QR: <QrCode size={18} />
  };

  return (
    <>
      {/* ================= BACKDROP ================= */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-64 bg-[#0b2a35] text-white
        transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        transition-transform duration-300
        md:relative md:translate-x-0`}
      >
        {/* CLOSE BUTTON */}
        <div className="flex justify-end p-3 md:hidden">
          <X onClick={() => setSidebarOpen(false)} />
        </div>

        {/* ================= PROFILE ================= */}
        {userProfile && (
          <div
            onClick={() => setShowProfile(true)}
            className="flex flex-col items-center cursor-pointer mt-5"
          >
            <img
              src={getProfileImage(userProfile.id)}
              className="h-28 w-28 rounded-full border-4 border-white/20 object-cover"
              alt="profile"
            />
            <h3 className="mt-2 font-semibold">{userProfile.name}</h3>
            <p className="text-xs opacity-80">{userProfile.email}</p>
          </div>
        )}

        {/* ================= MENU ================= */}
        <div className="mt-6">
          {menuItems.map((item) => (
            <div
              key={item.key}
              onClick={() => {
                setActiveScreen(item.key);
                setSidebarOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer
                ${
                  activeScreen === item.key
                    ? "bg-white/20 border-l-4 border-indigo-400"
                    : "hover:bg-white/10"
                }`}
            >
              {ICON_MAP[item.key] || <Home size={18} />}
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && userProfile && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setShowProfile(false)}
          />

          <div
            className="fixed z-50 top-1/2 left-1/2
            -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl p-6 w-[90%] max-w-sm"
          >
            <div className="flex justify-between mb-4">
              <h2 className="font-bold">
                {editMode ? "Edit Profile" : "My Profile"}
              </h2>
              <X onClick={() => setShowProfile(false)} />
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={getProfileImage(userProfile.id)}
                  className="h-24 w-24 rounded-full object-cover"
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer">
                    <FaCamera />
                    <input hidden type="file" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {editMode ? (
                <>
                  <input
                    className="border p-2 w-full rounded"
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                  />
                  <input
                    className="border p-2 w-full rounded bg-gray-100"
                    value={form.email}
                    disabled
                  />
                  <input
                    className="border p-2 w-full rounded"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      setForm({ ...form, mobileNumber: e.target.value })
                    }
                  />

                  <button
                    onClick={handleUpdate}
                    className="bg-indigo-600 text-white w-full py-2 rounded"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p className="font-semibold">{userProfile.name}</p>
                  <p className="text-gray-600">{userProfile.email}</p>

                  <button
                    onClick={() => setEditMode(true)}
                    className="text-indigo-600"
                  >
                    Edit Profile
                  </button>

                  <button
                    onClick={onLogout}
                    className="text-red-500 flex items-center gap-2"
                  >
                    <FaSignOutAlt /> Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default UserSidebar;
