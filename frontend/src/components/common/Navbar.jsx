import { Link, useNavigate } from "react-router-dom";
import { Menu as MenuIcon } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { getSettings } from "../../services/settingsService";
import ThemeToggle from "./ThemeToggle";


function Navbar() {
  const { firebaseUser, profile, logout } = useAuth();
  const { totalItemCount } = useCart();
  const navigate = useNavigate();
  const [restaurantName, setRestaurantName] = useState("L'Atelier");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    getSettings()
      .then((data) => {
        if (data.restaurant_name) setRestaurantName(data.restaurant_name);
      })
      .catch(() => {});
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <nav className="relative z-20 flex items-center justify-between px-6 py-5">
      <Link to="/" className="flex items-center gap-2">
        <span
          className="font-semibold text-3xl tracking-tighter"
          style={{ color: "var(--text-primary)" }}
        >
          {restaurantName.toLowerCase()}
        </span>
      </Link>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-2 text-base hover:scale-105 transition-transform"
            style={{ color: "var(--text-primary)" }}
          >
            <MenuIcon className="w-4 h-4" />
            Menu
          </button>

          {menuOpen && (
            <div className="liquid-glass-dropdown absolute right-0 mt-2 rounded-2xl p-3 flex flex-col gap-1 w-48">
              <Link
                to="/menu"
                className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                style={{ color: "var(--text-secondary)" }}
              >
                Menu
              </Link>
              {firebaseUser && (
                <Link
                  to="/my-orders"
                  className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  My Orders
                </Link>
              )}
              {totalItemCount > 0 && (
                <Link
                  to="/cart"
                  className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Cart ({totalItemCount})
                </Link>
              )}
              {firebaseUser ? (
                <>
                  <span className="text-xs px-3 pt-2" style={{ color: "var(--text-muted)" }}>
                    {profile?.name || firebaseUser.email}
                  </span>
                  {profile?.role === "customer" && (
                    <span className="text-xs px-3" style={{ color: "var(--text-primary)" }}>
                      ★ {profile?.loyalty_points || 0} points
                    </span>
                  )}
                  <button
                    onClick={handleLogout}
                    className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5 text-left"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Log Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Log In
                  </Link>
                  <Link
                    to="/signup"
                    className="text-base px-3 py-2 rounded-xl hover:bg-black/5 dark:hover:bg-white/5"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;