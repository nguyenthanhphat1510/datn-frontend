"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getCart,
  addCartItem,
  updateCartItem,
  removeCartItem,
  clearCart,
  type CartResponse,
} from "@/services/cart";
import { useAuth } from "./AuthContext";

interface CartContextValue {
  cart: CartResponse | null;
  itemCount: number; // số loại sản phẩm — dùng cho badge Navbar
  loading: boolean;
  refresh: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clear: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      setCart(await getCart());
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load giỏ khi đăng nhập; reset khi đăng xuất.
  // Mọi setState đặt trong callback bất đồng bộ (.then/.finally) để không
  // chạy đồng bộ trong thân effect (tránh cascading render).
  useEffect(() => {
    if (!user) {
      Promise.resolve().then(() => {
        setCart(null);
        setLoading(false);
      });
      return;
    }
    Promise.resolve()
      .then(() => setLoading(true))
      .then(() => getCart())
      .then((data) => setCart(data))
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [user]);

  // Các mutation: backend luôn trả CartResponse mới → set thẳng, không refetch
  const addToCart = useCallback(async (productId: string, quantity: number) => {
    setCart(await addCartItem(productId, quantity));
  }, []);

  const updateItem = useCallback(
    async (productId: string, quantity: number) => {
      setCart(await updateCartItem(productId, quantity));
    },
    [],
  );

  const removeItem = useCallback(async (productId: string) => {
    setCart(await removeCartItem(productId));
  }, []);

  const clear = useCallback(async () => {
    await clearCart();
    setCart({ items: [], total: 0, itemCount: 0 });
  }, []);

  const itemCount = cart?.itemCount ?? 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        itemCount,
        loading,
        refresh,
        addToCart,
        updateItem,
        removeItem,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart phải được dùng bên trong <CartProvider>");
  }
  return ctx;
}
