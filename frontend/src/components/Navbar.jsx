import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

export default function Navbar() {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [username, setUsername] = useState(localStorage.getItem("username"));
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const handleStorageChange = () => {
      setToken(localStorage.getItem("token"));
      setUsername(localStorage.getItem("username"));
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
    };

    window.addEventListener("storage", handleStorageChange);
    // Polling để cập nhật giỏ hàng nhanh hơn
    const interval = setInterval(() => {
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");
      setCartCount(cart.reduce((sum, item) => sum + (item.quantity || 0), 0));
    }, 500);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
localStorage.removeItem("username");
    localStorage.removeItem("cart");
    window.dispatchEvent(new Event("storage"));
    setToken(null);
    setUsername(null);
    window.location.href = "/";
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-bold text-green-600 flex items-center gap-2">
          <i className="fas fa-utensils"></i> Hương Vị Việt
        </Link>

        <nav className="hidden md:flex space-x-6 font-medium text-gray-700">
          <Link to="/" className="hover:text-green-600 transition">Trang Chủ</Link>
          <Link to="/menu" className="hover:text-green-600 transition">Đơn Đã Đặt</Link>
          <Link to="/" className="hover:text-green-600 transition">Ưu Đãi</Link>
          <Link to="/" className="hover:text-green-600 transition">Liên Hệ</Link>
        </nav>

        <div className="flex items-center space-x-4">
          {token ? (
            <div className="flex items-center gap-3">
              {username === "admin" && (
                <Link
                  to="/admin"
                  className="text-yellow-600 hover:text-yellow-700 font-semibold"
                  title="Quản trị"
                >
                  <i className="fas fa-cog text-xl"></i>
                </Link>
              )}
              <span className="text-green-600 font-semibold hidden sm:inline">{username}</span>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-green-600 transition"
                title="Đăng xuất"
              >
                <i className="fas fa-sign-out-alt text-xl"></i>
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-green-600 transition" title="Đăng nhập">
              <i className="fas fa-user text-xl"></i>
            </Link>
          )}
          <Link to="/cart" className="relative text-gray-600 hover:text-green-600 transition">
            <i className="fas fa-shopping-cart text-xl"></i>
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
