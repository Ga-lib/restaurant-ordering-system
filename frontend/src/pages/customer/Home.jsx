import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  UtensilsCrossed,
  Gift,
  Plus,
} from "lucide-react";
import { FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";
import Navbar from "../../components/common/Navbar";
import { getMenuItems } from "../../services/menuService";
import WhyUsSection from "../../components/customer/WhyUsSection";
import FloatingFoodImages from "../../components/customer/FloatingFoodImages";
import { useBoomerangVideo } from "../../hooks/useBoomerangVideo";
import MapEmbed from "../../components/common/MapEmbed";
import { shareLocation } from "../../utils/locationUtils";
import { getSettings } from "../../services/settingsService";


function Home() {
  const [featureItem, setFeatureItem] = useState(null);
  const heroVideoRef = useRef(null);
  useBoomerangVideo(heroVideoRef);

  useEffect(() => {
    getMenuItems()
      .then((items) => {
        const withImages = items.filter((i) => i.image_url);
        if (withImages[0]) setFeatureItem(withImages[0]);
      })
      .catch(() => {});
  }, []);


    const [location, setLocation] = useState({ latitude: 23.8703, longitude: 90.3960, restaurant_name: "" });
  const [shareStatus, setShareStatus] = useState("");

  useEffect(() => {
    getSettings()
      .then((data) => setLocation(data))
      .catch(() => {});
  }, []);

  async function handleShareLocation() {
    const result = await shareLocation(location.latitude, location.longitude, location.restaurant_name);
    if (result.method === "copied") {
      setShareStatus("Link copied!");
      setTimeout(() => setShareStatus(""), 2500);
    }
  }

  return (
    <div className="relative" style={{ backgroundColor: "var(--bg-app)" }}>
      {/* Background video */}
      <div className="fixed inset-0 z-0">
        <video ref={heroVideoRef} autoPlay muted playsInline className="w-full h-full object-cover opacity-60">
          <source src="/videos/home-hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0" style={{ backgroundColor: "var(--bg-app)", opacity: 0.5 }} />
      </div>

      <div className="min-h-screen flex flex-col lg:flex-row overflow-hidden">
      {/* Left panel */}
      <div className="relative z-10 w-full lg:w-[52%] flex flex-col p-4 lg:p-6">
        <div className="liquid-glass-strong rounded-3xl flex-1 flex flex-col px-2 relative overflow-hidden">
          <FloatingFoodImages />
          <Navbar />

          <div className="flex-1 flex flex-col justify-center px-6 sm:px-10">
            <h1
              className="text-6xl sm:text-7xl lg:text-8xl leading-[1.05]"
              style={{ letterSpacing: "-0.03em", fontWeight: 500, color: "var(--text-primary)" }}
            >
              <div className="animate-word-reveal">
                <span className="delay-300">Taste,</span>
              </div>
              <div className="animate-word-reveal">
                <span className="delay-400 font-accent" style={{ color: "var(--text-secondary)" }}>
                  refined.
                </span>
              </div>
            </h1>

            <div className="mt-10 animate-fade-up delay-600">
              <Link
                to="/menu"
                className="liquid-glass-strong rounded-full inline-flex items-center gap-3 pl-2 pr-7 py-2.5 hover:scale-105 active:scale-95 transition-transform"
              >
                <span className="w-8 h-8 rounded-full bg-black/10 dark:bg-white/15 flex items-center justify-center">
                  <ArrowRight className="w-5 h-5" style={{ color: "var(--text-primary)" }} />
                </span>
                <span className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                  Explore Menu
                </span>
              </Link>
            </div>

            <div className="mt-7 flex flex-wrap gap-2.5 animate-fade-up delay-700">
              {["Dine-in", "Takeaway", "Delivery"].map((tag) => (
                <span
                  key={tag}
                  className="liquid-glass rounded-full px-5 py-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div className="px-6 sm:px-10 pb-10 animate-fade-up delay-900">
            <p className="text-sm tracking-widest uppercase mb-3" style={{ color: "var(--text-muted)" }}>
              Fine Dining
            </p>
            <p className="text-xl leading-relaxed max-w-md" style={{ color: "var(--text-secondary)" }}>
              "We believe a meal should feel like{" "}
              <span className="font-accent">a moment worth remembering</span>."
            </p>
            <div className="flex items-center gap-3 mt-5">
              <span className="h-px w-8" style={{ backgroundColor: "var(--text-faint)" }} />
              <span className="text-sm tracking-widest" style={{ color: "var(--text-muted)" }}>
                THE HEAD CHEF
              </span>
              <span className="h-px w-8" style={{ backgroundColor: "var(--text-faint)" }} />
            </div>
          </div>
        </div>
      </div>

      {/* Right panel (desktop only) */}
      <div className="hidden lg:flex relative z-10 w-[48%] flex-col p-6 gap-4">
        <div className="flex items-center justify-between">
          <div className="liquid-glass rounded-full px-5 py-2.5 flex items-center gap-5">
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
              <FaTwitter className="w-4 h-4" />
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
              <FaLinkedin className="w-4 h-4" />
            </a>
            <a href="#" className="hover:opacity-70 transition-opacity" style={{ color: "var(--text-primary)" }}>
              <FaInstagram className="w-4 h-4" />
            </a>
            <ArrowRight className="w-4 h-4" style={{ color: "var(--text-muted)" }} />
          </div>

          <Link
            to="/login"
            className="liquid-glass w-10 h-10 rounded-full flex items-center justify-center hover:scale-105 transition-transform"
          >
            <Sparkles className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
          </Link>
        </div>

        <div className="liquid-glass rounded-2xl p-6 w-60 animate-fade-in delay-300">
          <p className="text-base font-medium mb-1.5" style={{ color: "var(--text-primary)" }}>
            Join our table
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            Sign up for loyalty rewards, early access to promotions, and reservation priority.
          </p>
        </div>

        <div className="mt-auto liquid-glass-strong rounded-[2.5rem] p-5 flex flex-col gap-4 animate-fade-up delay-800">
          <div className="grid grid-cols-2 gap-4">
            <div className="liquid-glass rounded-3xl p-5">
              <span className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3">
                <UtensilsCrossed className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
              </span>
              <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>Chef's Menu</p>
              <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
                Seasonal, thoughtfully prepared dishes.
              </p>
            </div>
            <div className="liquid-glass rounded-3xl p-5">
              <span className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center mb-3">
                <Gift className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
              </span>
              <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>Loyalty Rewards</p>
              <p className="text-sm mt-1.5" style={{ color: "var(--text-muted)" }}>
                Earn points with every order.
              </p>
            </div>
          </div>

          <div className="liquid-glass rounded-3xl p-4 flex items-center gap-4">
            {featureItem?.image_url && (
              <img
                src={featureItem.image_url}
                alt={featureItem.name}
                className="w-24 h-16 rounded-xl object-cover"
              />
            )}
            <div className="flex-1">
              <p className="text-base font-medium" style={{ color: "var(--text-primary)" }}>
                {featureItem?.name || "Today's Special"}
              </p>
              <p className="text-sm mt-1 line-clamp-2" style={{ color: "var(--text-muted)" }}>
                {featureItem?.description || "Ask your server about today's chef special."}
              </p>
            </div>
            <Link
              to="/menu"
              className="w-9 h-9 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:scale-105 transition-transform shrink-0"
            >
              <Plus className="w-4 h-4" style={{ color: "var(--text-primary)" }} />
            </Link>
          </div>
        </div>
      </div>
    </div>
          <div className="relative z-10 py-10 px-6 sm:px-10" style={{ backgroundColor: "var(--bg-app)" }}>
        <h2
          className="text-4xl sm:text-5xl text-center mb-2"
          style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
        >
          Find <span className="font-accent" style={{ color: "var(--text-secondary)" }}>Us</span>
        </h2>
        <p className="text-center text-lg mb-8" style={{ color: "var(--text-muted)" }}>
          Visit us in person, or share our location with a friend
        </p>

        <div className="max-w-2xl mx-auto">
          <MapEmbed latitude={location.latitude} longitude={location.longitude} height={340} />

          <div className="flex justify-center mt-5">
            <button
              onClick={handleShareLocation}
              className="liquid-glass-strong rounded-full px-6 py-3 text-sm font-medium hover:scale-105 transition-transform"
              style={{ color: "var(--text-primary)" }}
            >
              {shareStatus || "Share Location"}
            </button>
          </div>
        </div>
      </div>
      <WhyUsSection />
    </div>
  );
}
export default Home;