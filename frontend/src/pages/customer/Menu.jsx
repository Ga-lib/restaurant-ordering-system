import { useEffect, useState, useRef } from "react";
import { getMenuItems, getWeatherRecommendations } from "../../services/menuService";
import MenuItemCard from "../../components/customer/MenuItemCard";
import { useCart } from "../../context/CartContext";
import Navbar from "../../components/common/Navbar";
import { useToast } from "../../context/ToastContext";
import { useBoomerangVideo } from "../../hooks/useBoomerangVideo";
import PageTransition from "../../components/common/PageTransition";

function Menu() {
  const [items, setItems] = useState([]);
  const menuVideoRef = useRef(null);
  useBoomerangVideo(menuVideoRef);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const { addToCart } = useCart();
  const { showToast } = useToast();

  function handleAddToCart(item) {
    addToCart(item);
    showToast(`${item.name} added to cart`);
  }
  const [weatherRec, setWeatherRec] = useState(null);

  useEffect(() => {
    getMenuItems()
      .then(setItems)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    getWeatherRecommendations()
      .then((data) => {
        if (data.items && data.items.length > 0) setWeatherRec(data);
      })
      .catch(() => {});
  }, []);

  const categories = ["All", ...new Set(items.map((i) => i.category))];

  const GLOBAL_AVERAGE = 4;
  const MIN_REVIEWS_WEIGHT = 5;

  function weightedScore(item) {
    const count = item.rating_count || 0;
    const average = item.rating_average || 0;
    return (
      (count / (count + MIN_REVIEWS_WEIGHT)) * average +
      (MIN_REVIEWS_WEIGHT / (count + MIN_REVIEWS_WEIGHT)) * GLOBAL_AVERAGE
    );
  }

  const filteredItems =
    activeCategory === "All" ? items : items.filter((i) => i.category === activeCategory);

  const visibleItems = [...filteredItems].sort((a, b) => weightedScore(b) - weightedScore(a));

  return (
    <PageTransition>
    <div className="min-h-screen relative" style={{ backgroundColor: "var(--bg-app)" }}>
      {/* Background video */}
      <div className="fixed inset-0 z-0">
        <video ref={menuVideoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-50">
          <source src="/videos/menu-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-app)", opacity: 0.6 }} />
      </div>

      <div className="relative z-10">
        <div className="relative z-20 p-4 lg:p-6">
          <div className="liquid-glass-strong rounded-3xl">
            <Navbar />
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="liquid-glass-dropdown rounded-3xl p-8 mb-10">
          <h1
            className="text-5xl sm:text-6xl text-center mb-4"
            style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
          >
            Our <span className="font-accent" style={{ color: "var(--text-secondary)" }}>Menu</span>
          </h1>
          <p className="text-center text-lg" style={{ color: "var(--text-muted)" }}>
            All prices shown in Bangladeshi Taka (৳)
          </p>
          </div>

          {weatherRec && (
            <div className="liquid-glass rounded-2xl p-5 mb-10 text-center max-w-2xl mx-auto">
              <p className="text-base" style={{ color: "var(--text-secondary)" }}>
                It's {weatherRec.weather_tags.join(" and ")} today — chef recommends:{" "}
                <span style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                  {weatherRec.items.map((i) => i.name).join(", ")}
                </span>
              </p>
            </div>
          )}

          {/* Category tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="px-5 py-2 rounded-full text-base transition-transform hover:scale-105 liquid-glass"
                style={{
                  color: activeCategory === cat ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: activeCategory === cat ? 500 : 400,
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading && <p className="text-center text-lg" style={{ color: "var(--text-muted)" }}>Loading menu...</p>}
          {error && <p className="text-red-400 text-center text-lg">Couldn't load the menu: {error}</p>}
          {!loading && !error && visibleItems.length === 0 && (
            <p className="text-center text-lg" style={{ color: "var(--text-muted)" }}>No items in this category yet.</p>
          )}

          {!loading && visibleItems.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pb-16">
              {visibleItems.map((item) => (
                <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </PageTransition>
  );
}

export default Menu;