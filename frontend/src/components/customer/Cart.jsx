import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { formatTk } from "../../utils/formatCurrency";
import { getTables, holdTable, confirmReservation } from "../../services/tableService";
import { createOrder } from "../../services/orderService";
import { validatePromoCode } from "../../services/promotionService";
import { getSettings } from "../../services/settingsService";
import Navbar from "../../components/common/Navbar";

function round2(n) {
  return Math.round(n * 100) / 100;
}

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart, totalAmount } = useCart();
  const { firebaseUser } = useAuth();
  const navigate = useNavigate();

  const [orderType, setOrderType] = useState("dine_in");
  const [tables, setTables] = useState([]);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("offline");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState("");
  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [restaurantSettings, setRestaurantSettings] = useState({ tax_percent: 0, service_charge_percent: 0 });

  useEffect(() => {
    if (orderType === "dine_in") {
      getTables().then(setTables).catch(() => {});
    }
  }, [orderType]);

  useEffect(() => {
    if (orderType === "dine_in") setPaymentMethod("offline");
    if (orderType === "takeaway") setPaymentMethod("cash_at_counter");
    if (orderType === "online") setPaymentMethod("cash_on_delivery");
  }, [orderType]);

  useEffect(() => {
    getSettings().then(setRestaurantSettings).catch(() => {});
  }, []);

  async function handleSelectTable(table) {
    if (table.status !== "available") return;
    try {
      await holdTable(table.id);
      setSelectedTableId(table.id);
      const updated = await getTables();
      setTables(updated);
    } catch (err) {
      alert("Couldn't hold that table: " + err.message);
    }
  }

  async function handleApplyPromo() {
    setPromoError("");
    setCheckingPromo(true);
    try {
      const result = await validatePromoCode(promoCodeInput, totalAmount);
      setAppliedPromo(result);
    } catch (err) {
      setPromoError(err.message);
      setAppliedPromo(null);
    } finally {
      setCheckingPromo(false);
    }
  }

  async function handlePlaceOrder() {
    setError("");
    if (orderType === "dine_in" && !selectedTableId) {
      setError("Please select a table first.");
      return;
    }
    if (orderType === "online" && !deliveryAddress.trim()) {
      setError("Please enter a delivery address.");
      return;
    }

    setPlacing(true);
    try {
      const customerId = firebaseUser?.uid || "guest";
      if (orderType === "dine_in") {
        await confirmReservation(selectedTableId, customerId);
      }

      const order = await createOrder({
        order_type: orderType,
        table_id: orderType === "dine_in" ? selectedTableId : null,
        customer_id: customerId,
        items: cartItems.map((i) => ({
          menu_item_id: i.menu_item_id,
          name: i.name,
          price: i.price,
          quantity: i.quantity,
        })),
        payment_method: paymentMethod,
        delivery_address: orderType === "online" ? deliveryAddress : null,
        special_instructions: specialInstructions,
        promo_code: appliedPromo ? appliedPromo.code : null,
      });

      clearCart();
      navigate(`/order/${order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "var(--bg-app)" }}>
        <div className="p-4 lg:p-6">
          <div className="liquid-glass-strong rounded-3xl">
            <Navbar />
          </div>
        </div>
        <div className="flex flex-col items-center justify-center gap-4 py-32">
          <p className="text-lg" style={{ color: "var(--text-muted)" }}>Your cart is empty.</p>
          <Link to="/menu" className="underline text-base" style={{ color: "var(--text-primary)" }}>
            Browse the menu
          </Link>
        </div>
      </div>
    );
  }

  const discountedSubtotal = appliedPromo ? appliedPromo.new_total : totalAmount;
  const taxAmount = round2(discountedSubtotal * (restaurantSettings.tax_percent / 100));
  const serviceAmount = round2(discountedSubtotal * (restaurantSettings.service_charge_percent / 100));
  const estimatedTotal = round2(discountedSubtotal + taxAmount + serviceAmount);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "var(--bg-app)" }}>
      <div className="p-4 lg:p-6">
        <div className="liquid-glass-strong rounded-3xl">
          <Navbar />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-5xl mb-10" style={{ fontWeight: 500, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
          Your <span className="font-accent" style={{ color: "var(--text-secondary)" }}>Order</span>
        </h1>

        <div className="flex flex-col gap-4 mb-10">
          {cartItems.map((item) => (
            <div key={item.menu_item_id} className="liquid-glass rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-lg" style={{ color: "var(--text-primary)" }}>{item.name}</p>
                <p className="text-base" style={{ color: "var(--text-muted)" }}>{formatTk(item.price)} each</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)}
                  className="liquid-glass w-8 h-8 rounded-full hover:scale-105 transition-transform"
                  style={{ color: "var(--text-primary)" }}
                >
                  −
                </button>
                <span className="w-6 text-center text-lg" style={{ color: "var(--text-primary)" }}>{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)}
                  className="liquid-glass w-8 h-8 rounded-full hover:scale-105 transition-transform"
                  style={{ color: "var(--text-primary)" }}
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.menu_item_id)}
                  className="text-base ml-3 text-red-400 hover:text-red-300"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="liquid-glass rounded-2xl p-5 mb-8">
          <p className="text-base mb-3" style={{ color: "var(--text-secondary)" }}>Promo Code</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={promoCodeInput}
              onChange={(e) => setPromoCodeInput(e.target.value)}
              placeholder="Enter code"
              className="flex-1 bg-transparent border rounded-full px-4 py-2.5 uppercase outline-none"
              style={{ borderColor: "var(--text-faint)", color: "var(--text-primary)" }}
            />
            <button
              onClick={handleApplyPromo}
              disabled={checkingPromo || !promoCodeInput}
              className="liquid-glass-strong px-5 py-2.5 rounded-full font-medium disabled:opacity-50 hover:scale-105 transition-transform"
              style={{ color: "var(--text-primary)" }}
            >
              {checkingPromo ? "Checking..." : "Apply"}
            </button>
          </div>
          {promoError && <p className="text-red-400 text-sm mt-2">{promoError}</p>}
          {appliedPromo && (
            <p className="text-sm mt-2" style={{ color: "var(--text-secondary)" }}>
              ✓ {appliedPromo.code} applied — ৳{appliedPromo.discount_amount} off
            </p>
          )}
        </div>

        <div className="liquid-glass rounded-2xl p-5 mb-8 text-right">
          {appliedPromo && (
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              Subtotal: {formatTk(totalAmount)} — Discount: −{formatTk(appliedPromo.discount_amount)}
            </p>
          )}
          {restaurantSettings.tax_percent > 0 && (
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              Tax ({restaurantSettings.tax_percent}%): {formatTk(taxAmount)}
            </p>
          )}
          {restaurantSettings.service_charge_percent > 0 && (
            <p className="text-base" style={{ color: "var(--text-muted)" }}>
              Service Charge ({restaurantSettings.service_charge_percent}%): {formatTk(serviceAmount)}
            </p>
          )}
          <p className="text-2xl mt-2" style={{ color: "var(--text-primary)" }}>
            Estimated Total: <span className="font-accent">{formatTk(estimatedTotal)}</span>
          </p>
        </div>

        <div className="mb-8">
          <p className="text-base mb-3" style={{ color: "var(--text-secondary)" }}>Order Type</p>
          <div className="flex gap-3">
            {[
              { value: "dine_in", label: "Dine-in" },
              { value: "takeaway", label: "Takeaway" },
              { value: "online", label: "Delivery" },
            ].map((opt) => (
              <button
                key={opt.value}
                onClick={() => setOrderType(opt.value)}
                className="px-5 py-2 rounded-full text-base transition-transform hover:scale-105 liquid-glass"
                style={{
                  color: orderType === opt.value ? "var(--text-primary)" : "var(--text-muted)",
                  fontWeight: orderType === opt.value ? 500 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {orderType === "dine_in" && (
          <div className="mb-8">
            <p className="text-base mb-3" style={{ color: "var(--text-secondary)" }}>Select a Table</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {tables.map((table) => {
                const isSelected = selectedTableId === table.id;
                const isAvailable = table.status === "available" || isSelected;
                return (
                  <button
                    key={table.id}
                    disabled={!isAvailable}
                    onClick={() => handleSelectTable(table)}
                    className="p-3 rounded-2xl text-base transition-transform hover:scale-105 liquid-glass"
                    style={{
                      color: isSelected ? "var(--text-primary)" : isAvailable ? "#22c55e" : "#ef4444",
                      opacity: isAvailable ? 1 : 0.5,
                      cursor: isAvailable ? "pointer" : "not-allowed",
                      fontWeight: isSelected ? 500 : 400,
                    }}
                  >
                    Table {table.table_number}
                    <br />
                    <span className="text-sm">{table.seat_capacity} seats</span>
                  </button>
                );
              })}
              {tables.length === 0 && (
                <p className="text-base col-span-4" style={{ color: "var(--text-muted)" }}>No tables set up yet.</p>
              )}
            </div>
          </div>
        )}

        {orderType === "online" && (
          <div className="mb-8">
            <label className="block text-base mb-2" style={{ color: "var(--text-secondary)" }}>Delivery Address</label>
            <textarea
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              rows={2}
              className="w-full liquid-glass rounded-2xl px-4 py-3 outline-none"
              style={{ color: "var(--text-primary)" }}
              placeholder="House, road, area, city"
            />
          </div>
        )}

        <div className="mb-8">
          <p className="text-base mb-3" style={{ color: "var(--text-secondary)" }}>Payment Method</p>
          <div className="flex flex-wrap gap-3">
            {orderType === "dine_in" && (
              <span className="liquid-glass text-base rounded-full px-5 py-2.5" style={{ color: "var(--text-secondary)" }}>
                Pay in person (waiter brings the bill)
              </span>
            )}
            {orderType === "takeaway" &&
              ["cash_at_counter", "bkash", "nagad", "card"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className="px-5 py-2 rounded-full text-base capitalize transition-transform hover:scale-105 liquid-glass"
                  style={{
                    color: paymentMethod === method ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: paymentMethod === method ? 500 : 400,
                  }}
                >
                  {method.replace(/_/g, " ")}
                </button>
              ))}
            {orderType === "online" &&
              ["cash_on_delivery", "bkash", "nagad", "card"].map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className="px-5 py-2 rounded-full text-base capitalize transition-transform hover:scale-105 liquid-glass"
                  style={{
                    color: paymentMethod === method ? "var(--text-primary)" : "var(--text-muted)",
                    fontWeight: paymentMethod === method ? 500 : 400,
                  }}
                >
                  {method.replace(/_/g, " ")}
                </button>
              ))}
          </div>
        </div>

        <div className="mb-10">
          <label className="block text-base mb-2" style={{ color: "var(--text-secondary)" }}>
            Special Instructions (optional)
          </label>
          <textarea
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            rows={2}
            className="w-full liquid-glass rounded-2xl px-4 py-3 outline-none"
            style={{ color: "var(--text-primary)" }}
          />
        </div>

        {error && <p className="text-red-400 mb-4 text-base">{error}</p>}

        <button
          onClick={handlePlaceOrder}
          disabled={placing}
          className="w-full liquid-glass-strong py-3.5 rounded-full font-medium text-lg disabled:opacity-50 hover:scale-[1.02] transition-transform"
          style={{ color: "var(--text-primary)" }}
        >
          {placing ? "Placing order..." : "Place Order"}
        </button>
      </div>
    </div>
  );
}

export default Cart;