"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type User = { id: string| null; email: string; username: string };
type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  guestId: string | null;
  setGuestId: (id: string | null) => void;
  mergeCart: () => Promise<void>; 
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [guestId, setGuestId] = useState<string | null>(null);

  // Restore signed-in user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/decode`, {
          credentials: "include",
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  // Restore or create guestId
  useEffect(() => {
    let storedGuestId = localStorage.getItem("guestId");
    if (!storedGuestId) {
      storedGuestId = crypto.randomUUID();
      localStorage.setItem("guestId", storedGuestId);
    }
    setGuestId(storedGuestId);
  }, []);

  const mergeCart = async () => {
    if (!user?.id || !guestId) return; // only merge if logged in & guest cart exists

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cart/merge/?guestId=${guestId}`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestId }),
      });

      if (!res.ok) throw new Error("Cart merge failed");
      console.log("Cart merged successfully ");
      
      // Optionally: clear guestId so it doesn’t merge again
      localStorage.removeItem("guestId");
      setGuestId(null);

    } catch (err) {
      console.error("Merge cart error:", err);
    }
  };
  return (
    <AuthContext.Provider value={{ user, setUser, guestId, setGuestId,mergeCart }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
