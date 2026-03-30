import { useEffect, useState } from "react";
import api from "../../../api/axios";

import {
  X,
  UserPlus,
  Baby,
  UserCheck,
  ArrowLeftRight,
  Shuffle,
  Gift,
  Play,
  AlertTriangle,
  Smartphone,
  Phone,
  Users,
  ShieldAlert
} from "lucide-react";
import { FaCamera, FaSignOutAlt } from "react-icons/fa";

export default function ThreeDot({ onClose = () => {} }) {


  const USER_ID = localStorage.getItem("userId");
  const SOCIETY_ID = localStorage.getItem("societyId");

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
    if (!USER_ID || !SOCIETY_ID) return;

    api
      .get(`/users/society/${SOCIETY_ID}/user/${USER_ID}`)
      .then((res) => {
        setProfile(res.data);
        setForm({
          name: res.data.name ?? "",
          email: res.data.email ?? "",
          mobileNumber: res.data.mobileNumber ?? ""
        });
      })
      .catch(console.error);
  }, [USER_ID, SOCIETY_ID]);

  const getProfileImage = (id) =>
    imagePreview ||
    // eslint-disable-next-line react-hooks/purity
    `${api.defaults.baseURL}/users/image/get/user/${id}?t=${Date.now()}`;

  /* ================= IMAGE ================= */
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
    await api.post(`/users/image/upload/${USER_ID}`, fd);
  };

  const handleUpdate = async () => {
    try {
      await uploadImage();
      const res = await api.put(
        `/users/society/${SOCIETY_ID}/user/${USER_ID}`,
        { name: form.name, mobileNumber: form.mobileNumber }
      );
      setProfile(res.data);
      setEditMode(false);
    } catch {
      alert("Profile update failed");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login";
  };

  if (!profile) return null;

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-40 bg-black/40" onClick={onClose} />

      {/* SIDEBAR */}
      <aside className="fixed right-0 top-0 z-50 h-full w-full bg-[#f7f7f7] shadow-xl overflow-y-auto">
        {/* HEADER */}
        <div className="relative bg-[#0b2a35] text-white px-4 py-10">
          <X className="absolute right-4 top-4 cursor-pointer" onClick={onClose}/>

          <div onClick={() => setShowProfile(true)} className="flex flex-col items-center cursor-pointer">
            <img
              src={getProfileImage(profile.id)}
              className="h-30 w-30 rounded-full object-cover border-2 border-white"
              alt="profile"
            />
            <h2 className="mt-3 font-semibold text-lg">{profile.name}</h2>
            <p className="text-xs text-white/80">{profile.email}</p>
          </div>
        </div>

        {/* GRID MENU */}
        <div className="grid grid-cols-3 gap-6 p-4 text-black text-lg">
          <MenuCircle icon={<UserPlus size={30} />} label="Add Data" onClick={() => { onClose(); localStorage.setItem("staffTab", "ADD_DATA"); window.dispatchEvent(new Event("staff-tab-change"));}}/>
          <MenuCircle icon={<Baby size={30} />} label="Kid Checkout" onClick={() => { onClose(); localStorage.setItem("staffTab", "KID_CHECK"); window.dispatchEvent(new Event("staff-tab-change"));}}/>
          <MenuCircle icon={<UserCheck size={30} />} label="Provider Inside" />
          <MenuCircle icon={<ArrowLeftRight size={30} />} label="In Out History" />
          <MenuCircle icon={<Shuffle size={30} />} label="Guard Patrolling" />
          <MenuCircle icon={<Gift size={30} />} label="Parcel List" />
          <MenuCircle icon={<Play size={30} />} label="Training Videos" />
          <MenuCircle icon={<AlertTriangle size={30} />} label="Report Incident" />
          <MenuCircle icon={<Smartphone size={30} />} label="Fix Device" />
          <MenuCircle icon={<UserCheck size={30} newTag />} label="Support"  />
        </div>

        {/* SIMPLE LIST */}
        <div className="px-4 mt-4 pb-6 space-y-8 text-lg text-black">
          <ListItem icon={<Phone />} label="Guard Calling" />
          <ListItem icon={<Users />} label="Resident Directory" />
          <ListItem icon={<ShieldAlert />} label="Emergency Contacts" />
        </div>
      </aside>

      {/* ================= PROFILE MODAL ================= */}
      {showProfile && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/50"
            onClick={() => setShowProfile(false)}
          />

          <div className="fixed z-60 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            bg-white rounded-xl p-6 w-[90%] max-w-sm">

            <div className="flex justify-between mb-4 text-black">
              <h2 className="text-lg font-bold">
                {editMode ? "Edit Profile" : "My Profile"}
              </h2>
              <X
                className="cursor-pointer"
                onClick={() => {
                  if (editMode) setEditMode(false);
                  else setShowProfile(false);
                }}
              />
            </div>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <img src={getProfileImage(profile.id)} className="h-30 w-30 rounded-full object-cover"/>
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
                    className="border p-2 w-full rounded text-black"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                  <input className="border text-black p-2 w-full rounded bg-gray-100" value={form.email} disabled />
                  <input
                    className="border p-2 w-full rounded text-black"
                    value={form.mobileNumber}
                    onChange={(e) =>
                      setForm({ ...form, mobileNumber: e.target.value })
                    }
                  />
                  <button
                    onClick={handleUpdate}
                    className="bg-indigo-600 text-white w-full py-2 rounded">
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  <p className=" text-black font-bold text-xl">{profile.name}</p>
                  <p className="text-gray-600 text-lg">{profile.email}</p>

                  <button
                    onClick={() => setEditMode(true)}
                    className="text-indigo-600 text-lg">
                    Edit Profile
                  </button>

                  <button
                    onClick={handleLogout}
                    className="text-red-500 flex items-center gap-2 text-lg">
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

/* ================= UI COMPONENTS ================= */

const MenuCircle = ({ icon, label, onClick }) => (
  <div
    className="flex flex-col items-center gap-2 cursor-pointer"
    onClick={onClick}
  >
    <div className="h-16 w-16 rounded-full bg-white shadow
      flex items-center justify-center text-gray-700">
      {icon}
    </div>
    <p className="text-sm text-center">{label}</p>
  </div>
);


const ListItem = ({ icon, label, newTag }) => (
  <div className="flex items-center gap-3 cursor-pointer">
    <div className="text-gray-600">{icon}</div>
    <span className="flex items-center gap-2">
      {label}
      {newTag && (
        <span className="text-[10px] bg-red-500 text-white px-1.5 rounded">
          NEW
        </span>
      )}
    </span>
  </div>
);
