import React, { useEffect, useState } from "react";
import axios from "axios";

const USER_ID = localStorage.getItem("userId");
const BASE_URL = "http://localhost:9090";

export default function Payments() {
  const [summary, setSummary] = useState({
    totalDue: 0,
    paidThisMonth: 0,
    pending: 0,
  });

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  // modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSubPaymentModal, setShowSubPaymentModal] = useState(false);

  // data
  const [paymentCompanies, setPaymentCompanies] = useState([]);
  const [subPaymentCompanies, setSubPaymentCompanies] = useState([]);

  // selections
  const [selectedBill, setSelectedBill] = useState(null);
  const [, setSelectedPayment] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [selectedUpiApp, setSelectedUpiApp] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  /* ================= FETCH BILLS ================= */

  const fetchPayments = async () => {
    try {
      const res = await axios.get(
        `${BASE_URL}/api/monthly-bills/user/${USER_ID}`
      );

      const billsData = res.data || [];

      const totalDue = billsData.reduce(
        (sum, b) => sum + (b.totalAmount || 0),
        0
      );
      const paidThisMonth = billsData.reduce(
        (sum, b) => sum + (b.paidAmount || 0),
        0
      );
      const pending = billsData.reduce(
        (sum, b) => sum + ((b.totalAmount || 0) - (b.paidAmount || 0)),
        0
      );

      setSummary({ totalDue, paidThisMonth, pending });
      setBills(billsData);
    } catch (err) {
      console.error("Payment fetch error", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAY NOW ================= */

  const handlePayNow = async (bill) => {
    setSelectedBill(bill);
    setShowPaymentModal(true);

    try {
      const res = await axios.get(
        `${BASE_URL}/api/companies/type/PAYMENT`
      );
      setPaymentCompanies(res.data || []);
    } catch (err) {
      console.error("PAYMENT fetch error", err);
    }
  };

  /* ================= PAYMENT SELECT ================= */

  const handlePaymentSelect = async (payment) => {
    setSelectedPayment(payment);

    if (payment.name === "UPI") {
      setShowPaymentModal(false);
      setShowSubPaymentModal(true);

      try {
        const res = await axios.get(
          `${BASE_URL}/api/companies/type/SUB_PAYMENT`
        );
        setSubPaymentCompanies(res.data || []);
      } catch (err) {
        console.error("SUB_PAYMENT fetch error", err);
      }
    } else {
      openRazorpay(payment.name, null);
    }
  };

  /* ================= CREATE ORDER ================= */

  const createOrder = async (paymentType, upiApp) => {
    const res = await axios.post(
      `${BASE_URL}/api/payments/create-order`,
      {
        billId: selectedBill.id,
        paymentType,
        upiApp,
      }
    );
    return res.data;
  };

  /* ================= RAZORPAY ================= */

  const openRazorpay = async (paymentType, upiApp) => {
    try {
      const order = await createOrder(paymentType, upiApp);

      const options = {
        key: order.key,
        amount: order.amount * 100,
        currency: "INR",
        name: "Society Maintenance",
        description: "Monthly Bill Payment",
        order_id: order.orderId,

        handler: async function (response) {
          await axios.post(`${BASE_URL}/api/payments/verify`, {
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });

          alert("Payment Successful ✅");
          setShowSubPaymentModal(false);
          fetchPayments();
        },

        theme: {
          color: "#16a34a",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Payment failed", err);
      alert("Payment failed ❌");
    }
  };

  /* ================= BACK ================= */

  const handleBackToPayment = () => {
    setShowSubPaymentModal(false);
    setShowPaymentModal(true);
  };

  if (loading) {
    return (
      <p className="text-center text-gray-500 mt-4">
        Loading payments...
      </p>
    );
  }

  return (
    <div className="space-y-4 p-3">
      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCard title="Total Due" amount={summary.totalDue} />
        <SummaryCard title="Paid This Month" amount={summary.paidThisMonth} />
        <SummaryCard title="Pending" amount={summary.pending} />
      </div>

      {/* BILLS */}
      <section className="space-y-4">
        {bills.map((bill) => {
          const isPaid = bill.paidAmount >= bill.totalAmount;

          return (
            <div
              key={bill.id}
              className="bg-white rounded-xl shadow-md border p-4 space-y-3"
            >
              <div className="flex justify-between">
                <h4 className="font-semibold">Monthly Maintenance</h4>
                <span className="text-xs px-2 py-1 rounded bg-yellow-100">
                  {bill.status}
                </span>
              </div>

              <p className="text-2xl font-bold">₹{bill.totalAmount}</p>

              <p className="text-sm text-gray-500">
                Due:{" "}
                {bill.dueDate
                  ? new Date(bill.dueDate).toLocaleDateString("en-GB")
                  : "N/A"}
              </p>

              {!isPaid ? (
                <button
                  onClick={() => handlePayNow(bill)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded"
                >
                  Pay Now
                </button>
              ) : (
                <span className="text-green-600 font-semibold">✔ Paid</span>
              )}
            </div>
          );
        })}
      </section>

      {/* PAYMENT MODAL */}
      {showPaymentModal && (
        <Modal title="Choose Payment Method" onClose={() => setShowPaymentModal(false)}>
          <Grid>
            {paymentCompanies.map((c) => (
              <OptionCard
                key={c.id}
                name={c.name}
                logo={`${BASE_URL}/api/companies/image/get/company/${c.id}`}
                onClick={() => handlePaymentSelect(c)}
              />
            ))}
          </Grid>
        </Modal>
      )}

      {/* UPI MODAL */}
      {showSubPaymentModal && (
        <Modal
          title="Choose UPI App"
          onClose={() => setShowSubPaymentModal(false)}
          showBack
          onBack={handleBackToPayment}
        >
          <Grid>
            {subPaymentCompanies.map((c) => (
              <OptionCard
                key={c.id}
                name={c.name}
                logo={`${BASE_URL}/api/companies/image/get/company/${c.id}`}
                onClick={() => openRazorpay("UPI", c.name)}
              />
            ))}
          </Grid>

          <p className="text-xs text-center mt-3">
            Amount: ₹{selectedBill.totalAmount - selectedBill.paidAmount}
          </p>
        </Modal>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENTS ================= */

function SummaryCard({ title, amount }) {
  return (
    <div className="bg-white p-3 rounded shadow">
      <p className="text-xs text-gray-500">{title}</p>
      <p className="font-semibold">₹{amount}</p>
    </div>
  );
}

function Modal({ title, children, onClose, showBack, onBack }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center">
      <div className="bg-white w-100 rounded p-4">
        <div className="flex justify-between mb-3">
          <div className="flex gap-2">
            {showBack && (
              <button onClick={onBack} className="border px-2 rounded">
                ←
              </button>
            )}
            <h3 className="font-semibold">{title}</h3>
          </div>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Grid({ children }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

function OptionCard({ name, logo, onClick }) {
  return (
    <button
      onClick={onClick}
      className="border rounded p-3 flex flex-col items-center gap-2"
    >
      <img src={logo} alt={name} className="h-8" />
      <span className="text-xs">{name}</span>
    </button>
  );
}








// import React, { useState } from "react";
// import { ChevronDown } from "lucide-react";

// export default function Payments() {
//   const [showOptions, setShowOptions] = useState(false);

//   return (
//     <div className="min-h-screen bg-gray-100 p-4 flex justify-center">
//       <div className="w-full max-w-md space-y-4">

//         {/* ================= TOP SUMMARY ================= */}
//         <div className="bg-white rounded-xl shadow p-4 space-y-3">
//           <div className="flex justify-between text-center">
//             <div>
//               <p className="text-gray-400 text-sm">Dues</p>
//               <p className="text-red-500 font-bold text-lg">₹ 6,450.00</p>
//             </div>
//             <div>
//               <p className="text-gray-400 text-sm">Deposit</p>
//               <p className="text-green-500 font-bold text-lg">0</p>
//             </div>
//             <div>
//               <p className="text-gray-400 text-sm">Total Advance</p>
//               <p className="text-green-500 font-bold text-lg">0</p>
//             </div>
//           </div>
//         </div>

//         {/* ================= YEAR + STATUS FILTER ================= */}
//         <div className="flex justify-between items-center">
//           <button className="bg-red-500 text-white px-4 py-1 rounded-full flex items-center gap-2 text-sm">
//             2022-2023 <ChevronDown size={16} />
//           </button>

//           <button className="text-gray-500 text-sm flex items-center gap-1">
//             STATUS <ChevronDown size={16} />
//           </button>
//         </div>

//         {/* ================= MAINTENANCE CARD ================= */}
//         <div className="bg-white rounded-xl shadow p-4 space-y-3">

//           <h2 className="font-semibold text-gray-800">
//             Monthly Maintenance Charge
//           </h2>

//           <div className="flex items-center gap-2">
//             <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full font-medium">
//               NEW
//             </span>
//             <p className="text-gray-400 text-sm">01 AUG 2022</p>
//           </div>

//           <p className="text-xl font-bold text-gray-800">₹ 2150.00</p>

//           <p className="text-gray-500 text-sm">
//             Due date 05 Aug 2022
//           </p>

//           {/* ================= ACTION BUTTONS ================= */}
//           <div className="flex gap-3 pt-2">
//             <button className="flex-1 border border-gray-300 text-gray-600 py-2 rounded-lg font-medium hover:bg-gray-100 transition">
//               I have Paid
//             </button>

//             <button
//               onClick={() => setShowOptions(!showOptions)}
//               className="flex-1 bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 transition"
//             >
//               Pay now
//             </button>
//           </div>

//           {/* ================= PAYMENT OPTIONS ================= */}
//           {showOptions && (
//             <div className="mt-3 space-y-2 border-t pt-3">
//               {["UPI", "Debit Card", "Credit Card", "Net Banking"].map(
//                 (method) => (
//                   <button
//                     key={method}
//                     className="w-full text-left px-3 py-2 bg-gray-50 rounded-lg hover:bg-gray-100"
//                   >
//                     {method}
//                   </button>
//                 )
//               )}
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }