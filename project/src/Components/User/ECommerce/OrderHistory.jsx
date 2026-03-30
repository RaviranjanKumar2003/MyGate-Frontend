import React, { useEffect, useState } from "react";
import api from "../../../api/axios";

function OrderHistory() {
  const userId = localStorage.getItem("userId");

  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [addresses, setAddresses] = useState({});

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get(`/orders/buyer/${userId}`);
      setOrders(res.data || []);

      // 👉 Fetch addresses for all orders
      res.data.forEach((order) => {
        if (order.addressId) fetchAddress(order.addressId);
      });

    } catch (err) {
      console.error(err);
    }
  };

  const fetchAddress = async (id) => {
    if (addresses[id]) return;

    try {
      const res = await api.get(`/addresses/${id}`);
      setAddresses((prev) => ({ ...prev, [id]: res.data }));
    } catch (err) {
      console.error(err);
    }
  };

  const toggleDetails = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  /* ================= CANCEL ORDER ================= */
  const cancelOrder = async (id) => {
    try {
      await api.put(`/orders/${id}/status?status=CANCELLED`);
      alert("❌ Order Cancelled");
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel");
    }
  };

  /* ================= STATUS COLORS ================= */
  const statusSteps = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];

  const getStatusIndex = (status) => {
    return statusSteps.indexOf(status);
  };

  return (
    <div className="p-4 max-w-4xl mx-auto">

      <h2 className="text-2xl font-bold mb-4">🛒 My Orders</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500">No Orders Yet</p>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="bg-white shadow rounded-xl p-4 mb-4">

            {/* HEADER */}
            <div className="flex justify-between">
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>

              <div className="text-sm">
                <span className="px-2 py-1 bg-gray-200 rounded">
                  {order.paymentMethod}
                </span>
              </div>
            </div>

            {/* PRICE */}
            <div className="flex justify-between mt-2">
              <p className="text-lg font-bold text-orange-500">
                ₹{order.totalAmount}
              </p>

              <button
                onClick={() => toggleDetails(order.id)}
                className="text-blue-600 text-sm"
              >
                {expandedId === order.id ? "Hide ▲" : "View ▼"}
              </button>
            </div>

            {/* TIMELINE */}
            <div className="flex justify-between mt-3 text-xs">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex-1 text-center">
                  <div
                    className={`h-2 rounded ${
                      index <= getStatusIndex(order.status)
                        ? "bg-green-500"
                        : "bg-gray-300"
                    }`}
                  ></div>
                  <p>{step}</p>
                </div>
              ))}
            </div>

            {/* DETAILS */}
            {expandedId === order.id && (
              <div className="mt-3 border-t pt-3 text-sm">

                {/* PRODUCTS */}
                <p><b>Products:</b></p>
                {order.productIds?.map((pid, i) => (
                  <p key={i}>
                    Product ID: {pid} | Qty: {order.quantities[i]}
                  </p>
                ))}

                {/* ADDRESS */}
                {addresses[order.addressId] && (
                  <div className="mt-2">
                    <p><b>Delivery Address:</b></p>
                    <p>{addresses[order.addressId].name}</p>
                    <p>
                      {addresses[order.addressId].line1},{" "}
                      {addresses[order.addressId].city}
                    </p>
                    <p>{addresses[order.addressId].state}</p>
                    <p>{addresses[order.addressId].phone}</p>
                  </div>
                )}

                {/* CANCEL BUTTON */}
                {order.status !== "DELIVERED" && order.status !== "CANCELLED" && (
                  <button
                    onClick={() => cancelOrder(order.id)}
                    className="mt-3 bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Cancel Order
                  </button>
                )}

              </div>
            )}

          </div>
        ))
      )}
    </div>
  );
}

export default OrderHistory;