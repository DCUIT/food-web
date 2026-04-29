import { useEffect, useState } from "react";
import API from "../api";

export default function Menu() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (token) {
      API.get("/orders", { headers: { Authorization: `Bearer ${token}` } })
        .then(res => {
          setOrders(res.data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  const parseItems = (itemsStr) => {
    try {
      return JSON.parse(itemsStr);
    } catch {
      return [];
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Title */}
      <section className="py-10 text-center">
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 uppercase tracking-tight">
          Lịch Sử Đặt Món
        </h1>
      </section>

      {/* Orders List */}
      <main className="container mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center py-10">Đang tải...</div>
        ) : !token ? (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">Vui lòng đăng nhập để xem lịch sử đặt món</p>
            <a href="/login" className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600">
              Đăng nhập
            </a>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-6xl mb-4">🍽️</p>
            <p className="text-gray-500">Bạn chưa có đơn hàng nào</p>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            {orders.map(order => {
              const items = parseItems(order.items);
              const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4 border-b pb-3">
                    <div>
                      <span className="font-bold text-lg">Đơn hàng #{order.id}</span>
                      <span className="ml-3 text-gray-500 text-sm">by {order.user}</span>
                    </div>
                    <span className="text-orange-500 font-bold text-xl">{formatPrice(total)}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-gray-700">
                        <span>{item.name} x{item.quantity}</span>
                        <span>{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}