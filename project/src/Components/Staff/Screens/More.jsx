import React, { useState } from "react";
import {
  User,
  Truck,
  Car,
  Flame,
  ShoppingCart,
  Hammer,
  Scissors,
  Wrench,
  Bug,
  Paintbrush,
  HelpCircle,
  Search
} from "lucide-react";

const PURPOSES = [
  { label: "Guest", value: "GUEST", icon: <User size={18} /> },
  { label: "Courier / Delivery Boy", value: "DELIVERY", icon: <Truck size={18} /> },
  { label: "Cab Driver", value: "CAB", icon: <Car size={18} /> },
  { label: "Gas Delivery", value: "GUEST", icon: <Flame size={18} /> },
  { label: "Grocery Shop", value: "GUEST", icon: <ShoppingCart size={18} /> },
  { label: "Carpenter", value: "GUEST", icon: <Hammer size={18} /> },
  { label: "Beautician", value: "GUEST", icon: <Scissors size={18} /> },
  { label: "Repair & Maintenance", value: "GUEST", icon: <Wrench size={18} /> },
  { label: "Pest Control", value: "GUEST", icon: <Bug size={18} /> },
  { label: "Interior Designer", value: "GUEST", icon: <Paintbrush size={18} /> },
  { label: "Other Vendors", value: "GUEST", icon: <HelpCircle size={18} /> }
];

function More({ setActiveTab }) {
  const [search, setSearch] = useState("");
  console.log("setActiveTab =>", setActiveTab);

  const filteredPurposes = PURPOSES.filter(p =>
    p.label.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = purpose => {
    // ✅ Sab cases me Guest.jsx open hoga
    setActiveTab(purpose);

  };

  return (
    <div className="min-h-screen bg-[#0b1d2d] text-white p-4 pt-16">
      <div className="max-w-md mx-auto">

        {/* SEARCH */}
        <div className="relative mb-4">
          <Search
            className="absolute left-3 top-3 text-gray-400"
            size={18}
          />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search purpose"
            className="w-full pl-10 p-3 rounded-xl bg-white text-gray-900 placeholder-gray-500 outline-none"
          />
        </div>

        {/* PURPOSE LIST */}
        <ul className="space-y-2">
          {filteredPurposes.map(p => (
            <li key={p.value}>
              <button
                onClick={() => handleSelect(p.value)}
                className="w-full flex items-center gap-4 p-4 rounded-xl bg-[#102a44] hover:bg-indigo-600 transition"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full">
                  {p.icon}
                </div>
                <span className="text-sm font-medium">{p.label}</span>
              </button>
            </li>
          ))}

          {filteredPurposes.length === 0 && (
            <p className="text-center text-gray-400 mt-6">
              No result found
            </p>
          )}
        </ul>
      </div>
    </div>
  );
}

export default More;
