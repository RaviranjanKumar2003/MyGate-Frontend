import React, { useState } from "react";
import EHome from "./EHome";
import ECart from "./ECart";
import ESell from "./ESell";
import OrderHistory from "./OrderHistory"; // ✅ ADD

function SocietyBazaar() {
  const [activeTab, setActiveTab] = useState("HOME");

  return (
    <div>
      {/* 🔥 NAVBAR */}
      <div className="bg-[#0b2239] text-white flex flex-col sm:flex-row items-center sm:justify-between px-4 sm:px-6 py-3 shadow-md gap-3 sm:gap-0">
        
        {/* Logo */}
        <div className="text-orange-500 text-xl font-bold">
          SOCIETY BAZAAR
        </div>

        {/* Menu */}
        <div className="flex gap-6 flex-wrap justify-center">

          {/* HOME */}
          <button
            onClick={() => setActiveTab("HOME")}
            className={`${activeTab === "HOME" ? "text-orange-500 border-b-2 border-orange-500" : ""}`}
          >
            Home
          </button>

          {/* CART */}
          <button
            onClick={() => setActiveTab("CART")}
            className={`${activeTab === "CART" ? "text-orange-500 border-b-2 border-orange-500" : ""}`}
          >
            Cart
          </button>

          {/* SELL */}
          <button
            onClick={() => setActiveTab("SELL")}
            className={`${activeTab === "SELL" ? "text-orange-500 border-b-2 border-orange-500" : ""}`}
          >
            Sell
          </button>

          {/* 🆕 ORDERS */}
          <button
            onClick={() => setActiveTab("ORDERS")}
            className={`${activeTab === "ORDERS" ? "text-orange-500 border-b-2 border-orange-500" : ""}`}
          >
            Orders
          </button>

        </div>
      </div>

      {/* 🔥 CONTENT */}
      <div className="sm:p-4">
        {activeTab === "HOME" && <EHome />}
        {activeTab === "CART" && <ECart />}
        {activeTab === "SELL" && <ESell />}
        {activeTab === "ORDERS" && <OrderHistory />} {/* ✅ ADD */}
      </div>
    </div>
  );
}

export default SocietyBazaar;