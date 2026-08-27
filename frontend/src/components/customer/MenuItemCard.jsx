import { formatTk } from "../../utils/formatCurrency";

function MenuItemCard({ item, onAddToCart }) {
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden flex flex-col hover:scale-[1.02] transition-transform">
      <div className="aspect-[4/3] overflow-hidden bg-black/5 dark:bg-white/5">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-sm" style={{ color: "var(--text-faint)" }}>
            No image yet
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl leading-snug" style={{ fontWeight: 500, color: "var(--text-primary)" }}>
            {item.name}
          </h3>
          <span className="text-lg whitespace-nowrap" style={{ color: "var(--text-primary)" }}>
            {formatTk(item.price)}
          </span>
        </div>

        {item.rating_count > 0 ? (
          <p className="text-sm mt-1.5" style={{ color: "var(--text-secondary)" }}>
            ★ {item.rating_average.toFixed(1)}{" "}
            <span style={{ color: "var(--text-faint)" }}>
              ({item.rating_count} review{item.rating_count !== 1 ? "s" : ""})
            </span>
          </p>
        ) : (
          <p className="text-sm mt-1.5" style={{ color: "var(--text-faint)" }}>No reviews yet</p>
        )}

        {item.description && (
          <p className="text-sm mt-2 leading-relaxed" style={{ color: "var(--text-muted)" }}>
            {item.description}
          </p>
        )}

        {item.ingredients?.length > 0 && (
          <p className="text-sm mt-3 font-accent" style={{ color: "var(--text-faint)" }}>
            {item.ingredients.join(" · ")}
          </p>
        )}

        {!item.is_available ? (
          <span
            className="mt-3 inline-block text-sm liquid-glass rounded-full px-3 py-1 w-fit"
            style={{ color: "var(--text-muted)" }}
          >
            Currently unavailable
          </span>
        ) : (
          <button
            onClick={() => onAddToCart(item)}
            className="mt-4 liquid-glass-strong rounded-full py-2.5 text-base hover:scale-105 transition-transform"
            style={{ color: "var(--text-primary)" }}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}

export default MenuItemCard;