import { createContext, useContext, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]); // [{ menu_item_id, name, price, quantity }]

  function addToCart(item) {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.menu_item_id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menu_item_id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        { menu_item_id: item.id, name: item.name, price: item.price, quantity: 1 },
      ];
    });
  }

  function updateQuantity(menuItemId, quantity) {
    if (quantity <= 0) {
      removeFromCart(menuItemId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => (i.menu_item_id === menuItemId ? { ...i, quantity } : i))
    );
  }

  function removeFromCart(menuItemId) {
    setCartItems((prev) => prev.filter((i) => i.menu_item_id !== menuItemId));
  }

  function clearCart() {
    setCartItems([]);
  }

  const totalAmount = cartItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const totalItemCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalAmount,
    totalItemCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}