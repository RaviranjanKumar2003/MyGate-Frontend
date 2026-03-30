import React from "react";
import { ArrowLeft } from "lucide-react";

function KidCheck({ setActiveTab }) {
  return (
    <div className="h-full bg-gray-100">

      {/* HEADER */}
      <div className="flex items-center gap-3 bg-[#0b2a35] text-white px-4 py-4 shadow">
        <ArrowLeft
          className="cursor-pointer"
          onClick={() => setActiveTab("THREE_DOT")}   // 👈 back
        />
        <h2 className="text-lg font-semibold">Kid Checkout</h2>
      </div>

      {/* CONTENT */}
      <div className="p-4 space-y-4">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-700 text-lg">
            Kid Checkout Screen Content
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <ActionCard title="Checkout Kid" />
          <ActionCard title="History" />
        </div>
      </div>
    </div>
  );
}

export default KidCheck;

const ActionCard = ({ title }) => (
  <div
    className="bg-white rounded-xl shadow p-6 flex items-center justify-center
    text-gray-700 font-semibold cursor-pointer hover:bg-gray-50"
  >
    {title}
  </div>
);
