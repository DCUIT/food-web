import { useState } from "react";

export default function FoodCard({ food, onAdd }) {
  const [quantity, setQuantity] = useState(1);
  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden group">
      <div className="relative overflow-hidden">
        <img
          src={food.image || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=500"}
          alt={food.name}
          className="w-full h-48 object-cover group-hover:scale-110 transition duration-500"
        />
      </div>
      <div className="p-5">
        <h3 className="font-bold text-lg text-gray-800">{food.name}</h3>
        <p className="text-orange-500 font-bold text-xl my-2">{Number(food.price).toLocaleString("vi-VN")}đ</p>

        <div className="flex items-center justify-center space-x-3 mb-4 p-2 bg-gray-50 rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-600 font-bold text-lg"
            disabled={quantity <= 1}
          >
            -
          </button>
          <span className="font-bold text-xl min-w-[3rem] text-center bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(quantity + 1)}
            className="w-10 h-10 bg-white border border-gray-300 rounded-lg flex items-center justify-center hover:bg-gray-50 transition text-gray-600 font-bold text-lg"
          >
            +
          </button>
        </div>
        <button
          onClick={() => {
if (!localStorage.getItem('token')) {
            localStorage.removeItem('cart');
            window.dispatchEvent(new Event('storage'));
            alert('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            window.location.href = '/login';
            return;
          }
            onAdd({ id: food.id, quantity });

            setQuantity(1); // Reset after add
          }}
          className="w-full bg-orange-500 text-white py-2.5 rounded-lg font-bold hover:bg-orange-600 transition shadow-md shadow-orange-200"
        >
          Thêm {quantity} vào giỏ
        </button>
      </div>
    </div>
  );
}
