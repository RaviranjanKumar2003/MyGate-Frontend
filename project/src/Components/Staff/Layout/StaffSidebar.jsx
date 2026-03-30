import { useEffect, useState } from "react";
import api from "./../../../api/axios";
import {
  Hash,
  Repeat,
  User,
  Bell,
  Users,
  Bike,
  Car
} from "lucide-react";
import { FaTimes, FaCamera, FaSignOutAlt } from "react-icons/fa";
import StaffTopbar from "../StaffTopbar";

function StaffSidebar({ open, onClose, activeTab, setActiveTab }) {
  const STAFF_ID = localStorage.getItem("userId");
  const SOCIETY_ID = localStorage.getItem("societyId");

  /* ================= STATE ================= */
  const [profile, setProfile] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    mobileNumber: ""
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  /* ================= FETCH PROFILE ================= */
  useEffect(() => {
    if (!STAFF_ID || !SOCIETY_ID) return;

    const fetchProfile = async () => {
      try {
        const res = await api.get(
          `/users/society/${SOCIETY_ID}/user/${STAFF_ID}`
        );
        setProfile(res.data);
        setForm({
          name: res.data.name ?? "",
          email: res.data.email ?? "",
          mobileNumber: res.data.mobileNumber ?? ""
        });
      } catch (err) {
        console.error("Failed to fetch staff profile", err);
      }
    };

    fetchProfile();
  }, [STAFF_ID, SOCIETY_ID]);

  /* ================= IMAGE ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return;
    const formData = new FormData();
    formData.append("image", imageFile);
    await api.post(`/users/society/${SOCIETY_ID}/image/upload/${STAFF_ID}`, formData, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  };

  /* ================= UPDATE PROFILE ================= */
  const handleUpdate = async () => {
    try {
      await uploadImage();
      const res = await api.put(
        `/users/society/${SOCIETY_ID}/user/${STAFF_ID}`,
        {
          name: form.name,
          mobileNumber: form.mobileNumber
        }
      );
      setProfile(res.data);
      setEditMode(false);
      setShowProfile(false);
      setImagePreview(null);
      setImageFile(null);
    } catch {
      alert("Profile update failed");
    }
  };

  const getProfileImage = (id) =>
    imagePreview ||
    `${api.defaults.baseURL}/users/image/get/user/${id}?t=${Date.now()}`;

  /* ================= LOGOUT ================= */
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (!profile) return null;

  return (
    <>
      {/* DESKTOP TOPBAR */}
      <div className="hidden lg:block">
        <StaffTopbar />
      </div>

      {/* MOBILE BACKDROP */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
        />
      )}

      {/* ================= SIDEBAR ================= */}
      <aside
        className={`fixed lg:static top-0 left-0 h-screen w-64
        bg-[#0b1d2d] text-white z-40
        transition-transform duration-300
        ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* PROFILE */}
        <div
          onClick={() => setShowProfile(true)}
          className="mt-6 flex flex-col items-center cursor-pointer border-b border-white/10 pb-4"
        >
          <img
            src={getProfileImage(profile.id)}
            className="h-20 w-20 rounded-full object-cover border"
            alt="profile"
            onError={(e) => (e.target.src = "/default-avatar.png")}
          />
          <h2 className="mt-2 font-semibold">{profile.name}</h2>
          <p className="text-xs text-gray-400">{profile.email}</p>
        </div>

        {/* MENU */}
        <div className="mt-6 space-y-1 px-3">
          <Menu icon={<Hash />} label="Enter Code" tab="ENTER_CODE" {...menuProps()} />
          <Menu icon={<Repeat />} label="Freq Visitor" tab="FREQ_VISITOR" {...menuProps()} />
          <Menu icon={<User />} label="Visitor" tab="VISITOR" {...menuProps()} />
          <Menu icon={<Bell />} label="Notice" tab="NOTICE" {...menuProps()} />

          <div className="border-t border-white/20 mt-4 pt-3">
            <Menu icon={<Users />} label="Guest" tab="GUEST" {...menuProps()} />
            <Menu icon={<Bike />} label="Delivery" tab="DELIVERY" {...menuProps()} />
            <Menu icon={<Car />} label="Cab" tab="CAB" {...menuProps()} />
          </div>
        </div>
      </aside>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (
        <>
          <div
            onClick={() => setShowProfile(false)}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <div className="fixed z-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl p-6 w-[90%] max-w-md">

            <div className="flex justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editMode ? "Edit Profile" : "My Profile"}
              </h2>
              <FaTimes
                className="cursor-pointer"
                onClick={() => {
                  setShowProfile(false);
                  setEditMode(false);
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img
                  src={getProfileImage(profile.id)}
                  className="h-28 w-28 rounded-full object-cover border"
                  alt="profile"
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer">
                    <FaCamera />
                    <input type="file" hidden onChange={handleImageChange} />
                  </label>
                )}
              </div>

              {editMode ? (
                <>
                  <input
                    className="border p-2 w-full rounded"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input className="border p-2 w-full rounded bg-gray-100" value={form.email} disabled />
                  <input
                    className="border p-2 w-full rounded"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      setForm({ ...form, mobileNumber: e.target.value })
                    }
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded w-full"
                  >
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <p>{profile.name}</p>
                  <p className="text-gray-600">{profile.email}</p>
                  <p className="text-gray-600">{profile.mobileNumber}</p>

                  <button onClick={() => setEditMode(true)} className="text-indigo-600">
                    Edit Profile
                  </button>

                  <button onClick={handleLogout} className="text-red-500 flex items-center gap-2">
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

  function menuProps() {
    return { activeTab, setActiveTab, onClose };
  }
}

export default StaffSidebar;

/* ================= MENU ITEM ================= */
const Menu = ({ icon, label, tab, activeTab, setActiveTab, onClose }) => {
  const isActive = activeTab === tab;

  return (
    <div
      onClick={() => {
        setActiveTab(tab);
        onClose?.();
      }}
      className={`flex items-center gap-3 px-3 py-2 rounded cursor-pointer
        transition
        ${isActive
          ? "bg-indigo-600 text-white"
          : "text-gray-300 hover:bg-white/10 hover:text-white"}
      `}
    >
      {icon}
      <span className="text-sm">{label}</span>
    </div>
  );
};
