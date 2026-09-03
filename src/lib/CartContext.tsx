'use client';
import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Product } from './api';

export type CartItem = { product: Product; quantity: number };

type State = {
  items: CartItem[];
  checkedKeys: string[];
  open: boolean;
  hydrated: boolean;
};

type Action =
  | { type: 'ADD'; product: Product }
  | { type: 'BUY_NOW'; product: Product }
  | { type: 'REMOVE'; productId: string }
  | { type: 'UPDATE_QTY'; productId: string; qty: number }
  | { type: 'TOGGLE_CHECK'; key: string }
  | { type: 'SET_ALL_CHECKED'; checked: boolean }
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'CLEAR' }
  | { type: 'HYDRATE'; items: CartItem[]; checkedKeys: string[] };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.items, checkedKeys: action.checkedKeys, hydrated: true };

    case 'ADD': {
      const id = action.product.id;
      const existing = state.items.find(i => i.product.id === id);
      const items = existing
        ? state.items.map(i => i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.items, { product: action.product, quantity: 1 }];
      const checkedKeys = state.checkedKeys.includes(id) ? state.checkedKeys : [...state.checkedKeys, id];
      return { ...state, items, checkedKeys, open: true };
    }
    /**
     * Mua ngay từ luồng video: thêm sản phẩm và tick DUY NHẤT nó.
     *
     * Trang /dat-hang lấy hàng từ checkedItems, nên bỏ tick các món khác là
     * cách để đơn chỉ gồm món đang xem. Khách đang lướt video là mua bốc đồng
     * một món — kéo cả giỏ vào đơn là bắt họ trả tiền cho thứ chưa định mua
     * lúc này. Món khác vẫn nằm nguyên trong giỏ, chỉ bị bỏ tick.
     *
     * Phải là MỘT hành động chứ không phải gọi lần lượt ADD rồi SET_ALL_CHECKED:
     * ADD đặt open: true nên khay giỏ sẽ loé lên đè cả video trước khi chuyển
     * trang.
     */
    case 'BUY_NOW': {
      const id = action.product.id;
      const existing = state.items.find(i => i.product.id === id);
      const items = existing
        ? state.items.map(i => i.product.id === id ? { ...i, quantity: i.quantity + 1 } : i)
        : [...state.items, { product: action.product, quantity: 1 }];
      return { ...state, items, checkedKeys: [id], open: false };
    }
    case 'REMOVE':
      return {
        ...state,
        items: state.items.filter(i => i.product.id !== action.productId),
        checkedKeys: state.checkedKeys.filter(k => k !== action.productId),
      };
    case 'UPDATE_QTY': {
      if (action.qty <= 0) {
        return {
          ...state,
          items: state.items.filter(i => i.product.id !== action.productId),
          checkedKeys: state.checkedKeys.filter(k => k !== action.productId),
        };
      }
      return {
        ...state,
        items: state.items.map(i => i.product.id === action.productId ? { ...i, quantity: action.qty } : i),
      };
    }
    case 'TOGGLE_CHECK': {
      const has = state.checkedKeys.includes(action.key);
      return { ...state, checkedKeys: has ? state.checkedKeys.filter(k => k !== action.key) : [...state.checkedKeys, action.key] };
    }
    case 'SET_ALL_CHECKED':
      return { ...state, checkedKeys: action.checked ? state.items.map(i => i.product.id) : [] };
    case 'OPEN':  return { ...state, open: true };
    case 'CLOSE': return { ...state, open: false };
    case 'CLEAR': return { ...state, items: [], checkedKeys: [] };
    default:      return state;
  }
}

const STORAGE_KEY = 'garutin_cart';
const CHECKED_KEY = 'garutin_cart_checked';

const CartContext = createContext<{
  state: State;
  addToCart: (product: Product) => void;
  /** Mua ngay: thêm vào giỏ và chỉ tick món này. Xem nhánh BUY_NOW. */
  muaNgay: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  toggleCheck: (key: string) => void;
  setAllChecked: (checked: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  checkedItems: CartItem[];
  checkedTotal: number;
} | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    items: [], checkedKeys: [], open: false, hydrated: false,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedChecked = localStorage.getItem(CHECKED_KEY);
      const items: CartItem[] = saved ? JSON.parse(saved) : [];
      const checkedKeys: string[] = savedChecked ? JSON.parse(savedChecked) : [];
      dispatch({ type: 'HYDRATE', items, checkedKeys });
    } catch {
      dispatch({ type: 'HYDRATE', items: [], checkedKeys: [] });
    }
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    localStorage.setItem(CHECKED_KEY, JSON.stringify(state.checkedKeys));
  }, [state.items, state.checkedKeys, state.hydrated]);

  const addToCart      = useCallback((product: Product) => dispatch({ type: 'ADD', product }), []);
  const muaNgay        = useCallback((product: Product) => dispatch({ type: 'BUY_NOW', product }), []);
  const removeFromCart = useCallback((productId: string) => dispatch({ type: 'REMOVE', productId }), []);
  const updateQty      = useCallback((productId: string, qty: number) => dispatch({ type: 'UPDATE_QTY', productId, qty }), []);
  const toggleCheck    = useCallback((key: string) => dispatch({ type: 'TOGGLE_CHECK', key }), []);
  const setAllChecked  = useCallback((checked: boolean) => dispatch({ type: 'SET_ALL_CHECKED', checked }), []);
  const openCart       = useCallback(() => dispatch({ type: 'OPEN' }), []);
  const closeCart      = useCallback(() => dispatch({ type: 'CLOSE' }), []);
  const clearCart      = useCallback(() => dispatch({ type: 'CLEAR' }), []);

  const getItemPrice = (i: CartItem) => Number(i.product.salePrice ?? i.product.price);

  const totalItems   = state.items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice   = state.items.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);
  const checkedItems = state.items.filter(i => state.checkedKeys.includes(i.product.id));
  const checkedTotal = checkedItems.reduce((s, i) => s + getItemPrice(i) * i.quantity, 0);

  return (
    <CartContext.Provider value={{
      state, addToCart, muaNgay, removeFromCart, updateQty, toggleCheck, setAllChecked,
      openCart, closeCart, clearCart, totalItems, totalPrice, checkedItems, checkedTotal,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
