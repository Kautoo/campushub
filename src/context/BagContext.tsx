"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { BagItem, Product, Order, FulfillmentMethod, OrderContribution } from "@/types";
import { MOCK_STUDENT_ORDERS, MOCK_PRODUCTS } from "@/data/mockData";

interface BagContextType {
  items: BagItem[];
  addItem: (product: Product, quantity?: number, size?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  campaignContribution: OrderContribution | null;
  setCampaignContribution: (contribution: OrderContribution | null) => void;
  clearBag: () => void;
  fulfillmentMethod: FulfillmentMethod;
  setFulfillmentMethod: (method: FulfillmentMethod) => void;
  subtotal: number;
  shipping: number;
  total: number;
  itemCount: number;
  orders: Order[];
  addCompletedOrder: (orderData: Partial<Order>) => Order;
}

const BagContext = createContext<BagContextType | undefined>(undefined);

const BAG_STORAGE_KEY = "campushub_bag_v2";
const ORDERS_STORAGE_KEY = "campushub_orders_v2";

const DEFAULT_ITEMS: BagItem[] = [
  {
    id: "prod_archival_hoodie-M",
    product: MOCK_PRODUCTS[0],
    quantity: 1,
    selectedSize: "M",
  },
  {
    id: "prod_hydro_flask",
    product: MOCK_PRODUCTS[1],
    quantity: 1,
  },
];

const DEFAULT_CONTRIBUTION: OrderContribution | null = null;

export function BagProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<BagItem[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(BAG_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Error reading bag from localStorage:", e);
      }
    }
    return DEFAULT_ITEMS;
  });

  const [campaignContribution, setCampaignContribution] = useState<OrderContribution | null>(
    DEFAULT_CONTRIBUTION
  );

  const [fulfillmentMethod, setFulfillmentMethod] = useState<FulfillmentMethod>("pickup");

  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(ORDERS_STORAGE_KEY);
        if (saved) return JSON.parse(saved);
      } catch (e) {
        console.warn("Error reading orders from localStorage:", e);
      }
    }
    return MOCK_STUDENT_ORDERS;
  });

  // Save items to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(BAG_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to write to localStorage:", e);
    }
  }, [items]);

  // Save orders to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn("Failed to write orders to localStorage:", e);
    }
  }, [orders]);

  const addItem = (product: Product, quantity = 1, size?: string) => {
    const itemId = `${product.id}${size ? `-${size}` : ""}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === itemId);
      if (existing) {
        return prev.map((i) =>
          i.id === itemId ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { id: itemId, product, quantity, selectedSize: size }];
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, quantity } : i))
    );
  };

  const clearBag = () => {
    setItems([]);
    setCampaignContribution(null);
  };

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const shipping = fulfillmentMethod === "delivery" ? 4.5 : 0.0;
  const contributionAmount = campaignContribution ? campaignContribution.amount : 0;
  const total = subtotal + shipping + contributionAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const addCompletedOrder = (orderData: Partial<Order>): Order => {
    const newOrder: Order = {
      id: `ord_${Date.now()}`,
      orderNumber: `CH-${Math.floor(10000 + Math.random() * 90000)}`,
      createdAt: new Date().toISOString(),
      studentName: orderData.studentName || "Alex Rivera",
      studentEmail: orderData.studentEmail || "a.rivera@campus.edu",
      studentId: orderData.studentId || "STU-2024-9104",
      items: items.map((i) => ({
        id: `item_${Date.now()}_${Math.random()}`,
        productId: i.product.id,
        name: i.product.name,
        price: i.product.price,
        quantity: i.quantity,
        size: i.selectedSize,
        organizationName: i.product.organization.name,
        image: i.product.images[0] || "",
      })),
      contribution: campaignContribution || undefined,
      subtotal,
      shipping,
      total,
      fulfillmentMethod,
      fulfillmentLocation:
        fulfillmentMethod === "pickup"
          ? "Campus Center Locker #14, Life Sciences Atrium"
          : undefined,
      pickupPassCode:
        fulfillmentMethod === "pickup"
          ? `LOK-${Math.floor(1000 + Math.random() * 9000)}`
          : undefined,
      trackingNumber:
        fulfillmentMethod === "delivery"
          ? `TRK-CP-${Math.floor(100000 + Math.random() * 900000)}`
          : undefined,
      status: fulfillmentMethod === "pickup" ? "ready_for_pickup" : "dispatched",
      paypalOrderId: orderData.paypalOrderId || `SANDBOX-CH-${Date.now()}`,
      paypalCaptureId: orderData.paypalCaptureId || `CAP-${Date.now()}`,
      ...orderData,
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearBag();
    return newOrder;
  };

  return (
    <BagContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        campaignContribution,
        setCampaignContribution,
        clearBag,
        fulfillmentMethod,
        setFulfillmentMethod,
        subtotal,
        shipping,
        total,
        itemCount,
        orders,
        addCompletedOrder,
      }}
    >
      {children}
    </BagContext.Provider>
  );
}

export function useBag() {
  const context = useContext(BagContext);
  if (!context) {
    throw new Error("useBag must be used within a BagProvider");
  }
  return context;
}
