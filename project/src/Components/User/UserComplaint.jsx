import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import moment from "moment";

function UserComplaint() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("MY"); // MY | CREATE
  const [submitting, setSubmitting] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [complainType, setComplainType] = useState("MAINTENANCE");

  const [editingId, setEditingId] = useState(null);

  const priorityOptions = ["LOW", "MEDIUM", "HIGH", "URGENT"];
  const typeOptions = ["MAINTENANCE", "SECURITY", "CLEANING", "OTHER"];

  const priorityStyle = {
    LOW: "bg-green-100 text-green-700",
    MEDIUM: "bg-yellow-100 text-yellow-700",
    HIGH: "bg-orange-100 text-orange-700",
    URGENT: "bg-red-100 text-red-700",
  };

  const statusStyle = {
    PENDING: "bg-yellow-100 text-yellow-700",
    RESOLVED: "bg-green-100 text-green-700",
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
    } catch (err) {
      console.error("Fetch complaints error:", err);
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

    if (!title.trim() || !description.trim()) {
      alert("Title and description required");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title,
        description,
        priority,
        complainType,
      };

      if (editingId) {
        await api.put(`/complaints/${editingId}`, payload);
      } else {
        await api.post("/complaints", payload);
      }

      resetForm();
      fetchComplaints();
      setActiveTab("MY");
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  // ================= DELETE =================
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this complaint?")) return;
    try {
      await api.delete(`/complaints/${id}`);
      
      setComplaints((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("You can delete only your own complaint");
    }
  };

  // ================= EDIT =================
  const handleEdit = (c) => {
    if (c.status === "RESOLVED") return;

    setTitle(c.title);
    setDescription(c.description);
    setPriority(c.priority);
    setComplainType(c.complainType);
    setEditingId(c.id);
    setActiveTab("CREATE");
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("MEDIUM");
    setComplainType("MAINTENANCE");
    setEditingId(null);
  };

  // ================= CARD =================
  const renderComplaintCard = (c) => (
    <div key={c.id} className="border rounded-lg p-4 bg-white shadow-sm">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold">{c.title}</h3>

        {/* ACTIONS */}
        {c.status !== "RESOLVED" && (
          <div className="flex gap-2">
            <button
              onClick={() => handleEdit(c)}
              className="text-sm text-blue-600 hover:underline"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(c.id)}
              className="text-sm text-red-600 hover:underline"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <p className="text-gray-600 mt-2">{c.description}</p>

      <div className="flex flex-wrap gap-2 mt-3 items-center">
        <span className={`px-3 py-1 rounded-full text-xs ${priorityStyle[c.priority]}`}>
          {c.priority}
        </span>

        <span className={`px-3 py-1 rounded-full text-xs ${typeStyle[c.complainType]}`}>
          {c.complainType}
        </span>

        <span className={`px-3 py-1 rounded-full text-xs ${statusStyle[c.status]}`}>
          {c.status}
        </span>

        <span className="text-xs text-gray-500 ml-auto">
          {moment(c.createdAt).format("DD MMM YYYY, hh:mm A")}
        </span>
      </div>
    </div>
  );

  if (loading) {
    return <div className="mt-12 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="mt-8 px-4 md:px-6 max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">My Complaints</h2>

      {/* TABS */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            activeTab === "MY" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => setActiveTab("MY")}
        >
          My Complaints
        </button>

        <button
          className={`px-4 py-2 rounded ${
            activeTab === "CREATE" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            resetForm();
            setActiveTab("CREATE");
          }}
        >
          {editingId ? "Edit Complaint" : "Create Complaint"}
        </button>
      </div>

      {/* LIST */}
      {activeTab === "MY" &&
        (complaints.length === 0 ? (
          <p className="text-gray-500">No complaints found</p>
        ) : (
          <div className="space-y-4">
            {complaints.map(renderComplaintCard)}
          </div>
        ))}

      {/* FORM */}
      {activeTab === "CREATE" && (
        <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-4">
          <input
            className="w-full border p-2 rounded mb-3"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full border p-2 rounded mb-3"
            rows="3"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          <div className="flex gap-3 mb-3">
            <select
              className="border p-2 rounded w-1/2"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
            >
              {priorityOptions.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>

            <select
              className="border p-2 rounded w-1/2"
              value={complainType}
              onChange={(e) => setComplainType(e.target.value)}
            >
              {typeOptions.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>

          <button className="bg-blue-600 text-white px-4 py-2 rounded">
            {submitting ? "Submitting..." : editingId ? "Update" : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}

export default UserComplaint;