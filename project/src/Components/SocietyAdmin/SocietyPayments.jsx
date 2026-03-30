import React, { useEffect, useState } from "react";
import axios from "axios";

const BASE_URL = "http://localhost:9090";
const SOCIETY_ID = Number(localStorage.getItem("societyId"));

export default function SocietyAdminPayments() {
  const [activeTab, setActiveTab] = useState("PENDING");
  const [loading, setLoading] = useState(true);

  const [pendingBills, setPendingBills] = useState([]);
  const [completedBills, setCompletedBills] = useState([]);
  const [superAdminBills, setSuperAdminBills] = useState([]);

  const [users, setUsers] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  const [selectedBill, setSelectedBill] = useState(null);

  const [form, setForm] = useState({
    userId: "",
    flatId: "",
    billMonth: "",
    dueDate: "",
  });

  /* ================= BILL ITEMS ================= */
  const [items, setItems] = useState([{ title: "", description: "", amount: "" }]);

  const [summary, setSummary] = useState({
    totalDue: 0,
    paidThisMonth: 0,
    pending: 0,
  });

  /* ================= PAYMENT ================= */
  const [paymentModes, setPaymentModes] = useState([]);
  const [upiOptions, setUpiOptions] = useState([]);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBills();
  }, []);

  /* ================= USERS ================= */
  const fetchUsers = async () => {
    const res = await axios.get(
      `${BASE_URL}/api/users/society/${SOCIETY_ID}/role/NORMAL_USER`
    );
    setUsers(res.data || []);
  };

  /* ================= BILLS ================= */
  const fetchBills = async () => {
    setLoading(true);

    const adminRes = await axios.get(
      `${BASE_URL}/api/monthly-bills/society-admin/society/${SOCIETY_ID}`
    );

    const superRes = await axios.get(
      `${BASE_URL}/api/monthly-bills/super-admin/society/${SOCIETY_ID}`
    );

    const adminBills = adminRes.data || [];

    const pending = adminBills.filter(b => b.status === "PENDING");
    const completed = adminBills.filter(b => b.status === "COMPLETED");

    setPendingBills(pending);
    setCompletedBills(completed);
    setSuperAdminBills(superRes.data || []);

    const pendingAmount = pending.reduce(
      (s, b) => s + Number(b.totalAmount || 0),
      0
    );

    const completedAmount = completed.reduce(
      (s, b) => s + Number(b.totalAmount || 0),
      0
    );

    setSummary({
      totalDue: pendingAmount,
      paidThisMonth: completedAmount,
      pending: pendingAmount,
    });

    setLoading(false);
  };

  /* ================= BILL ITEMS ================= */
  const addItem = () => {
    setItems([...items, { title: "", description: "", amount: "" }]);
  };

  const updateItem = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const validItems = items.filter(
    i => i.title?.trim() && Number(i.amount) > 0
  );

  const totalAmount = validItems.reduce(
    (s, i) => s + Number(i.amount),
    0
  );

  /* ================= CREATE BILL ================= */
  const createBill = async () => {
    try {
      if (!form.flatId) {
        alert("Selected user ke saath flat mapped nahi hai");
        return;
      }

      const payload = {
        userId: Number(form.userId),
        flatId: Number(form.flatId),
        societyId: SOCIETY_ID,
        billMonth: `${form.billMonth}-01`,
        dueDate: form.dueDate,
        totalAmount: Number(totalAmount),
      };

      const billRes = await axios.post(
        `${BASE_URL}/api/monthly-bills/society-admin/monthly-bill`,
        payload
      );

      const billId = billRes.data.id;

      for (let item of validItems) {
        await axios.post(
          `${BASE_URL}/api/bill-items/society/${SOCIETY_ID}`,
          {
            monthlyBillId: billId,
            title: item.title,
            description: item.description,
            amount: Number(item.amount),
          }
        );
      }

      setShowCreate(false);
      setItems([{ title: "", description: "", amount: "" }]);
      setForm({ userId: "", flatId: "", billMonth: "", dueDate: "" });

      fetchBills();
      alert("Bill created successfully");
    } catch (err) {
      console.error("CREATE BILL ERROR", err);
      alert("Bill create failed");
    }
  };

  /* ================= PAYMENT FLOW ================= */
  const openPayment = async (bill) => {
    setSelectedBill(bill);
    const res = await axios.get(`${BASE_URL}/api/companies/type/PAYMENT`);

    const withLogo = await Promise.all(
      (res.data || []).map(async (c) => {
        try {
          const img = await axios.get(
            `${BASE_URL}/api/companies/image/get/company/${c.id}`,
            { responseType: "blob" }
          );
          return { ...c, logo: URL.createObjectURL(img.data) };
        } catch {
          return c;
        }
      })
    );

    setPaymentModes(withLogo);
    setUpiOptions([]);
    setShowPayment(true);
  };

  const selectPaymentMode = async (mode) => {
    if (mode.name?.toUpperCase().includes("UPI")) {
      const res = await axios.get(`${BASE_URL}/api/companies/type/SUB_PAYMENT`);

      const withLogo = await Promise.all(
        (res.data || []).map(async (c) => {
          try {
            const img = await axios.get(
              `${BASE_URL}/api/companies/image/get/company/${c.id}`,
              { responseType: "blob" }
            );
            return { ...c, logo: URL.createObjectURL(img.data) };
          } catch {
            return c;
          }
        })
      );

      setUpiOptions(withLogo);
    }
  };

  if (loading) return <p className="text-center mt-6">Loading...</p>;

  return (
    <div className="p-4 space-y-4">

      {/* SUMMARY */}
      <div className="grid grid-cols-3 gap-3">
        <SummaryCard title="Total Due" amount={summary.totalDue} />
        <SummaryCard title="Paid" amount={summary.paidThisMonth} />
        <SummaryCard title="Pending" amount={summary.pending} />
      </div>

      {/* CREATE BILL BUTTON */}
      <button
        onClick={() => setShowCreate(true)}
        className="bg-indigo-600 text-white px-4 py-2 rounded"
      >
        + Create Bill
      </button>

      {/* CREATE BILL UI */}
      {showCreate && (
        <div className="bg-white p-4 rounded shadow space-y-3">
          <select
            className="border p-2 w-full"
            value={form.userId}
            onChange={(e) => {
              const u = users.find(x => x.id === Number(e.target.value));
              if (!u?.flatId) {
                alert("Selected user ke saath flat mapped nahi hai");
                return;
              }
              setForm({ ...form, userId: u.id, flatId: u.flatId });
            }}
          >
            <option value="">Select User</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.name} (Flat {u.flatId})
              </option>
            ))}
          </select>

          <input
            type="month"
            className="border p-2 w-full"
            value={form.billMonth}
            onChange={e => setForm({ ...form, billMonth: e.target.value })}
          />

          <input
            type="date"
            className="border p-2 w-full"
            value={form.dueDate}
            onChange={e => setForm({ ...form, dueDate: e.target.value })}
          />

          {items.map((it, i) => (
            <div key={i} className="grid grid-cols-3 gap-2">
              <input
                className="border p-2"
                placeholder="Title"
                value={it.title}
                onChange={e => updateItem(i, "title", e.target.value)}
              />
              <input
                className="border p-2"
                placeholder="Description"
                value={it.description}
                onChange={e => updateItem(i, "description", e.target.value)}
              />
              <input
                type="number"
                className="border p-2"
                placeholder="Amount"
                value={it.amount}
                onChange={e => updateItem(i, "amount", e.target.value)}
              />
            </div>
          ))}

          <button onClick={addItem} className="text-indigo-600 text-sm">
            + Add Item
          </button>

          <p className="font-semibold">Total: ₹ {totalAmount}</p>

          <button
            onClick={createBill}
            disabled={totalAmount <= 0}
            className="bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
          >
            Generate Bill
          </button>
        </div>
      )}

      {/* TABS */}
      <div className="flex gap-6 border-b">
        {["PENDING", "COMPLETED", "SUPER_ADMIN"].map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`pb-2 ${activeTab === t ? "border-b-2 border-indigo-600" : ""}`}
          >
            {t}
          </button>
        ))}
      </div>

      {activeTab === "PENDING" && <BillList bills={pendingBills} />}
      {activeTab === "COMPLETED" && <BillList bills={completedBills} />}
      {activeTab === "SUPER_ADMIN" && (
        <BillList bills={superAdminBills} payNow={openPayment} />
      )}

      {/* PAYMENT MODAL */}
      {showPayment && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center">
          <div className="bg-white p-4 rounded w-80 space-y-3">
            <h3 className="font-semibold">Pay ₹{selectedBill?.totalAmount}</h3>

            {paymentModes.map(m => (
              <button
                key={m.id}
                onClick={() => selectPaymentMode(m)}
                className="flex items-center gap-2 border p-2 w-full rounded"
              >
                {m.logo && <img src={m.logo} className="h-6" />}
                {m.name}
              </button>
            ))}

            {upiOptions.length > 0 && (
              <>
                <p className="text-sm font-semibold mt-2">UPI Options</p>
                {upiOptions.map(u => (
                  <div key={u.id} className="flex items-center gap-2 border p-2 rounded">
                    {u.logo && <img src={u.logo} className="h-6" />}
                    {u.name}
                  </div>
                ))}
              </>
            )}

            <button
              onClick={() => setShowPayment(false)}
              className="w-full bg-gray-500 text-white py-1 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ title, amount }) {
  return (
    <div className="bg-white p-3 rounded shadow">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold">₹ {amount}</p>
    </div>
  );
}

function BillList({ bills, payNow }) {
  if (!bills.length) return <p>No bills</p>;

  return (
    <div className="space-y-3">
      {bills.map(b => {
        const paid =
          b.status === "COMPLETED"
            ? Number(b.totalAmount || 0)
            : Number(b.paidAmount || 0);

        const due =
          b.status === "COMPLETED"
            ? 0
            : Number(b.dueAmount || 0);

        return (
          <div
            key={b.id}
            className="bg-white rounded-xl shadow-md p-4 space-y-2 border border-gray-100"
          >
            <div className="flex justify-between items-center">
              <p className="text-lg font-bold">₹ {b.totalAmount}</p>
              <span
                className={`px-3 py-1 text-xs rounded-full font-semibold ${
                  b.status === "COMPLETED"
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {b.status}
              </span>
            </div>

            <p className="text-sm font-medium">
              {b.userName} • Flat {b.flatId ?? "-"}
            </p>

            <div className="flex justify-between text-sm">
              <span className="text-green-600 font-semibold">Paid ₹{paid}</span>
              <span className="text-red-600 font-semibold">Due ₹{due}</span>
            </div>

            {payNow && b.status === "PENDING" && (
              <button
                onClick={() => payNow(b)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-2 rounded-lg text-sm font-semibold"
              >
                Pay Now
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}