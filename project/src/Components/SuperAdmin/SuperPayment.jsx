import React, { useEffect, useState } from "react";
import axios from "axios";
import { Plus, Send } from "lucide-react";

const BASE_URL = "http://localhost:9090";

export default function SuperPayment() {
  const [activeTab, setActiveTab] = useState("PENDING");

  const [societies, setSocieties] = useState([]);
  const [selectedSocietyId, setSelectedSocietyId] = useState("");
  const [, setSelectedSocietyAdminId] = useState("");

  const [pendingBills, setPendingBills] = useState([]);
  const [completedBills, setCompletedBills] = useState([]);
  const [loadingBills, setLoadingBills] = useState(false);

  const [summary, setSummary] = useState({
    totalAmount: 0,
    paidThisMonth: 0,
    pendingAmount: 0,
  });

  // ✅ Bill state simplified (NO societyId here)
  const [bill, setBill] = useState({
    billMonth: "",
    dueDate: "",
  });

  const [items, setItems] = useState([
    { title: "", description: "", amount: "" },
  ]);

  /* ================= FETCH SOCIETIES ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/societies`)
      .then((res) => setSocieties(res.data || []))
      .catch(() => console.error("Society fetch error"));
  }, []);

  /* ================= SUMMARY ================= */
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/monthly-bills/super-admin`)
      .then((res) => {
        const bills = res.data || [];

        const total = bills.reduce(
          (sum, b) => sum + Number(b.totalAmount || 0),
          0
        );

        const paid = bills
          .filter((b) => b.status === "COMPLETED")
          .reduce((sum, b) => sum + Number(b.totalAmount || 0), 0);

        setSummary({
          totalAmount: total,
          paidThisMonth: paid,
          pendingAmount: total - paid,
        });
      })
      .catch(() => console.error("Summary fetch error"));
  }, []);

  /* ================= FETCH SOCIETY BILLS + SUMMARY ================= */
useEffect(() => {
  if (!selectedSocietyId) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPendingBills([]);
    setCompletedBills([]);
    setSummary({
      totalAmount: 0,
      paidThisMonth: 0,
      pendingAmount: 0,
    });
    return;
  }

  setLoadingBills(true);

  axios
    .get(
      `${BASE_URL}/api/monthly-bills/super-admin/society/${selectedSocietyId}`
    )
    .then((res) => {
      const bills = res.data || [];

      const pending = bills.filter((b) => b.status === "PENDING");
      const completed = bills.filter((b) => b.status === "COMPLETED");

      setPendingBills(pending);
      setCompletedBills(completed);

      const pendingAmount = pending.reduce(
        (sum, b) => sum + Number(b.totalAmount || 0),
        0
      );

      const paidAmount = completed.reduce(
        (sum, b) => sum + Number(b.totalAmount || 0),
        0
      );

      const totalAmount = pendingAmount + paidAmount; // ✅ FIX

      setSummary({
        totalAmount,          // ✅ PENDING + COMPLETED
        pendingAmount,        // ✅ only pending
        paidThisMonth: paidAmount, // ✅ only completed
      });
    })
    .finally(() => setLoadingBills(false));
}, [selectedSocietyId]);

  /* ================= HANDLERS ================= */

  const handleSocietySelect = (e) => {
  const id = e.target.value;
  const society = societies.find((s) => String(s.id) === id);

  console.log("Selected society:", society);

  setSelectedSocietyId(id);
  setSelectedSocietyAdminId(society?.societyAdmin?.id || "");

  setBill({
    billMonth: "",
    societyId: id,
    societyAdminId: society?.societyAdmin?.id || "",
    dueDate: "",
  });
};

  const handleBillChange = (e) =>
    setBill({ ...bill, [e.target.name]: e.target.value });

  const handleItemChange = (i, field, value) => {
    const copy = [...items];
    copy[i][field] = value;
    setItems(copy);
  };

  const addItem = () =>
    setItems([...items, { title: "", description: "", amount: "" }]);

  /* ================= GENERATE BILL ================= */
  const generateBill = async () => {
  try {
    if (!bill.societyId) {
      alert("Please select society");
      return;
    }

    if (!bill.societyAdminId) {
      alert("Society Admin not found");
      return;
    }

    const totalAmount = items.reduce(
      (sum, i) => sum + Number(i.amount || 0),
      0
    );

    const payload = {
      societyId: Number(bill.societyId),
      userId: Number(bill.societyAdminId), // ✅ NOW VALID
      billMonth: bill.billMonth + "-01",
      totalAmount,
      dueDate: bill.dueDate + "T23:59:59",
    };

    console.log("Creating bill payload:", payload);

    const billRes = await axios.post(
      `${BASE_URL}/api/monthly-bills/super-admin/monthly-bill`,
      payload
    );

    for (let item of items) {
      await axios.post(`${BASE_URL}/api/bill-items/society/${selectedSocietyId}`, {
        monthlyBillId: billRes.data.id,
        title: item.title,
        description: item.description,
        amount: Number(item.amount),
      });
    }

    alert("✅ Bill generated successfully");
    setActiveTab("PENDING");
    setItems([{ title: "", description: "", amount: "" }]);

  } catch (err) {
    console.error("Bill create failed", err.response?.data || err.message);
    alert("❌ Bill create failed");
  }
};

  return (
    <div className="p-4 space-y-6 mt-4">
      <h2 className="text-lg font-semibold">Payment Overview</h2>

      <div className="grid md:grid-cols-3 gap-4">
        <SummaryCard title="Total Amount" amount={summary.totalAmount} />
        <SummaryCard title="Paid This Month" amount={summary.paidThisMonth} />
        <SummaryCard title="Pending Amount" amount={summary.pendingAmount} />
      </div>

      <div className="flex gap-6 border-b">
        {["PENDING", "COMPLETED", "GENERATE"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 ${
              activeTab === tab
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <select
        value={selectedSocietyId}
        onChange={handleSocietySelect}
        className="border p-2 rounded w-full md:w-64"
      >
        <option value="">Select Society</option>
        {societies.map((s) => (
          <option key={s.id} value={s.id}>
            {s.name}
          </option>
        ))}
      </select>

      {activeTab === "PENDING" && (
        <BillList bills={pendingBills} loading={loadingBills} />
      )}

      {activeTab === "COMPLETED" && (
        <BillList bills={completedBills} loading={loadingBills} />
      )}

      {activeTab === "GENERATE" && (
        <GenerateBillUI
          bill={bill}
          items={items}
          handleBillChange={handleBillChange}
          handleItemChange={handleItemChange}
          addItem={addItem}
          generateBill={generateBill}
          disabled={!selectedSocietyId}
        />
      )}
    </div>
  );
}

/* ================= COMPONENTS ================= */

function SummaryCard({ title, amount }) {
  return (
    <div className="bg-white border rounded p-4">
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-xl font-semibold">₹ {amount}</p>
    </div>
  );
}

function BillList({ bills, loading }) {
  if (loading) return <p>Loading...</p>;
  if (!bills.length) return <p>No bills found</p>;

  return bills.map((b) => (
    <div key={b.id} className="border p-3 rounded bg-white">
      {b.billMonth} • ₹{b.totalAmount} • {b.status}
    </div>
  ));
}

function GenerateBillUI({
  bill,
  items,
  handleBillChange,
  handleItemChange,
  addItem,
  generateBill,
  disabled,
}) {
  return (
    <div className="bg-white border rounded p-4 space-y-4">
      <input
        type="month"
        name="billMonth"
        value={bill.billMonth}
        onChange={handleBillChange}
        className="border p-2 rounded w-full"
      />

      <input
        type="date"
        name="dueDate"
        value={bill.dueDate}
        onChange={handleBillChange}
        className="border p-2 rounded w-full"
      />

      {items.map((item, i) => (
        <div key={i} className="grid md:grid-cols-3 gap-2">
          <input
            placeholder="Title"
            value={item.title}
            onChange={(e) =>
              handleItemChange(i, "title", e.target.value)
            }
            className="border p-2"
          />
          <input
            placeholder="Description"
            value={item.description}
            onChange={(e) =>
              handleItemChange(i, "description", e.target.value)
            }
            className="border p-2"
          />
          <input
            type="number"
            placeholder="Amount"
            value={item.amount}
            onChange={(e) =>
              handleItemChange(i, "amount", e.target.value)
            }
            className="border p-2"
          />
        </div>
      ))}

      <button
        onClick={addItem}
        className="text-indigo-600 text-sm flex items-center gap-1"
      >
        <Plus size={14} /> Add Item
      </button>

      <button
        onClick={generateBill}
        disabled={disabled}
        className={`px-6 py-2 rounded flex items-center gap-2 ${
          disabled
            ? "bg-gray-300 cursor-not-allowed"
            : "bg-indigo-600 text-white"
        }`}
      >
        <Send size={16} /> Generate Bill
      </button>
    </div>
  );
}