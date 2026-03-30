import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { Eye } from "lucide-react";

/* ================= STATUS MAP ================= */
const statusMap = {
  VACANT: { label: "Vacant", color: "bg-yellow-200 text-yellow-800" },
  OWNER_OCCUPIED: { label: "Owner Occupied", color: "bg-green-200 text-green-800" },
  TENANT_OCCUPIED: { label: "Tenant Occupied", color: "bg-green-300 text-green-900" },
  UNDER_MAINTENANCE: { label: "Under Maintenance", color: "bg-red-200 text-red-800" },
  BLOCKED: { label: "Blocked", color: "bg-gray-300 text-gray-800" },
  FOR_SALE: { label: "For Sale", color: "bg-blue-200 text-blue-800" },
  FOR_RENT: { label: "For Rent", color: "bg-indigo-200 text-indigo-800" },
  NEW_ALLOTMENT: { label: "New Allotment", color: "bg-purple-200 text-purple-800" },
};

const ALLOW_ADD_MEMBER = ["VACANT", "FOR_SALE", "FOR_RENT"];

/* ================= STATUS CARDS ================= */
function StatusCards({ counts }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {Object.keys(statusMap).map(key => (
        <div key={key} className={`p-4 rounded shadow ${statusMap[key].color}`}>
          <p className="text-sm font-medium">{statusMap[key].label}</p>
          <p className="text-2xl font-bold">{counts[key] ?? 0}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= MAIN COMPONENT ================= */
export default function FlatsOverview() {
  const BASE_URL = "http://localhost:9090/api";
  const SOCIETY_ID = Number(localStorage.getItem("societyId"));
  console.log(SOCIETY_ID);
  
  

  /* ================= STATE ================= */
  const [buildings, setBuildings] = useState([]);
  const [floors, setFloors] = useState([]);
  const [flats, setFlats] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});

  const [buildingId, setBuildingId] = useState("");
  const [floorId, setFloorId] = useState("");
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  const [editFlat, setEditFlat] = useState(null);
  const [editNumber, setEditNumber] = useState("");
  const [editStatus, setEditStatus] = useState("");

  /* ADD MEMBER */
  const [memberFlat, setMemberFlat] = useState(null);
  const [member, setMember] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    normalUserType: "",
  });

  /* VIEW MEMBER */
  const [viewFlat, setViewFlat] = useState(null);
  const [viewMember, setViewMember] = useState(null);
  const [loadingMember, setLoadingMember] = useState(false);

  /* STAFF */
  const staffTypes = ["MAID", "DRIVER", "COOK", "SECURITY", "ACCOUNTANT", "CLEANER"];
  const staffLevels = ["FLAT", "FLOOR", "BUILDING", "SOCIETY"];
  const [staffList, setStaffList] = useState([]);
  const [staffModal, setStaffModal] = useState(false);
  const [staff, setStaff] = useState({
    name: "",
    email: "",
    password: "",
    mobileNumber: "",
    staffType: "",
    staffLevel: "",
    dutyTiming: "",
    salary: "",
  });

  const [imageFile, setImageFile] = useState(null); // for both member/staff

  /* ================= LOAD STAFF ================= */
  /* ================= LOAD STAFF ================= */
const loadStaff = async () => {
  try {
    const res = await axios.get(`${BASE_URL}/users/society/${SOCIETY_ID}/role/STAFF`);
    setStaffList(res.data);
  } catch (err) {
    console.error("Failed to load staff:", err);
  }
};


  useEffect(() => {
    loadStaff();
  }, []);

  /* ================= SAVE STAFF ================= */
  const saveStaff = async () => {
    try {
      const payload = {
        ...staff,
        userRole: "STAFF",
        userStatus: "ACTIVE",
        societyId: SOCIETY_ID,
      };

      const res = await axios.post(`${BASE_URL}/users`, payload);
      const createdStaff = res.data;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);

        await axios.post(
          `${BASE_URL}/users/society/${SOCIETY_ID}/image/upload/${createdStaff.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      alert("✅ Staff added successfully");
      setStaffModal(false);
      setStaff({
        name: "",
        email: "",
        password: "",
        mobileNumber: "",
        staffType: "",
        staffLevel: "",
        dutyTiming: "",
        salary: "",
      });
      setImageFile(null);
      loadStaff();
    } catch (err) {
      console.error(err);
      alert("❌ Failed to add staff");
    }
  };

  /* ================= COUNTS ================= */
  const loadCounts = async () => {
    const data = {};
    for (const st of Object.keys(statusMap)) {
      const res = await axios.get(
        `${BASE_URL}/flats/society/${SOCIETY_ID}/status/${st}/count`
      );
      data[st] = res.data;
    }
    setStatusCounts(data);
  };

  useEffect(() => {
    loadCounts();
  }, []);

  /* ================= BUILDINGS ================= */
  useEffect(() => {
    axios.get(`${BASE_URL}/societies/${SOCIETY_ID}/buildings`).then(res => setBuildings(res.data));
  }, []);

  /* ================= FLOORS ================= */
  useEffect(() => {
    if (!buildingId) return;
    axios
      .get(`${BASE_URL}/floors/society/${SOCIETY_ID}/building/${buildingId}/get`)
      .then(res => setFloors(res.data));

    setFloorId("");
    setFlats([]);
  }, [buildingId]);

  /* ================= FLATS ================= */
  useEffect(() => {
    if (!buildingId || !floorId) return;
    axios
      .get(`${BASE_URL}/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}`)
      .then(res => setFlats(res.data));
  }, [buildingId, floorId]);

  /* ================= FILTER ================= */
  const filteredFlats = useMemo(() => {
    return flats.filter(f => {
      const matchStatus = status ? f.flatStatus === status : true;
      const matchSearch = f.flatNumber
        ?.toString()
        .toLowerCase()
        .includes(search.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [flats, status, search]);

  /* ================= DELETE ================= */
  const deleteMember = async (userId) => {
  if (!window.confirm("Are you sure you want to delete this member?")) return;

  try {
    // Delete the user
    await axios.delete(`${BASE_URL}/users/society/${SOCIETY_ID}/user/${userId}`);

    // Update the flat status to VACANT
    await axios.put(
      `${BASE_URL}/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${viewFlat.id}`,
      { flatNumber: viewFlat.flatNumber, flatStatus: "VACANT" }
    );

    alert("✅ Member deleted and flat marked as VACANT");

    // Refresh flats and counts
    setFlats(prev => prev.map(f => f.id === viewFlat.id ? { ...f, flatStatus: "VACANT" } : f));
    loadCounts();

    // Close modal
    setViewFlat(null);
    setViewMember(null);

  } catch (err) {
    console.error(err);
    alert("❌ Failed to delete member");
  }
};


  /* ================= UPDATE ================= */
  const openEdit = flat => {
    setEditFlat(flat);
    setEditNumber(flat.flatNumber);
    setEditStatus(flat.flatStatus);
  };

  const updateFlat = async () => {
    await axios.put(
      `${BASE_URL}/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${editFlat.id}`,
      { flatNumber: editNumber, flatStatus: editStatus }
    );

    setFlats(prev =>
      prev.map(f =>
        f.id === editFlat.id ? { ...f, flatNumber: editNumber, flatStatus: editStatus } : f
      )
    );

    setEditFlat(null);
    loadCounts();
  };

  /* ================= ADD MEMBER ================= */
  const saveMember = async () => {
    try {
      const payload = {
        name: member.name,
        email: member.email,
        password: member.password,
        mobileNumber: member.mobileNumber,
        userRole: "NORMAL_USER",
        userStatus: "ACTIVE",
        normalUserType: member.normalUserType,
        societyId: SOCIETY_ID,
        buildingId: parseInt(buildingId),
        floorId: parseInt(floorId),
        flatId: parseInt(memberFlat.id),
      };

      const res = await axios.post(`${BASE_URL}/users`, payload);
      const createdUser = res.data;

      if (imageFile) {
        const formData = new FormData();
        formData.append("image", imageFile);
        await axios.post(
          `${BASE_URL}/users/society/${SOCIETY_ID}/image/upload/${createdUser.id}`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );
      }

      const newStatus =
        member.normalUserType === "OWNER" ? "OWNER_OCCUPIED" : "TENANT_OCCUPIED";

      await axios.put(
        `${BASE_URL}/flats/society/${SOCIETY_ID}/building/${buildingId}/floor/${floorId}/flat/${memberFlat.id}`,
        { flatNumber: memberFlat.flatNumber, flatStatus: newStatus }
      );

      alert("✅ Member added successfully");
      setMemberFlat(null);
      setMember({ name: "", email: "", password: "", mobileNumber: "", normalUserType: "" });
      setImageFile(null);
      loadCounts();
    } catch (err) {
      console.error(err.response?.data || err);
      alert(err.response?.data?.message || "❌ Failed to add member");
    }
  };

  /* ================= VIEW MEMBER ================= */
  const openViewMember = async flat => {
    try {
      setViewFlat(flat);
      setLoadingMember(true);
      const res = await axios.get(`${BASE_URL}/users/flat/${flat.id}`);
      setViewMember(res.data);
    } catch (err) {
      console.error(err);
      alert("Member not found for this flat");
      setViewFlat(null);
    } finally {
      setLoadingMember(false);
    }
  };

  return (
    <div className="p-6">
      {/* ================= STATUS CARDS ================= */}
      <StatusCards counts={statusCounts} />

      {/* ================= FILTERS ================= */}
      <div className="grid md:grid-cols-4 gap-4 mb-6">
        <select className="border p-2 rounded" value={buildingId} onChange={e => setBuildingId(e.target.value)}>
          <option value="">Select Building</option>
          {buildings.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select className="border p-2 rounded" value={floorId} onChange={e => setFloorId(e.target.value)} disabled={!buildingId}>
          <option value="">Select Floor</option>
          {floors.map(f => <option key={f.id} value={f.id}>{f.floorNumber}</option>)}
        </select>
        <select className="border p-2 rounded" value={status} onChange={e => setStatus(e.target.value)}>
          <option value="">All Status</option>
          {Object.keys(statusMap).map(s => <option key={s}>{s}</option>)}
        </select>
        <input className="border p-2 rounded" placeholder="Search Flat" value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* ================= FLATS TABLE ================= */}
      <table className="min-w-full border bg-white shadow rounded mb-10">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2">Flat</th>
            <th className="border px-4 py-2">Status</th>
            <th className="border px-4 py-2 text-center">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredFlats.map(f => (
            <tr key={f.id}>
              <td className="border px-4 py-2">{f.flatNumber}</td>
              <td className={`border px-4 py-2 ${statusMap[f.flatStatus]?.color}`}>
                {statusMap[f.flatStatus]?.label}

                {ALLOW_ADD_MEMBER.includes(f.flatStatus) && (
                  <button onClick={() => setMemberFlat(f)} className="ml-4 bg-black text-white px-2 py-1 rounded text-sm">+ Add Member</button>
                )}
                {["OWNER_OCCUPIED", "TENANT_OCCUPIED"].includes(f.flatStatus) && (
                  <button onClick={() => openViewMember(f)} className="ml-2 text-blue-600 cursor-pointer" title="View Member"><Eye size={18} /></button>
                )}
              </td>
              <td className="border px-4 py-2 text-center space-x-3">
                <button onClick={() => openEdit(f)} className="text-blue-600 cursor-pointer">Update</button>
                <button onClick={() => deleteFlat(f.id)} className="text-red-600 cursor-pointer">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================= STAFF MANAGEMENT ================= */}
      <div className="mt-10">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold">Staff Management</h1>
          <button onClick={() => setStaffModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">
            + Add Staff
          </button>
        </div>

        <table className="min-w-full border bg-white shadow rounded">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Image</th>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
              <th className="border px-4 py-2">Mobile</th>
              <th className="border px-4 py-2">Type</th>
              <th className="border px-4 py-2">Level</th>
              <th className="border px-4 py-2">Duty</th>
              <th className="border px-4 py-2">Salary</th>
            </tr>
          </thead>
          <tbody>
            {staffList.map(s => (
              <tr key={s.id}>
                <td className="border px-4 py-2 text-center">
                  {s.imageURL ? (
                    <img src={`${BASE_URL}/users/image/get/user/${s.id}`} alt={s.name} className="w-12 h-12 rounded-full object-cover mx-auto" />
                  ) : "N/A"}
                </td>
                <td className="border px-4 py-2">{s.name}</td>
                <td className="border px-4 py-2">{s.email}</td>
                <td className="border px-4 py-2">{s.mobileNumber}</td>
                <td className="border px-4 py-2">{s.staffType}</td>
                <td className="border px-4 py-2">{s.staffLevel}</td>
                <td className="border px-4 py-2">{s.dutyTiming}</td>
                <td className="border px-4 py-2">{s.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================= ADD STAFF MODAL ================= */}
      {staffModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Add Staff</h3>

            <input className="border p-2 rounded w-full mb-2" placeholder="Name" value={staff.name} onChange={e => setStaff({ ...staff, name: e.target.value })} />
            <input className="border p-2 rounded w-full mb-2" placeholder="Email" value={staff.email} onChange={e => setStaff({ ...staff, email: e.target.value })} />
            <input className="border p-2 rounded w-full mb-2" placeholder="Mobile" value={staff.mobileNumber} onChange={e => setStaff({ ...staff, mobileNumber: e.target.value })} />
            <input type="password" className="border p-2 rounded w-full mb-2" placeholder="Password" value={staff.password} onChange={e => setStaff({ ...staff, password: e.target.value })} />
            <select className="border p-2 rounded w-full mb-2" value={staff.staffType} onChange={e => setStaff({ ...staff, staffType: e.target.value })}>
              <option value="">Select Staff Type</option>
              {staffTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </select>
            <select className="border p-2 rounded w-full mb-2" value={staff.staffLevel} onChange={e => setStaff({ ...staff, staffLevel: e.target.value })}>
              <option value="">Select Staff Level</option>
              {staffLevels.map(level => <option key={level} value={level}>{level}</option>)}
            </select>
            <input className="border p-2 rounded w-full mb-2" placeholder="Duty Timing" value={staff.dutyTiming} onChange={e => setStaff({ ...staff, dutyTiming: e.target.value })} />
            <input className="border p-2 rounded w-full mb-2" placeholder="Salary" value={staff.salary} onChange={e => setStaff({ ...staff, salary: e.target.value })} />
            <input type="file" className="mb-4" onChange={e => setImageFile(e.target.files[0])} />

            <div className="flex justify-end gap-3">
              <button onClick={() => setStaffModal(false)}>Cancel</button>
              <button onClick={saveStaff} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= ADD MEMBER MODAL ================= */}
      {memberFlat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Add Member (Flat {memberFlat.flatNumber})</h3>
            <input className="border p-2 rounded w-full mb-2" placeholder="Name" value={member.name} onChange={e => setMember({ ...member, name: e.target.value })} />
            <input className="border p-2 rounded w-full mb-2" placeholder="Email" value={member.email} onChange={e => setMember({ ...member, email: e.target.value })} />
            <input className="border p-2 rounded w-full mb-2" placeholder="Mobile" value={member.mobileNumber} onChange={e => setMember({ ...member, mobileNumber: e.target.value })} />
            <input type="password" className="border p-2 rounded w-full mb-2" placeholder="Password" value={member.password} onChange={e => setMember({ ...member, password: e.target.value })} />
            <select className="border p-2 rounded w-full mb-2" value={member.normalUserType} onChange={e => setMember({ ...member, normalUserType: e.target.value })}>
              <option value="">Select User Type</option>
              <option value="OWNER">OWNER</option>
              <option value="TENANT">TENANT</option>
            </select>
            <input type="file" className="mb-4" onChange={e => setImageFile(e.target.files[0])} />

            <div className="flex justify-end gap-3">
              <button onClick={() => setMemberFlat(null)}>Cancel</button>
              <button onClick={saveMember} className="bg-green-600 text-white px-4 py-2 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ================= VIEW MEMBER MODAL ================= */}
      {viewFlat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96 relative">
            <h3 className="text-lg font-semibold mb-4">Member Details (Flat {viewFlat.flatNumber})</h3>
            {loadingMember ? <p>Loading...</p> : viewMember ? (
              <>
                {viewMember.imageURL && <img src={`${BASE_URL}/users/image/get/user/${viewMember.id}`} alt="Member" className="w-24 h-24 rounded-full mx-auto mb-4 object-cover" />}
                <div className="space-y-2 text-sm">
                  <p><b>Name:</b> {viewMember.name}</p>
                  <p><b>Email:</b> {viewMember.email}</p>
                  <p><b>Mobile:</b> {viewMember.mobileNumber}</p>
                  <p><b>User Type:</b> {viewMember.normalUserType}</p>
                  <p><b>Status:</b> {viewMember.userStatus}</p>
                </div>
              </>
            ) : <p>No member found</p>}
            <div className="flex justify-end mt-5">
              <button onClick={() => { setViewFlat(null); setViewMember(null); }} className="px-4 py-2 bg-gray-300 rounded cursor-pointer">Close</button>
              <button
                onClick={() => deleteMember(viewMember.id)}
                className="bg-red-600 text-white px-4 py-2 rounded ml-2">
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= UPDATE MODAL ================= */}
      {editFlat && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-96">
            <h3 className="text-lg font-semibold mb-4">Update Flat</h3>
            <input className="border p-2 rounded w-full mb-3" value={editNumber} onChange={e => setEditNumber(e.target.value)} />
            <select className="border p-2 rounded w-full mb-4" value={editStatus} onChange={e => setEditStatus(e.target.value)}>
              {Object.keys(statusMap).map(s => <option key={s} value={s}>{statusMap[s].label}</option>)}
            </select>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditFlat(null)} className="cursor-pointer">Cancel</button>
              <button onClick={updateFlat} className="bg-blue-600 text-white px-4 py-2 rounded cursor-pointer">Update</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


