"use client";

import {
  createContext, useContext,useState,useEffect,ReactNode} from "react";
import { useAuth } from "./AuthContext";

export interface CartItem {
  id: number;       // product id
  name:string;
  price: number;
  quantity: number;
  image_url:string;
  maxQuantity:number
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">,quantity?: number ) => void;
  removeFromCart: (id: number) => void;
  clearCart: () => void;
  updateQuantity: (productId: number, quantity: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const { user } = useAuth(); //  get current logged in user

  // --- Load cart when user changes (login/logout) ---
  useEffect(() => {
    const loadCart = async () => {
      if (user) {
        try {
          const id = Number(user.id)
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/getcart/${id}`, {
            credentials: "include",
          });
          if (!res.ok) throw new Error("Failed to fetch cart");
          const backendCart = await res.json();
  
          // Normalize backend response into CartItem[]
          const cartItems: CartItem[] = backendCart.cart_items?.length
            ? backendCart.cart_items
                .filter((ci: any) => ci.product) // ✅ only process valid products
                .map((ci: any) => ({
                  id: ci.product_id,
                  name: ci.product.name,
                  price: ci.product.price,
                  quantity: ci.quantity,
                  image_url: ci.product.image_url,
                  maxQuantity: ci.product.inventory?.quantity_available || 0,
                }))
            : [];


          // --- merge with guest cart if it exists ---
          const guestCartRaw = localStorage.getItem("guest_cart");
          if (guestCartRaw) {
            const guestCart: CartItem[] = JSON.parse(guestCartRaw);

            // merge arrays (in memory only)
            const merged = [...cartItems];
            guestCart.forEach((gc) => {
              const existing = merged.find((m) => m.id === gc.id);
              if (existing) {
                existing.quantity += gc.quantity;
              } else {
                merged.push(gc);
              }
            });

            //  Only sync guest cart items to backend, not the full merged array
            for (const item of guestCart) {
              await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/additem`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  user_id: id,
                  name:item.name,
                  product_id: item.id,
                  quantity: item.quantity,
                  image:item.image_url,
                  maxQuantity: item.maxQuantity
                }),
              });
            }

            localStorage.removeItem("guest_cart");
            setCart(merged);
          } else {
            setCart(cartItems);
          }

        } catch (err) {
          console.error("Error fetching cart:", err);
          setCart([]); // fallback empty cart on error
        }
      } else {
        const storedCart = localStorage.getItem("guest_cart");
        if (storedCart) setCart(JSON.parse(storedCart));
        else setCart([]); // fallback empty cart if nothing in localStorage
      }
    };
  
    loadCart();
  }, [user]);
  

  // keep guest cart synced in localStorage
  useEffect(() => {
    if (!user) {
      localStorage.setItem("guest_cart", JSON.stringify(cart));
    }
  }, [cart, user]);

  // --- Actions ---
  const addToCart = (item: Omit<CartItem, "quantity">,quantity: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      if (existing) {
        return prev.map((p) =>
          p.id === item.id ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { ...item, quantity: quantity ,maxQuantity: item.maxQuantity ?? 99}];
    });

    if (user) {
      const id = Number(user.id)

      // also update backend
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/additem`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: id,
          product_id: item.id,
          quantity
        }),
      }).catch((err) => console.error("Failed to sync cart:", err));
    }
  };

  const removeFromCart = (productId: number) => {
  
    let removedItem: CartItem | null = null;
  
    setCart((prev) => {
      const item = prev.find((p) => p.id === productId);
      if (item) removedItem = item; // store full item before removing
      return prev.filter((p) => p.id !== productId);
    });
    
    if (!user) return;
    const id = Number(user.id);
  
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/${id}/items/${productId}`, {
      method: "DELETE",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to remove item");
        }
      })
      .catch((err) => {
        console.error(err);
        if (removedItem) {
          // rollback with the full CartItem
          setCart((prev) => [...prev, removedItem!]);
        }
      });
  };
  
  
  const updateQuantity = async(productId: number, quantity: number) => {
    let prevQ: number | undefined

    setCart((prev) =>
      prev.map((p) => {
        if(p.id === productId){
          prevQ =p.quantity
          const maxQ = p.maxQuantity || 1; //  fallback if missing or invalid
          const safeQty = Math.max(1, Math.min(quantity, maxQ));
          return  { ...p, quantity: safeQty }
        } return p
        
      })
    );

    try {
      if (!user) return; // user must be logged in
      const id = Number(user.id);
      const res =fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/${id}/items/${productId}`,{
        method:"PATCH",
        credentials:"include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ quantity }),
      });
      if(!(await res).ok){throw new Error("Failed to update quantity")}
    } catch (error) {
      console.log(error);

      setCart((prev)=>
        prev.map((p)=>p.id===productId ? {...p,quantity:prevQ || 1 }: p)
      )
    }
  };
  

  const clearCart = () => {
    setCart([]);
    if (user) {
      fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/remove/${Number(user.id)}`, {
        method: "DELETE",
        credentials: "include",
      }).catch((err) => console.error("Failed to clear cart:", err));
    } else {
      localStorage.removeItem("guest_cart");
    }
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart,updateQuantity }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}











































// import { createContext, useContext, useState, ReactNode } from "react";

// export interface CartItem {
//   id: number;
//   price: number;
//   quantity: number;
// }

// interface CartContextType {
//   cart: CartItem[];
//   addToCart: (item: Omit<CartItem, "quantity">) => void;

// }

// const CartContext = createContext<CartContextType | undefined>(undefined);

// export default function CartProvider({ children }: { children: ReactNode }) {
//   const [cart, setCart] = useState<CartItem[]>([]);
  
//   const addToCart = (item: Omit<CartItem, "quantity">) => {
//     setCart((prev) => {
//       const existing = prev.find((p) => p.id === item.id);
//       if (existing) {
//         return prev.map((p) =>
//           p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p
//         );
//       }
//       return [...prev, { ...item, quantity: 1 }]; // 👈 quantity auto-added
//     });
//   };
  

//   return (
//     <CartContext.Provider value={{ cart, addToCart }}>
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   const context = useContext(CartContext);
//   if (!context) throw new Error("useCart must be used inside CartProvider");
//   return context;
// }
