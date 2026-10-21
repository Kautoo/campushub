"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useBag } from "@/context/BagContext";
import { MOCK_PRODUCTS } from "@/data/mockData";
import { Order } from "@/types";
import {
  SpotlightCard,
  FastPassModal,
} from "@/components/ui/react-bits";
import { PageHero } from "@/components/ui/page-hero";

export default function CheckoutPage() {
  const {
    items,
    addItem,
    removeItem,
    updateQuantity,
    campaignContribution,
    setCampaignContribution,
    fulfillmentMethod,
    setFulfillmentMethod,
    subtotal,
    shipping,
    addCompletedOrder,
  } = useBag();

  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);
  const [selectedLockerStation, setSelectedLockerStation] = useState(
    "Student Union Hub A — Compartment #B-104"
  );
  const [dormAddress, setDormAddress] = useState(
    "Crothers Hall • Room 314 (Resident Mailroom)"
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [fastPassOpen, setFastPassOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 10% Student Union Benefit
  const studentDiscount = Number((subtotal * 0.1).toFixed(2));
  const promoDiscount = promoApplied ? 5.0 : 0.0;
  const grantAmount = campaignContribution ? campaignContribution.amount : 0.0;
  const finalTotal = Math.max(
    0,
    Number(
      (
        subtotal -
        studentDiscount -
        promoDiscount +
        shipping +
        grantAmount
      ).toFixed(2)
    )
  );

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim()) {
      setPromoApplied(true);
    }
  };

  const handleCheckout = async (method: "paypal" | "student_card") => {
    if (items.length === 0 && !campaignContribution) return;
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let paypalOrderId = `SANDBOX-CH-${Date.now()}`;
      let paypalCaptureId = `CAP-${Date.now()}`;

      if (method === "paypal") {
        const createRes = await fetch("/api/paypal/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: items.map((i) => ({
              name: i.product.name,
              price: Number((i.product.price * 0.9).toFixed(2)),
              quantity: i.quantity,
            })),
            shipping,
            contribution: campaignContribution,
          }),
        });
        if (createRes.ok) {
          const createData = await createRes.json();
          if (createData.id) {
            paypalOrderId = createData.id;
          }
          const captureRes = await fetch("/api/paypal/capture-order", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ orderID: paypalOrderId }),
          });
          if (captureRes.ok) {
            const capData = await captureRes.json();
            if (capData.captureId) {
              paypalCaptureId = capData.captureId;
            }
          }
        }
      }

      const order = addCompletedOrder({
        studentName: "Alex Rivera",
        studentEmail: "arivera27@stanford.edu",
        studentId: "#STU-882194",
        total: finalTotal,
        fulfillmentLocation:
          fulfillmentMethod === "pickup"
            ? selectedLockerStation
            : dormAddress,
        pickupPassCode: "LOCKER-B104-PIN-8492",
        paypalOrderId,
        paypalCaptureId,
      });

      setCompletedOrder(order);
    } catch {
      setErrorMessage(
        "Could not reach payment gateway. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const restoreSampleBag = () => {
    addItem(MOCK_PRODUCTS[0], 1, "M");
    addItem(MOCK_PRODUCTS[1], 1);
  };

  if (completedOrder) {
    return (
      <main className="relative pt-28 sm:pt-32 pb-24 max-w-4xl mx-auto px-6">
        <SpotlightCard className="bg-surface-container-lowest rounded-[2.25rem] border border-outline-variant/40 p-8 sm:p-12 shadow-xl space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-outline-variant/25">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container text-on-secondary-fixed text-[11px] font-extrabold uppercase tracking-widest">
                <span className="material-symbols-outlined text-[15px]">
                  verified
                </span>
                Order Confirmed & Locker Reserved
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold font-headline text-on-surface tracking-tight">
                Your Smart Locker Pass is{" "}
                <span className="font-editorial italic font-normal text-primary">
                  Ready.
                </span>
              </h1>
              <p className="text-xs text-on-surface-variant">
                Order{" "}
                <span className="font-mono font-bold text-on-surface">
                  {completedOrder.orderNumber}
                </span>{" "}
                • PayPal Ref:{" "}
                <span className="font-mono text-primary">
                  {completedOrder.paypalOrderId}
                </span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setFastPassOpen(true)}
              className="bg-primary hover:bg-primary-container text-on-primary font-headline font-bold text-xs px-5 py-3.5 rounded-xl transition-all flex items-center gap-2 shadow-md cursor-pointer shrink-0"
            >
              <span className="material-symbols-outlined text-[18px]">
                qr_code_2
              </span>
              Open CampusHub Dynamic QR Locker Pass
            </button>
          </div>

          {/* Locker Details Bento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-secondary-container/25 border border-primary/25 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-primary font-bold">
                Assigned Smart Locker
              </span>
              <p className="text-base font-extrabold font-headline text-on-surface">
                {completedOrder.fulfillmentLocation}
              </p>
              <p className="text-xs text-on-surface-variant">
                Unlock PIN:{" "}
                <strong className="font-mono text-primary">8492</strong> • Held
                for 48 hours
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-1.5">
              <span className="text-[10px] font-mono uppercase tracking-widest text-outline font-bold">
                Verified Student Settlement
              </span>
              <p className="text-base font-extrabold font-headline text-on-surface">
                ${completedOrder.total.toFixed(2)} Paid (10% Scholar Benefit)
              </p>
              <p className="text-xs text-on-surface-variant">
                Receipt synced to {completedOrder.studentEmail}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-outline-variant/25">
            <Link
              href="/shop"
              className="text-xs font-bold text-on-surface-variant hover:text-primary flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">
                arrow_back
              </span>
              Continue Browsing Store
            </Link>
            <div className="flex items-center gap-3">
              <Link
                href="/map"
                className="px-4 py-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface text-xs font-bold transition-colors"
              >
                Locate Locker on Map
              </Link>
              <Link
                href="/account"
                className="px-5 py-2.5 rounded-xl bg-on-surface hover:bg-primary text-surface text-xs font-bold transition-colors"
              >
                View in Student Profile →
              </Link>
            </div>
          </div>
        </SpotlightCard>

        <FastPassModal
          isOpen={fastPassOpen}
          onClose={() => setFastPassOpen(false)}
          title={`Smart Locker Pass • ${completedOrder.orderNumber}`}
          subtitle="READY FOR PICKUP • PIN: 8492"
          passCode={completedOrder.pickupPassCode || "LOCKER-B104-8492"}
          location={
            completedOrder.fulfillmentLocation ||
            "Student Union Hub A — Compartment #B-104"
          }
          badgeLabel="SMART LOCKER UNLOCK PASS"
        />
      </main>
    );
  }

  return (
    <main className="relative pt-28 sm:pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* 1. UNIFIED PAGE HERO */}
      <PageHero
        titleLead="Review your"
        titleHighlight="collegiate bag"
        titleTrail="& confirm locker pickup."
        description="Your 10% Verified Student Union Co-Op benefit is automatically applied. Complete checkout to receive your instant CampusHub Dynamic QR Smart Locker unlock pass."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN (7 Cols): Bag Items & Smart Locker Selector */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Cart Items List */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-6 border-b border-outline-variant/25">
              <h2 className="text-lg font-extrabold font-headline text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  local_mall
                </span>
                Your Bag ({items.length}{" "}
                {items.length === 1 ? "Item" : "Items"})
              </h2>
              <span className="text-xs font-mono font-semibold text-primary bg-secondary-container/50 px-3 py-1 rounded-full">
                All Items In-Stock for 2h Pickup
              </span>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 space-y-4">
                <span className="material-symbols-outlined text-4xl text-outline">
                  shopping_bag
                </span>
                <p className="text-sm font-bold text-on-surface">
                  Your collegiate bag is currently empty.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={restoreSampleBag}
                    className="px-4 py-2.5 rounded-xl bg-secondary-container text-on-secondary-fixed text-xs font-bold cursor-pointer"
                  >
                    Restore Sample Gear
                  </button>
                  <Link
                    href="/shop"
                    className="px-4 py-2.5 rounded-xl bg-on-surface text-surface text-xs font-bold"
                  >
                    Browse Store
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {items.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`flex flex-col sm:flex-row gap-5 ${
                      idx < items.length - 1
                        ? "pb-6 border-b border-outline-variant/25"
                        : ""
                    }`}
                  >
                    <Link
                      href={`/shop/${item.product.id}`}
                      className="w-full sm:w-28 h-28 rounded-2xl bg-surface-container-low overflow-hidden shrink-0 block"
                    >
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                              {item.product.category} •{" "}
                              {item.product.organization.name}
                            </span>
                            <h3 className="text-base font-extrabold font-headline text-on-surface">
                              {item.product.name}
                            </h3>
                          </div>
                          <span className="text-base font-extrabold font-money text-on-surface">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-xs text-on-surface-variant mt-1">
                          {item.selectedSize
                            ? `Size: ${item.selectedSize} • `
                            : ""}
                          {item.product.dispatchNote || "Forest Olive"}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        <div className="inline-flex items-center gap-3 bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/30">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="text-on-surface-variant hover:text-on-surface font-bold text-sm cursor-pointer px-1"
                          >
                            −
                          </button>
                          <span className="text-xs font-mono font-bold text-on-surface">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="text-on-surface-variant hover:text-on-surface font-bold text-sm cursor-pointer px-1"
                          >
                            +
                          </button>
                        </div>
                        <div className="flex items-center gap-3 text-xs">
                          <span className="text-[11px] font-semibold text-primary flex items-center gap-1">
                            <span className="material-symbols-outlined text-[14px]">
                              check_circle
                            </span>
                            Ready at Union Hub A
                          </span>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="text-outline hover:text-error transition-colors cursor-pointer"
                            title="Remove item"
                          >
                            <span className="material-symbols-outlined text-[16px]">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 2. Verified Student Discount Applied Card */}
          <div className="bg-secondary-container/30 rounded-2xl border border-primary/25 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">
                  school
                </span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-extrabold font-headline text-on-surface">
                    Verified Student ID Connected
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-primary text-on-primary text-[10px] font-bold uppercase">
                    Active
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Alex Rivera (ID #STU-882194) • 10% Student Union Co-Op Benefit
                  automatically applied.
                </p>
              </div>
            </div>
            <span className="text-sm font-mono font-extrabold text-primary shrink-0">
              -${studentDiscount.toFixed(2)} Saved
            </span>
          </div>

          {/* 3. Fulfillment Method: Smart Locker Pickup vs. Dorm Delivery */}
          <div className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-extrabold font-headline text-on-surface mb-1">
              Campus Fulfillment Method
            </h2>
            <p className="text-xs text-on-surface-variant mb-5">
              Choose automated 24/7 Smart Locker collection or residence hall
              courier delivery.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Selected Option: Smart Locker */}
              <div
                onClick={() => setFulfillmentMethod("pickup")}
                className={`p-4 rounded-2xl border-2 relative cursor-pointer transition-all ${
                  fulfillmentMethod === "pickup"
                    ? "border-primary bg-surface-container-low/60"
                    : "border-outline-variant/40 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-primary flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      lock_clock
                    </span>
                    Smart Locker Pickup
                  </span>
                  <span className="px-2 py-0.5 rounded bg-secondary-container text-on-secondary-fixed text-[10px] font-extrabold">
                    FREE
                  </span>
                </div>
                <p className="text-sm font-bold text-on-surface mb-1">
                  Student Union Hub A
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Ready in ~2 hours • Unlock with CampusHub QR Fast-Pass
                </p>
              </div>

              {/* Alternative Option: Dorm Delivery */}
              <div
                onClick={() => setFulfillmentMethod("delivery")}
                className={`p-4 rounded-2xl border-2 relative cursor-pointer transition-all ${
                  fulfillmentMethod === "delivery"
                    ? "border-primary bg-surface-container-low/60"
                    : "border-outline-variant/40 hover:border-primary/50"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px]">
                      local_shipping
                    </span>
                    Campus Dorm Delivery
                  </span>
                  <span className="text-xs font-mono font-bold text-on-surface">
                    $4.50
                  </span>
                </div>
                <p className="text-sm font-bold text-on-surface mb-1">
                  Crothers Hall • Room 314
                </p>
                <p className="text-[11px] text-on-surface-variant">
                  Next-day afternoon drop-off at residence mailroom
                </p>
              </div>
            </div>

            {fulfillmentMethod === "pickup" ? (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-on-surface text-surface flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px] text-secondary-container">
                        qr_code_2
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-widest text-outline block">
                        Selected Locker Terminal
                      </span>
                      <span className="text-xs font-bold text-on-surface">
                        {selectedLockerStation} (Reserved for 48h)
                      </span>
                    </div>
                  </div>
                  <select
                    value={selectedLockerStation}
                    onChange={(e) => setSelectedLockerStation(e.target.value)}
                    aria-label="Select Smart Locker Station"
                    className="text-xs font-bold text-primary bg-surface-container-lowest px-3 py-1.5 rounded-xl border border-outline-variant/40 focus:outline-none cursor-pointer"
                  >
                    <option value="Student Union Hub A — Compartment #B-104">
                      Union Hub A (#B-104)
                    </option>
                    <option value="Science Quad Station — Compartment #S-12">
                      Science Quad (#S-12)
                    </option>
                    <option value="North Dormitory Commons — Compartment #N-08">
                      North Dorms (#N-08)
                    </option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/30 space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-outline block">
                  Dormitory Room & Mailroom Instructions
                </label>
                <input
                  type="text"
                  value={dormAddress}
                  onChange={(e) => setDormAddress(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant/40 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
                />
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN (5 Cols): Sticky Order Summary & Payment */}
        <div className="lg:col-span-5 lg:sticky lg:top-24">
          <SpotlightCard className="bg-surface-container-lowest rounded-[2rem] border border-outline-variant/40 p-6 sm:p-8 shadow-lg">
            <h2 className="text-xl font-extrabold font-headline text-on-surface mb-6">
              Order Summary
            </h2>

            {/* Promo Code Input */}
            <form onSubmit={handleApplyPromo} className="mb-6">
              <label className="text-[11px] font-bold uppercase tracking-wider text-outline block mb-2">
                Promo or Club Grant Code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Enter code (e.g. IEEE2025)"
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant/40 text-xs text-on-surface placeholder:text-outline focus:outline-none focus:border-primary font-mono"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-xl bg-surface-container-high hover:bg-secondary-container text-on-surface font-headline font-bold text-xs transition-colors cursor-pointer"
                >
                  {promoApplied ? "Applied ✓" : "Apply"}
                </button>
              </div>
            </form>

            {/* Optional Club Micro-Grant Toggle */}
            <div className="mb-6 p-3.5 rounded-2xl bg-surface-container-low/70 border border-outline-variant/30 flex items-center justify-between gap-3">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={Boolean(campaignContribution)}
                  onChange={(e) =>
                    setCampaignContribution(
                      e.target.checked
                        ? {
                            campaignId: "camp_autonomous_ev",
                            title: "Robotics & Autonomous EV Lab Grant",
                            amount: 5.0,
                            tierTitle: "Checkout Micro-Grant",
                          }
                        : null
                    )
                  }
                  className="rounded border-outline-variant text-primary focus:ring-primary"
                />
                <span className="font-semibold text-on-surface">
                  Add $5.00 Club Seed Micro-Grant
                </span>
              </label>
              <span className="font-mono text-xs font-bold text-primary">
                +$5.00
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 pb-6 mb-6 border-b border-outline-variant/30 text-xs">
              <div className="flex justify-between text-on-surface-variant">
                <span>Merchandise Subtotal ({items.length} items)</span>
                <span className="font-money font-bold text-on-surface">
                  ${subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-primary font-semibold">
                <span className="flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">
                    verified
                  </span>
                  10% Student ID Discount
                </span>
                <span className="font-money font-bold">-${studentDiscount.toFixed(2)}</span>
              </div>
              {promoApplied && (
                <div className="flex justify-between text-primary font-semibold">
                  <span>Club Code ({promoCode.toUpperCase()})</span>
                  <span className="font-money font-bold">-$5.00</span>
                </div>
              )}
              {campaignContribution && (
                <div className="flex justify-between text-on-surface-variant">
                  <span>{campaignContribution.title}</span>
                  <span className="font-money font-bold text-on-surface">
                    +${campaignContribution.amount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-on-surface-variant">
                <span>
                  {fulfillmentMethod === "pickup"
                    ? "Smart Locker Pickup (Union Hub A)"
                    : "Campus Dorm Delivery"}
                </span>
                <span className="font-money font-bold text-primary">
                  {shipping === 0 ? "FREE" : `$${shipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-on-surface-variant">
                <span>Estimated Campus Co-Op Tax</span>
                <span className="font-money font-bold text-on-surface">
                  $0.00
                </span>
              </div>
            </div>

            {/* Total */}
            <div className="flex items-baseline justify-between mb-6">
              <div>
                <span className="text-sm font-extrabold font-headline text-on-surface block">
                  Total Due
                </span>
                <span className="text-[11px] text-outline">
                  Includes instant QR Locker Pass
                </span>
              </div>
              <span className="text-3xl font-extrabold font-money text-on-surface">
                ${finalTotal.toFixed(2)}
              </span>
            </div>

            {errorMessage && (
              <p className="text-xs text-error mb-4 font-medium">
                {errorMessage}
              </p>
            )}

            {/* Express Checkout Buttons */}
            <div className="space-y-3 mb-6">
              {/* PayPal Official Express Button */}
              <button
                type="button"
                disabled={isProcessing || items.length === 0}
                onClick={() => handleCheckout("paypal")}
                className="w-full py-3.5 px-6 rounded-xl bg-[#FFC439] hover:bg-[#f4b827] disabled:opacity-50 text-[#003087] font-headline font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  account_balance_wallet
                </span>
                <span>
                  {isProcessing
                    ? "Connecting PayPal Sandbox..."
                    : "PayPal 1-Click Checkout"}
                </span>
                <span className="text-[11px] font-medium text-[#0079C1] ml-1">
                  • Student Balance
                </span>
              </button>

              {/* Campus Card / Apple Pay Button */}
              <button
                type="button"
                disabled={isProcessing || items.length === 0}
                onClick={() => handleCheckout("student_card")}
                className="w-full py-3.5 px-6 rounded-xl bg-on-surface hover:bg-primary disabled:opacity-50 text-surface font-headline font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">
                  contactless
                </span>
                <span>Pay with Campus Bursar / Apple Pay</span>
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex py-2 items-center mb-5">
              <div className="flex-grow border-t border-outline-variant/30" />
              <span className="flex-shrink mx-3 text-[10px] font-mono uppercase tracking-widest text-outline">
                Or Card On File
              </span>
              <div className="flex-grow border-t border-outline-variant/30" />
            </div>

            {/* Saved Card Compact Row */}
            <div className="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-6 rounded bg-on-surface text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  VISA
                </div>
                <div>
                  <span className="text-xs font-bold text-on-surface block">
                     Stanford Federal Credit •••• 4829
                  </span>
                  <span className="text-[10px] text-outline">Expires 08/28</span>
                </div>
              </div>
              <span className="text-[11px] font-bold text-primary">
                Default
              </span>
            </div>

            <button
              type="button"
              disabled={isProcessing || items.length === 0}
              onClick={() => handleCheckout("paypal")}
              className="w-full py-4 px-6 rounded-xl bg-primary hover:bg-primary-container disabled:opacity-50 text-on-primary font-headline font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>
                {isProcessing
                  ? "Issuing Smart Locker Pass..."
                  : "Complete Order & Issue QR Pass"}
              </span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward
              </span>
            </button>

            {/* Security Footer */}
            <div className="mt-5 pt-4 border-t border-outline-variant/25 flex items-center justify-center gap-4 text-[11px] text-outline">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  verified_user
                </span>
                256-Bit Encrypted
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-primary">
                  autorenew
                </span>
                Free 30-Day Locker Returns
              </span>
            </div>
          </SpotlightCard>
        </div>
      </div>
    </main>
  );
}
