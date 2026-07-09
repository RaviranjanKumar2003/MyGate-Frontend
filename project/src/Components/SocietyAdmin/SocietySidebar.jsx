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

export default function  SocietySidebar({
  open,
  onClose,
  collapsed,
  setCollapsed
}) {
  const SOCIETY_ADMIN_ID = localStorage.getItem("userId");

  const [search, setSearch] = useState("");
  

  const [profile, setProfile] = useState({
    adminName: localStorage.getItem("userName") || "",
    adminEmail: localStorage.getItem("userEmail") || "",
    societyName: localStorage.getItem("societyName") || "",
    mobileNumber: localStorage.getItem("mobileNumber") || ""
  });

  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ ...profile });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

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

  const handleUpdate = async () => {
    try {
      await uploadProfileImage();

      const res = await api.put(
        `/society-admins/${SOCIETY_ADMIN_ID}/update`,
        {
          adminName: form.adminName,
          mobileNumber: form.mobileNumber
        }
      );

      setProfile(res.data);
      setEditMode(false);
      setShowProfile(false);
      setImagePreview(null);

      localStorage.setItem("userName", res.data.adminName);
      if (res.data.adminEmail) {
        localStorage.setItem("userEmail", res.data.adminEmail);
      }
      localStorage.setItem("mobileNumber", res.data.mobileNumber);

      alert("Profile update Successfully");
    } catch (err) {
      console.error("Profile update failed", err);
      alert("Profile update failed");
    }
  };

  const getProfileImage = (id) => {
    if (imagePreview) return imagePreview;

    const baseURL =
      import.meta.env.VITE_API_URL || "http://localhost:8080/api";

    return `${baseURL}/society-admins/image/get/society-admin/${id}?t=${Date.now()}`;
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  const links = [
    { name: "Buildings", path: "/society-admin/dashboard", icon: <Building2 size={20} /> },
    { name: "Members / Flats", path: "/society-admin/flatstable", icon: <Users size={20} /> },
    { name: "Flat Approvals", path: "/society-admin/flat-approvals", icon: <Building2 size={20} /> },
    { name: "Notices", path: "/society-admin/notices", icon: <FileText size={20} /> },
    { name: "Complaints", path: "/society-admin/complaints", icon: <AlertCircle size={20} /> },
    { name: "Payments", path: "/society-admin/payments", icon: <DollarSign size={20} /> },
    { name: "Settings", path: "/society-admin/settings", icon: <Settings size={20} /> }
  ];

  const filteredLinks = links.filter((link) =>
  link.name.toLowerCase().includes(search.toLowerCase())
);

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* PROFILE MODAL */}
      {showProfile && (
  <>
    {/* BACKDROP */}
    <div
      onClick={() => {
        setShowProfile(false);
        setEditMode(false);
      }}
      className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
    />

    {/* MODAL */}
    <div
      className="
      fixed z-60
      top-1/2 left-1/2
      -translate-x-1/2 -translate-y-1/2
      w-[95%] max-w-lg
      overflow-hidden
      rounded-3xl
      bg-white
      shadow-[0_25px_80px_rgba(0,0,0,0.25)]
      "
    >
      {/* COVER */}
      <div
        className="
        h-36
        bg-linear-to-r
        from-indigo-600
        via-violet-600
        to-purple-600
        relative
        "
      >
        {/* CLOSE */}
        <button
          onClick={() => {
            setShowProfile(false);
            setEditMode(false);
          }}
          className="
          absolute top-4 right-4
          h-9 w-9
          rounded-full
          bg-white/20
          backdrop-blur-md
          text-white
          flex items-center justify-center
          hover:bg-white/30
          transition
          "
        >
          <FaTimes />
        </button>
      </div>

      {/* PROFILE IMAGE */}
      <div className="relative flex justify-center">
        <div className="-mt-14 relative">
          <img
            src={getProfileImage(SOCIETY_ADMIN_ID)}
            onError={(e) =>
              (e.target.src = "/default-avatar.png")
            }
            className="
            h-28 w-28
            rounded-full
            object-cover
            border-[5px] border-white
            shadow-xl
            "
            alt="profile"
          />

          {editMode && (
            <label
              htmlFor="profileImage"
              className="
              absolute bottom-0 right-0
              h-10 w-10
              rounded-full
              bg-indigo-600
              text-white
              flex items-center justify-center
              cursor-pointer
              shadow-lg
              hover:bg-indigo-700
              "
            >
              <FaCamera />
            </label>
          )}

          <input
            type="file"
            id="profileImage"
            className="hidden"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="px-6 pb-8 pt-4">

        {/* NAME */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-800">
            {profile.adminName}
          </h2>

          <p className="text-slate-500 mt-1">
            Society Administrator
          </p>

          <div
            className="
            inline-flex
            mt-3
            px-4 py-1.5
            rounded-full
            bg-indigo-50
            text-indigo-600
            text-sm
            font-medium
            "
          >
            {profile.societyName}
          </div>
        </div>

        {/* EDIT MODE */}
        {editMode ? (
          <div className="space-y-4">

            {/* NAME */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Full Name
              </label>

              <input
                value={form.adminName}
                onChange={(e) =>
                  setForm({
                    ...form,
                    adminName: e.target.value,
                  })
                }
                className="
                mt-1
                w-full
                px-4 py-3
                rounded-xl
                border border-slate-200
                focus:ring-2
                focus:ring-indigo-500
                outline-none
                "
              />
            </div>

            {/* EMAIL */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Email Address
              </label>

              <input
                value={form.adminEmail}
                disabled
                className="
                mt-1
                w-full
                px-4 py-3
                rounded-xl
                bg-slate-100
                text-slate-500
                border border-slate-200
                "
              />
            </div>

            {/* MOBILE */}
            <div>
              <label className="text-sm font-medium text-slate-600">
                Mobile Number
              </label>

              <input
                value={form.mobileNumber}
                onChange={(e) =>
                  setForm({
                    ...form,
                    mobileNumber: e.target.value,
                  })
                }
                className="
                mt-1
                w-full
                px-4 py-3
                rounded-xl
                border border-slate-200
                focus:ring-2
                focus:ring-indigo-500
                outline-none
                "
              />
            </div>

            {/* BUTTONS */}
            <div className="grid grid-cols-2 gap-3 pt-3">

              <button
                onClick={() => setEditMode(false)}
                className="
                py-3
                rounded-xl
                border
                border-slate-300
                font-medium
                hover:bg-slate-100
                "
              >
                Cancel
              </button>

              <button
                onClick={handleUpdate}
                className="
                py-3
                rounded-xl
                bg-gradient-to-r
                from-indigo-600
                to-violet-600
                text-white
                font-semibold
                shadow-lg
                hover:scale-[1.02]
                transition
                "
              >
                Save Changes
              </button>

            </div>
          </div>
        ) : (
          <>
            {/* INFO CARDS */}
            <div className="space-y-3">

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Email Address
                </p>

                <p className="font-medium text-slate-800 mt-1">
                  {profile.adminEmail}
                </p>
              </div>

              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs text-slate-500">
                  Mobile Number
                </p>

                <p className="font-medium text-slate-800 mt-1">
                  {profile.mobileNumber || "Not Added"}
                </p>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="mt-6 flex gap-3">

              <button
                onClick={() => setEditMode(true)}
                className="
                flex-1
                py-3
                rounded-xl
                bg-indigo-600
                text-white
                font-semibold
                hover:bg-indigo-700
                transition
                "
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                className="
                flex-1
                py-3
                rounded-xl
                border border-red-200
                text-red-600
                font-semibold
                hover:bg-red-50
                transition
                "
              >
                Logout
              </button>

            </div>
          </>
        )}
      </div>
    </div>
  </>
)}

{/* SIDEBAR */}
<aside
  className={`fixed top-0 left-0 h-screen z-40
  ${collapsed ? "w-20" : "w-72"}
  bg-white
  border-r border-slate-200
  shadow-xl
  transition-all duration-300
  ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
>
  <div className="h-full flex flex-col p-4">

    {/* HEADER */}
    <div className="mb-5">

      <div className="flex items-center justify-between">

  {/* PROFILE */}
  <div
    onClick={() => setShowProfile(true)}
    className={`flex items-center gap-3 cursor-pointer ${
      collapsed ? "justify-center w-full" : ""
    }`}
  >
    <img
      src={getProfileImage(SOCIETY_ADMIN_ID)}
      className="h-11 w-11 rounded-full object-cover border-2 border-slate-300"
      alt="profile"
    />

    {!collapsed && (
      <div>
        <h3 className="font-semibold text-slate-800 text-sm">
          {profile.adminName}
        </h3>

        <p className="text-xs text-slate-500">
          Society Admin
        </p>
      </div>
    )}
  </div>

  {/* DESKTOP COLLAPSE */}
  {!collapsed && (
    <button
      onClick={() => setCollapsed(true)}
      className="
      hidden lg:flex
      h-8 w-8
      items-center justify-center
      rounded-lg
      border border-slate-200
      hover:bg-slate-100
      "
    >
      ❮
    </button>
  )}

  {/* MOBILE CLOSE */}
  <button
    onClick={onClose}
    className="
    lg:hidden
    h-9 w-9
    flex items-center justify-center
    rounded-lg
    border border-slate-200
    hover:bg-slate-100
    text-slate-700
    "
  >
    <FaTimes size={16} />
  </button>
</div>

      {collapsed && (
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCollapsed(false)}
            className="h-8 w-8 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-700"
          >
            ❯
          </button>
        </div>
      )}

      {!collapsed && (
        <div className="mt-5">
          <input
            type="text"
            placeholder="Search Menu"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
            w-full
            px-4 py-2.5
            rounded-xl
            border border-slate-200
            bg-slate-50
            text-sm
            text-slate-700
            placeholder:text-slate-400
            focus:outline-none
            focus:ring-2
            focus:ring-indigo-500
            "
          />
        </div>
      )}
    </div>

    {/* NAVIGATION */}
    <nav
      className="
      sidebar-scroll
      flex-1
      overflow-y-auto
      flex flex-col
      gap-1
      pr-1
      "
    >
      {filteredLinks.map((link) => (
        <NavLink
          key={link.name}
          to={link.path}
          onClick={() => onClose && onClose()}
        >
          {({ isActive }) => (
            <div
              title={collapsed ? link.name : ""}
              className={`
              flex items-center
              ${collapsed ? "justify-center" : "gap-4"}
              px-3 py-3
              rounded-xl
              transition-all duration-200
              ${
                isActive
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-slate-600 hover:bg-slate-100"
              }
              `}
            >
              <div
                className={`
                flex items-center justify-center
                h-10 w-10 rounded-lg
                ${isActive ? "bg-indigo-100" : ""}
                `}
              >
                {link.icon}
              </div>

              {!collapsed && (
                <span className="text-sm font-medium">
                  {link.name}
                </span>
              )}
            </div>
          )}
        </NavLink>
      ))}
    </nav>

    {/* FOOTER */}
    <div className="pt-4 mt-4 border-t border-slate-200">

      <button
        onClick={handleLogout}
        className={`
        w-full flex items-center
        ${collapsed ? "justify-center" : "justify-center gap-3"}
        px-4 py-3 rounded-xl
        text-red-600
        hover:bg-red-50
        transition-all duration-200
        `}
      >
        <FaSignOutAlt size={16} />

        {!collapsed && (
          <span className="font-medium">
            Logout
          </span>
        )}
      </button>

    </div>

  </div>
</aside>
    </>
  );
}