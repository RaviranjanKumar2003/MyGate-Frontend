import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Building2, PlusCircle, Bell, AlertTriangle,Wallet ,CreditCard } from "lucide-react";
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
      
      {showProfile && profile && (
        <div className="fixed z-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl">
          <div className="flex justify-between mb-4">
            <h2 className="text-xl font-bold">{editMode ? "Edit Profile" : "My Profile"}</h2>
            <FaTimes className="cursor-pointer text-xl" onClick={() => { setShowProfile(false); setEditMode(false); }} />
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img src={imagePreview || getProfileImage(profile.id)} className="h-28 w-28 rounded-full border object-cover" alt="profile" onError={e => e.target.src="/default-avatar.png"} />
              {editMode && <label htmlFor="profileImage" className="absolute bottom-0 right-0 bg-indigo-600 text-white p-2 rounded-full cursor-pointer border border-white"><FaCamera /></label>}
              <input type="file" id="profileImage" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>

            {editMode ? (
              <>
                <input className="border p-2 w-full rounded" placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                <input className="border p-2 w-full rounded" placeholder="Email" value={form.email} disabled />
                <input className="border p-2 w-full rounded" placeholder="Mobile Number" value={form.mobileNumber} onChange={e => setForm({ ...form, mobileNumber: e.target.value })} />
                <button onClick={handleUpdate} className="mt-3 bg-indigo-600 text-white px-4 py-2 rounded w-full">Save Changes</button>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold">{profile.name}</h3>
                <p className="text-gray-600">{profile.email}</p>
                <p className="text-gray-600">📞 {profile.mobileNumber}</p>
                <button onClick={() => setEditMode(true)} className="mt-3 text-indigo-600 font-medium">Edit Profile</button>
                <button onClick={handleLogout} className="mt-2 text-red-500 font-medium">Logout</button>
              </>
            )}
          </div>
        </div>
      )}

      {open && <div onClick={onClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />}

      <aside className={`fixed top-15 left-0 h-[calc(100vh-60px)] w-65 bg-linear-to-b from-[#0f2027] via-[#203a43] to-[#2c5364] z-50 transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        <div className="px-4 text-white">
          {profile && (
            <div onClick={() => setShowProfile(true)} className="mt-6 flex flex-col items-center cursor-pointer">
              <img src={getProfileImage(profile.id)} className="h-24 w-24 rounded-full border-4 border-white/20 object-cover" alt="profile" />
              <h2 className="mt-2">{profile.name}</h2>
              <p className="text-xs text-gray-400">{profile.email}</p>
            </div>
          )}

          <div className="mt-8 space-y-2">
            <SidebarItem icon={<Building2 size={18} />} label="All Societies" active={activeMenu === "society"} onClick={() => setActiveMenu("society")} />
            <SidebarItem icon={<PlusCircle size={18} />} label="Create Society" active={activeMenu === "create-society"} onClick={() => setActiveMenu("create-society")} />
            <SidebarItem icon={<Bell size={18} />} label="Notice" active={activeMenu === "notice"} onClick={() => setActiveMenu("notice")} />
            <SidebarItem icon={<AlertTriangle size={18} />} label="Complain" active={activeMenu === "complain"} onClick={() => setActiveMenu("complain")} />
            <SidebarItem icon={<CreditCard  size={18} />} label="Payment" active={activeMenu === "superpayment"} onClick={() => setActiveMenu("superpayment")} />
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
