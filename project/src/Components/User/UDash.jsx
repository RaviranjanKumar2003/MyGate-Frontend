import React, { useEffect, useState } from "react";
import api from "../../api/axios";
import { Users, Truck, CreditCard, AlertCircle, Bell } from "lucide-react";

const STAT_CARDS = [
  { label: "Visitors Today", key: "visitors", icon: Users },
  { label: "Pending Deliveries", key: "deliveries", icon: Truck },
  { label: "Pending Payments", key: "payments", icon: CreditCard },
  { label: "Pending Complaints", key: "complaints", icon: AlertCircle },
];

export default function Dash({ userProfile }) {
  const [stats, setStats] = useState({
    visitors: 0,
    deliveries: 0,
    payments: 0,
    complaints: 0,
    notifications: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile?.societyId || !userProfile?.flatId) return;
    fetchStats();
  }, [userProfile?.societyId, userProfile?.flatId]);

  const fetchStats = async () => {
  try {
    setLoading(true);

    const societyId = userProfile.societyId;
    const flatId = userProfile.flatId;

    const urls = {
      visitors: `/visitors/society/${societyId}/flat/${flatId}/count/today`,
      deliveries: `/deliveries/society/${societyId}/flat/${flatId}/pending/count`,
      payments: `/payments/society/${societyId}/flat/${flatId}/pending/count`,
      complaints: `/complaints/society/${societyId}/flat/${flatId}/pending/count`,
    };

    const results = await Promise.allSettled([
      api.get(urls.visitors),
      api.get(urls.deliveries),
      api.get(urls.payments),
      api.get(urls.complaints),
    ]);

    setStats({
      visitors:
        results[0].status === "fulfilled"
          ? results[0].value.data.count
          : 0,

      deliveries:
        results[1].status === "fulfilled"
          ? results[1].value.data.count
          : 0,

      payments:
        results[2].status === "fulfilled"
          ? results[2].value.data.count
          : 0,

      complaints:
        results[3].status === "fulfilled"
          ? results[3].value.data.count
          : 0,

      notifications: 0,
    });
  } catch (err) {
    console.error("Dashboard stats error:", err);
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="p-4 pb-20">
      {/* HEADER */}
      <div className="bg-white rounded-xl p-4 shadow">
        <h2 className="text-lg font-semibold">
          Welcome, {userProfile?.name || "User"} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Here is a quick overview of your society activity.
        </p>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
        {STAT_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.key}
              className="bg-white rounded-xl shadow p-4 flex items-center gap-4"
            >
              <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                <Icon size={22} />
              </div>
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-xl font-bold">
                  {loading ? "…" : stats[card.key]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
