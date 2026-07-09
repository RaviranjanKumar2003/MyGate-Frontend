import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Building2, PlusCircle, Bell, AlertTriangle,Wallet ,CreditCard,X, } from "lucide-react";
import { FaTimes, FaCamera } from "react-icons/fa";

function Sidebar({ open, onClose, activeMenu, setActiveMenu }) {
  const token = localStorage.getItem("jwtToken");
  const SUPER_ADMIN_ID = localStorage.getItem("userId");

  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobileNumber: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // ================= FETCH LOGGED-IN SUPER ADMIN =================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/super-admins/${SUPER_ADMIN_ID}`);
        setProfile(res.data);
        setForm({
          name: res.data.name || "",
          email: res.data.email || "",
          mobileNumber: res.data.mobileNumber || ""
        });
      } catch (error) {
        console.error("Profile fetch failed", error);
      }
    };

    if (token && SUPER_ADMIN_ID) fetchProfile();
  }, [token, SUPER_ADMIN_ID]);

  // ================= IMAGE CHANGE =================
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ================= IMAGE UPLOAD =================
  const uploadProfileImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);

    await api.post(`/super-admins/image/upload/super-admin/${SUPER_ADMIN_ID}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  // ================= UPDATE PROFILE =================
  const handleUpdate = async () => {
    try {
      await uploadProfileImage();
      const res = await api.put(`/super-admins/${SUPER_ADMIN_ID}`, form);
      setProfile(res.data);
      setEditMode(false);
      setShowProfile(false);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      console.error("Update failed", error);
      alert("Update failed. Check backend.");
    }
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    localStorage.removeItem("userId");
    window.location.href = "/login";
  };

  // eslint-disable-next-line react-hooks/purity
  const getProfileImage = (id) => `${api.defaults.baseURL}/super-admins/image/get/super-admin/${id}?t=${Date.now()}`;

  return (
    <>
      {showProfile && <div onClick={() => setShowProfile(false)} className="fixed inset-0 bg-black/50 backdrop-blur-md z-50" />}
      
      {/* Overlay */}
{showProfile && (
  <div
    onClick={() => setShowProfile(false)}
    className="
    fixed inset-0
    bg-black/60
    backdrop-blur-md
    z-50
    animate-in fade-in duration-300
    "
  />
)}

{/* Profile Modal */}
{showProfile && profile && (
  <div
    className="
    fixed z-[60]
    top-1/2 left-1/2
    -translate-x-1/2 -translate-y-1/2

    w-[95%] max-w-md

    bg-white
    rounded-3xl
    overflow-hidden

    shadow-[0_25px_80px_rgba(0,0,0,0.35)]
    border border-white/20
    "
  >
    {/* Header */}
    <div
      className="
      relative
      bg-gradient-to-r
      from-cyan-600
      via-blue-600
      to-indigo-700

      px-6 py-8
      text-white
      "
    >
      <button
        onClick={() => {
          setShowProfile(false);
          setEditMode(false);
        }}
        className="
        absolute top-4 right-4
        h-10 w-10
        rounded-xl
        bg-white/10
        hover:bg-white/20
        flex items-center justify-center
        transition-all
        "
      >
        <FaTimes />
      </button>

      <div className="flex flex-col items-center">

        {/* Profile Image */}
        <div className="relative">

          <img
            src={
              imagePreview ||
              getProfileImage(profile.id)
            }
            alt="profile"
            onError={(e) =>
              (e.target.src =
                "/default-avatar.png")
            }
            className="
            h-28 w-28
            rounded-full
            object-cover

            border-4 border-white
            shadow-xl
            "
          />

          {editMode && (
            <label
              htmlFor="profileImage"
              className="
              absolute bottom-0 right-0

              h-10 w-10
              rounded-full

              bg-slate-900
              text-white

              flex items-center justify-center

              cursor-pointer

              border-2 border-white
              "
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

        <h2 className="mt-4 text-2xl font-bold">
          {profile.name}
        </h2>

        <p className="text-white/80 text-sm">
          Super Administrator
        </p>

        <div className="mt-3 px-4 py-1 rounded-full bg-white/15 border border-white/20 text-xs">
          Active Account
        </div>
      </div>
    </div>

    {/* Body */}
    <div className="p-6">

      {editMode ? (
        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Full Name
            </label>

            <input
              className="
              w-full
              px-4 py-3
              rounded-xl

              border border-slate-200
              bg-slate-50

              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              "
              placeholder="Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Email Address
            </label>

            <input
              disabled
              value={form.email}
              className="
              w-full
              px-4 py-3
              rounded-xl

              border border-slate-200
              bg-slate-100
              text-slate-500
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Mobile Number
            </label>

            <input
              className="
              w-full
              px-4 py-3
              rounded-xl

              border border-slate-200
              bg-slate-50

              focus:outline-none
              focus:ring-2
              focus:ring-cyan-500
              "
              placeholder="Mobile Number"
              value={form.mobileNumber}
              onChange={(e) =>
                setForm({
                  ...form,
                  mobileNumber:
                    e.target.value,
                })
              }
            />
          </div>

          <button
            onClick={handleUpdate}
            className="
            w-full
            py-3

            rounded-xl

            bg-gradient-to-r
            from-cyan-500
            to-blue-600

            text-white
            font-semibold

            hover:scale-[1.02]
            transition-all
            "
          >
            Save Changes
          </button>
        </div>
      ) : (
        <div className="space-y-5">

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">
              Full Name
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {profile.name}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">
              Email Address
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {profile.email}
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500">
              Mobile Number
            </p>

            <p className="font-semibold text-slate-800 mt-1">
              {profile.mobileNumber}
            </p>
          </div>

          <div className="flex gap-3">

            <button
              onClick={() =>
                setEditMode(true)
              }
              className="
              flex-1
              py-3

              rounded-xl

              bg-gradient-to-r
              from-cyan-500
              to-blue-600

              text-white
              font-medium
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

              bg-red-50
              text-red-600

              border border-red-200

              font-medium
              hover:bg-red-100
              transition-all
              "
            >
              Logout
            </button>

          </div>
        </div>
      )}
    </div>
  </div>
)}

      {open && <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />}

      <aside
  className={`fixed top-0 left-0 h-screen w-72
  bg-linear-to-br from-slate-950 via-slate-900 to-slate-800
  backdrop-blur-xl border-r border-white/10
  shadow-[0_0_50px_rgba(0,0,0,0.5)]
  z-50 transition-all duration-300
  ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
>
  <div className="h-full flex flex-col text-white">

    {/* Mobile Header */}
    <div className="lg:hidden flex items-center justify-between px-5 py-4 border-b border-white/10">
      <h2 className="font-semibold text-lg">
        Menu
      </h2>

      <button
        onClick={onClose}
        className="
        h-10 w-10
        rounded-xl
        bg-white/5
        border border-white/10
        flex items-center justify-center
        hover:bg-red-500/20
        hover:border-red-500/30
        transition-all
        "
      >
        <X size={20} />
      </button>
    </div>

    <div className="flex-1 px-5 py-6 overflow-y-auto">

      {/* Profile Card */}
      {profile && (
        <div
          onClick={() => setShowProfile(true)}
          className="relative cursor-pointer group"
        >
          <div className="bg-white/5 border border-white/10 rounded-3xl p-5 backdrop-blur-xl hover:bg-white/10 transition-all duration-300">

            <div className="flex flex-col items-center">

              <div className="relative">
                <img
                  src={getProfileImage(profile.id)}
                  alt="profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-cyan-400 shadow-lg shadow-cyan-500/30"
                />

                <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-slate-900"></span>
              </div>

              <h2 className="mt-4 font-bold text-lg text-white">
                {profile.name}
              </h2>

              <p className="text-xs text-slate-400 text-center truncate w-full">
                {profile.email}
              </p>

              <div className="mt-3 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-xs">
                Super Admin
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menu */}
      <div className="mt-8 space-y-2">
        <SidebarItem
          icon={<Building2 size={20} />}
          label="All Societies"
          active={activeMenu === "society"}
          onClick={() => {
            setActiveMenu("society");
            onClose?.();
          }}
        />

        <SidebarItem
          icon={<PlusCircle size={20} />}
          label="Create Society"
          active={activeMenu === "create-society"}
          onClick={() => {
            setActiveMenu("create-society");
            onClose?.();
          }}
        />

        <SidebarItem
          icon={<Bell size={20} />}
          label="Notice"
          active={activeMenu === "notice"}
          onClick={() => {
            setActiveMenu("notice");
            onClose?.();
          }}
        />

        <SidebarItem
          icon={<AlertTriangle size={20} />}
          label="Complaint"
          active={activeMenu === "complain"}
          onClick={() => {
            setActiveMenu("complain");
            onClose?.();
          }}
        />

        <SidebarItem
          icon={<CreditCard size={20} />}
          label="Payment"
          active={activeMenu === "superpayment"}
          onClick={() => {
            setActiveMenu("superpayment");
            onClose?.();
          }}
        />
      </div>
    </div>

    {/* Footer */}
    <div className="border-t border-white/10 p-5">
      <div className="bg-linear-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 rounded-2xl p-4">
        <p className="text-sm text-slate-300">
          Society Management
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Premium Admin Dashboard
        </p>
      </div>
    </div>

  </div>
</aside>
    </>
  );
}

export default Sidebar;

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <div onClick={onClick} className={`flex items-center gap-3 px-4 py-2 rounded-md cursor-pointer ${active ? "bg-white/20 text-orange-400" : "text-gray-200 hover:bg-white/10"}`}>
      {icon}<span>{label}</span>
    </div>
  );
}
