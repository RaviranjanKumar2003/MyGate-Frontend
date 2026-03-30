import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import moment from "moment";

function SocietyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [complainType, setComplainType] = useState("MAINTENANCE");

  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [activeTab, setActiveTab] = useState("MY");

  const priorityStyle = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const typeStyle = {
    MAINTENANCE: "bg-blue-100 text-blue-700",
    SECURITY: "bg-red-100 text-red-700",
    CLEANING: "bg-green-100 text-green-700",
    OTHER: "bg-gray-100 text-gray-700",
  };

  // ================= FETCH =================
  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get("/complaints");
      setComplaints(res.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // ================= CREATE / UPDATE =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const payload = { title, description, priority, complainType };

      editingId
        ? await api.put(`/complaints/${editingId}`, payload)
        : await api.post("/complaints", payload);

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setComplainType("MAINTENANCE");
      setEditingId(null);
      setActiveTab("MY");
      fetchComplaints();
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    await api.delete(`/complaints/${id}`);
    setComplaints((p) => p.filter((c) => c.id !== id));
  };

  // ================= RESOLVE =================
  const markAsResolved = async (id) => {
    try {
      setUpdatingId(id);
      await api.put(`/complaints/${id}/status`, null, {
        params: { status: "RESOLVED" },
      });
      fetchComplaints();
    } finally {
      setUpdatingId(null);
    }
  };

  const canEdit = (createdAt) =>
    moment().diff(moment(createdAt), "minutes") < 2;

  const startEdit = (c) => {
    setEditingId(c.id);
    setTitle(c.title);
    setDescription(c.description);
    setPriority(c.priority);
    setComplainType(c.complainType);
    setActiveTab("CREATE");
  };

  const myComplaints = complaints.filter(
    (c) => c.createdByRole === "SOCIETY_ADMIN"
  );
  const residentComplaints = complaints.filter(
    (c) => c.createdByRole === "NORMAL_USER"
  );

  // ================= CARD =================
  const ComplaintCard = ({ c, isResident }) => (
    <div className="bg-white rounded-xl border shadow-sm p-5">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{c.title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {moment(c.createdAt).format("DD MMM YYYY • hh:mm A")}
          </p>
        </div>

        <div className="flex gap-2">
          {isResident && c.status !== "RESOLVED" && (
            <button
              onClick={() => markAsResolved(c.id)}
              disabled={updatingId === c.id}
              className="px-3 py-1 text-xs rounded bg-green-600 text-white"
            >
              Resolve
            </button>
          )}

          {!isResident && canEdit(c.createdAt) && (
            <button
              onClick={() => startEdit(c)}
              className="text-xs text-blue-600 hover:underline"
            >
              Edit
            </button>
          )}

          {!isResident && (
            <button
              onClick={() => handleDelete(c.id)}
              className="text-xs text-red-600 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-gray-700">{c.description}</p>

      <div className="flex gap-2 mt-4">
        <span className={`px-3 py-1 text-xs rounded-full ${priorityStyle[c.priority]}`}>
          {c.priority}
        </span>
        <span className={`px-3 py-1 text-xs rounded-full ${typeStyle[c.complainType]}`}>
          {c.complainType}
        </span>
        <span className="px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
          {c.status}
        </span>
      </div>
    </div>
  );

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Society Complaints</h2>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        {["MY", "RESIDENT", "CREATE"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-sm font-medium ${
              activeTab === tab
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            {tab === "MY"
              ? "My Complaints"
              : tab === "RESIDENT"
              ? "Resident Complaints"
              : editingId
              ? "Edit Complaint"
              : "Create Complaint"}
          </button>
        ))}
      </div>

      {/* CREATE / EDIT */}
      {activeTab === "CREATE" && (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-xl shadow p-6 space-y-4"
        >
          <input
            className="w-full border rounded p-2"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />

          <textarea
            className="w-full border rounded p-2"
            rows="4"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="flex gap-3">
            <select
              className="border rounded p-2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {Object.keys(priorityStyle).map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              className="border rounded p-2"
              value={complainType}
              onChange={(e) => setComplainType(e.target.value)}
            >
              {Object.keys(typeStyle).map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <button
            disabled={submitting}
            className="bg-blue-600 text-white px-6 py-2 rounded"
          >
            {editingId ? "Update Complaint" : "Submit Complaint"}
          </button>
        </form>
      )}

      {/* LIST */}
      {activeTab === "MY" && (
        <div className="grid gap-4">
          {myComplaints.map((c) => (
            <ComplaintCard key={c.id} c={c} />
          ))}
        </div>
      )}

      {activeTab === "RESIDENT" && (
        <div className="grid gap-4">
          {residentComplaints.map((c) => (
            <ComplaintCard key={c.id} c={c} isResident />
          ))}
        </div>
      )}
    </div>
  );
}

export default SocietyComplaints;