import { useEffect, useState } from "react";
import API from "../api";

// Trang giỏ hàng, hiển thị danh sách món với số lượng, tổng tiền, +/- nút, xóa
export default function Cart() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    reloadCart();
  }, []);

  function reloadCart() {
    try {
      const cartString = localStorage.getItem("cart");
      let cart = [];
      if (cartString) {
        cart = JSON.parse(cartString);
      }
      
      // Migrate old format if needed
      if (cart.length > 0 && typeof cart[0] === "number") {
        const newCart = {};
        cart.forEach(id => newCart[id] = (newCart[id] || 0) + 1);
        cart = Object.entries(newCart).map(([id, quantity]) => ({id: parseInt(id), quantity}));
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        reloadCart();
        return;
      }
      
      if (cart.length === 0) {
        setItems([]);
        return;
      }
      
      API.get("/foods").then(res => {
        const cartItems = cart.filter(item => item.id && item.quantity);
        const itemsWithQty = res.data
          .filter(f => cartItems.some(item => item.id === f.id))
          .map(f => {
            const cartItem = cartItems.find(item => item.id === f.id);
            return { ...f, quantity: cartItem.quantity };
          });
        setItems(itemsWithQty);
      }).catch(() => {
        setItems([]);
      });
    } catch (e) {
      console.error("Cart error:", e);
      localStorage.removeItem("cart");
      setItems([]);
    }
  }

  function removeItem(id) {
    try {
      const cartString = localStorage.getItem("cart");
      if (!cartString) return;
      let cart = JSON.parse(cartString);
      cart = cart.filter(item => item.id !== id);
      localStorage.setItem("cart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
      reloadCart();
    } catch (e) {
      localStorage.removeItem("cart");
      reloadCart();
    }
  }

  function updateQuantity(id, newQty) {
    if (newQty <= 0) {
      removeItem(id);
      return;
    }
    try {
      const cartString = localStorage.getItem("cart");
      if (!cartString) return;
      let cart = JSON.parse(cartString);
      const index = cart.findIndex(item => item.id === id);
      if (index > -1) {
        cart[index].quantity = newQty;
        localStorage.setItem("cart", JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        reloadCart();
      }
    } catch (e) {
      localStorage.removeItem("cart");
      reloadCart();
    }
  }

  const total = items.reduce((sum, i) => sum + (i.price * i.quantity || 0), 0);

  const formatPrice = (price) => Number(price).toLocaleString("vi-VN") + '₫';

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 min-h-screen">
      <h2 className="text-3xl font-bold mb-6 text-gray-800">Giỏ hàng của bạn</h2>
      {items.length === 0 ? (
        <div className="text-center py-12">
          <i className="fas fa-shopping-cart text-6xl text-gray-300 mb-4 block"></i>
          <p className="text-xl text-gray-500 mb-4">Giỏ hàng trống</p>
          <a href="/" className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition">
            Chọn món ăn ngay
          </a>
        </div>
      ) : (
        <div className="grid gap-6">
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left font-bold text-gray-800">Món ăn</th>
                  <th className="p-4 text-center font-bold text-gray-800">Số lượng</th>
                  <th className="p-4 text-right font-bold text-gray-800">Đơn giá</th>
                  <th className="p-4 text-right font-bold text-gray-800">Tạm tính</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-t hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <img src={item.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=80&h=80"} alt={item.name} className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-gray-900">{item.name}</h4>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-10 h-10 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center justify-center font-bold text-gray-700 transition"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-bold text-lg bg-white px-3 py-1 rounded border shadow-sm">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-10 h-10 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center font-bold transition"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-orange-600">
                      {formatPrice(item.price)}
                    </td>
                    <td className="p-4 text-right font-bold text-lg text-green-600">
                      {formatPrice(item.price * item.quantity)}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline transition text-sm"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 text-right">
            <div className="text-2xl font-bold text-gray-800 mb-4">
              Tổng cộng: <span className="text-green-600 text-3xl">{formatPrice(total)}</span>
            </div>
            <button 
              onClick={() => window.location.href = '/payment'}
              className="bg-orange-500 text-white px-8 py-3 rounded-xl font-bold text-lg hover:bg-orange-600 transition shadow-lg w-full md:w-auto">
              Đặt hàng ngay
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

