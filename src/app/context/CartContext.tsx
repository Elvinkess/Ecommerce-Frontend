"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number; // product id
  name: string;
  price: number;
  quantity: number;
  image_url: string;
  maxQuantity: number;
}

interface IProduct {
  name: string;
  price: number;
  image_url: string;
  inventory: { quantity_available: number };
}

interface BackendCartRes {
  product_id: number;
  quantity: number;
  product: IProduct;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const { user, guestId } = useAuth();
  const [cart, setCart] = useState<CartItem[]>([]);

  // --- Load cart whenever user or guestId changes ---
  useEffect(() => {
    const loadCart = async () => {
      try {
        let url = "";
        if (user?.id) {
          url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/getcart/?userId=${user.id}`;
        } else if (guestId) {
          url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/getcart/?guestId=${guestId}`;
        } else {
          setCart([]);
          return;
        }

        const res = await fetch(url, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to fetch cart");

        const backendCart = await res.json();
        const cartItems: CartItem[] = backendCart.cart_items?.length
          ? backendCart.cart_items
              .filter((ci: BackendCartRes) => ci.product)
              .map((ci: BackendCartRes) => ({
                id: ci.product_id,
                name: ci.product.name,
                price: ci.product.price,
                quantity: ci.quantity,
                image_url: ci.product.image_url,
                maxQuantity: ci.product.inventory?.quantity_available || 0,
              }))
          : [];

        setCart(cartItems);
      } catch (err) {
        console.error("Error loading cart:", err);
        setCart([]);
      }
    };

    loadCart();
  }, [user, guestId]);

  // --- Actions ---
  const addToCart = (item: Omit<CartItem, "quantity">, quantity: number = 1) => {
    if (!user && !guestId) return; // must have either a user or a guest

    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { ...item, quantity, maxQuantity: item.maxQuantity ?? 99 }];
    });
   
    // Call backend
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/addItem`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id:user?.id ? user.id : null,
        guest_id: guestId ? guestId : null,
        product_id: item.id,
        quantity
      }),
    }).catch((err) => console.error("Failed to sync cart:", err));
  };

  const removeFromCart = (productId: number) => {
    if (!user && !guestId) return; // must have either a user or a guest

    let removedItem: CartItem | null = null;

    setCart((prev) => {
      const item = prev.find((p) => p.id === productId);
      if (item) removedItem = item;
      return prev.filter((p) => p.id !== productId);
    });
    const url = user?.id
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/${user.id}/items/${productId}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/guest/item/${productId}`;
      console.log(url,guestId)
    fetch(url, {
      method: "DELETE",
      credentials: "include",
      body: JSON.stringify(user?.id ? {} : { guestId: guestId }),
      headers: { "Content-Type": "application/json" },
    }).catch((err) => {
      console.error(err);
      if (removedItem) setCart((prev) => [...prev, removedItem!]);
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (!user && !guestId) return; // must have either a user or a guest
    console.log("update")

    let prevQ: number | undefined;
    setCart((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          prevQ = p.quantity;
          const safeQty = Math.max(1, Math.min(quantity, p.maxQuantity || 99));
          return { ...p, quantity: safeQty };
        }
        return p;
      })
    );

    const url = user?.id
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/${user.id}/items/${productId}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/guest/item/${productId}`;
    console.log(url,(user?.id ? { quantity } : { quantity, guestId: guestId }),"----")
    fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user?.id ? { quantity } : { quantity, guestId: guestId }),
    }).catch((err) => {
      console.error(err);
      setCart((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, quantity: prevQ || 1 } : p
        )
      );
    });
  };

  const clearCart = () => {
    if (!user && !guestId) return; // must have either a user or a guest
    console.log("update")

    setCart([]);
    const url = user?.id
      ? `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/remove/${user.id}`
      : `${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/clear/guest?guestId=${guestId}`;

    fetch(url, {
      method: "DELETE",
      credentials: "include",
    }).catch((err) => console.error("Failed to clear cart:", err));
  };

  return (
    <CartContext.Provider
      value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
