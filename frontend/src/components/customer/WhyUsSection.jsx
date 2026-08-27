import { useState } from "react";

const COMPARISONS = [
  { before: "Frozen, pre-made", after: "Fresh, Prepared Daily", desc: "Every dish is cooked to order using ingredients sourced the same day." },
  { before: "Artificial flavoring", after: "Natural Ingredients", desc: "No shortcuts — real herbs, real spices, real flavor." },
  { before: "Long wait times", after: "Fast, Attentive Service", desc: "From kitchen to table, we keep things moving without rushing the experience." },
  { before: "Hidden fees", after: "Transparent Pricing", desc: "What you see on the menu, in Tk, is what you pay — no surprises." },
];

function FlipCard({ item }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="flip-card h-56 cursor-pointer"
      onClick={() => setFlipped((f) => !f)}
    >
      <div className={`flip-card-inner ${flipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className="flip-card-front liquid-glass rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p
            className="text-lg line-through"
            style={{ color: "var(--text-faint)", textDecorationColor: "#ef4444" }}
          >
            {item.before}
          </p>
          <p className="text-xs mt-3" style={{ color: "var(--text-faint)" }}>
            hover to reveal
          </p>
        </div>

        {/* Back */}
        <div className="flip-card-back liquid-glass-strong rounded-2xl p-6 flex flex-col items-center justify-center text-center">
          <p className="text-lg font-medium mb-2" style={{ color: "var(--text-primary)" }}>
            {item.after}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {item.desc}
          </p>
        </div>
      </div>
    </div>
  );
}

function WhyUsSection() {
  return (
    <div className="relative z-10 px-6 sm:px-10 lg:px-20 py-20" style={{ backgroundColor: "var(--bg-app)" }}>
      <h2
        className="text-4xl sm:text-5xl text-center mb-4"
        style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}
      >
        Why <span className="font-accent" style={{ color: "var(--text-secondary)" }}>Us</span>
      </h2>
      <p className="text-center text-lg mb-14" style={{ color: "var(--text-muted)" }}>
        Hover a card to see the difference
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
        {COMPARISONS.map((item, idx) => (
          <FlipCard key={idx} item={item} />
        ))}
      </div>
    </div>
  );
}

export default WhyUsSection;