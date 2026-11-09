---
name: CampusHub 2.0 — Campus Commerce & Event Management Design System
colors:
  surface: '#f8fafb'
  surface-dim: '#d8dadb'
  surface-bright: '#f8fafb'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f5'
  surface-container: '#eceeef'
  surface-container-high: '#e6e8e9'
  surface-container-highest: '#e1e3e4'
  on-surface: '#191c1d'
  on-surface-variant: '#43474d'
  outline: '#74777e'
  outline-variant: '#c4c6ce'
  primary: '#00162e'
  on-primary: '#ffffff'
  primary-container: '#142b45'
  on-primary-container: '#7d93b2'
   primary-fixed: '#d3e4ff'
  secondary: '#006a66'
  on-secondary: '#ffffff'
  secondary-container: '#7ef6ee'
  on-secondary-container: '#00312e'
  tertiary: '#006a5e'
  tertiary-container: '#00311f'
  on-tertiary-container: '#00a572'
  tertiary-fixed: '#6ffbbe'
  error: '#ba1a1a'
  error-container: '#ffdad6'
  warning: '#9a6b00'
  warning-container: '#fff0c2'
  success: '#00a572'
  success-container: '#ccffe9'
typography:
  display-lg:
    fontFamily: Geist
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.03em
  display:
    fontFamily: Geist
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Geist
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Geist
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Geist
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Geist
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
  label-md:
    fontFamily: Geist
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Geist
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-xs: 4px
  space-sm: 8px
  space-md: 16px
  space-lg: 24px
  space-xl: 32px
---

# CampusHub 2.0 Design System (`DESIGN.md`)

## 1. Brand & Aesthetic Direction
CampusHub 2.0 blends **Modern Editorial Campus Commerce** with **Enterprise-Grade SaaS Operations**. It serves two core audiences within one unified design language:
1. **Student Storefront & Event Discovery (`/demo`)**: High-trust collegiate marketplace for event passes, society merchandise, and instant PayPal guest checkout.
2. **Organizer & Bursary Workspace (`/dashboard/*`)**: High-density operational console for event scheduling, gate check-ins, SKU inventory, order fulfillment, PayPal webhook reconciliation, and grounded AI analytics.

### Dual-Theme Polarity
- **Light Mode ("Collegiate")**: Deep Navy (`#00162E` / `#142B45`) structural anchors and Active Teal (`#006A66`) accents over luminous Cloud canvases (`#F8FAFB`) and Pure White (`#FFFFFF`) elevated cards.
- **Dark Mode ("Nocturne Collegiate")**: Deep Obsidian/Slate canvases (`#070D18` / `#0B1326`) with elevated navy containers (`#171F33`) and luminous Aqua/Teal (`#57F1DB` / `#2DD4BF`) interactive highlights.

---

## 2. Typography & Numerical Hierarchy
- **Primary Typeface (`Geist`)**: Used across all headings, body copy, navigation, Bryntum timeline tracks, and AG Grid cells.
  - **Display & Headlines**: Negative letter-spacing (`-0.03em` to `-0.015em`) for authoritative lockups.
  - **Sentence Case**: All section titles and card headers use natural sentence/title casing; uppercase is reserved strictly for micro-eyebrows and column headers (`11px`, `tracking-wider`).
- **Monospace Typeface (`Geist Mono`)**: Used for SKUs (`TS-TEE-NVY`), order numbers (`CH-1040`), PayPal capture references (`DEMO-CAP-40`), keyboard shortcuts (`⌘K`), and SQL/env tokens.
- **Tabular Numerals (`tabular-nums`)**: Mandatory on all currency values (`RM 4,860.00`), KPI counters, capacity ratios (`142 / 500`), percentages, and dates to prevent horizontal jitter.

---

## 3. Technology Role Separation: Bryntum vs. AG Grid

### 3.1 Bryntum Scheduler (`@bryntum/scheduler-community`)
Used exclusively for **temporal scheduling, venue timeline management, and calendar views**:
- **Custom CampusHub Control Bar**: Integrated React toolbar featuring date range navigation (`Prev`, `Today`, `Next`), view preset switcher (`Day`, `Week`, `Multi-Week`, `Semester`), resource grouping switcher (`By Campus Venue` vs. `By Event Initiative`), orientation switcher (`Horizontal Timeline` vs. `Vertical Calendar`), search filter, status filter pills, and zoom controls.
- **Resource Track Cards**: Left subgrid renders structured venue/initiative cards with Material Symbols icon tiles, building metadata, capacity badges, and live utilization progress bars.
- **Custom Event Cards (`eventRenderer`)**: Multi-line cards styled per status (`published` Emerald/Teal, `draft` Amber, `completed` Navy/Slate, `cancelled` Crimson) displaying status dot, title, time window, venue pill, and live ticket sell-through bar.
- **Interactive Workflows**: Drag-and-drop rescheduling, duration resizing, drag-to-create slot selection, rich HTML tooltips, and native CampusHub Event Inspector / Modal handoff.

### 3.2 AG Grid Community (`ag-grid-community` / `ag-grid-react`)
Used exclusively for **structured tabular data management and transactional ledgers** across:
1. **Events Ledger (`/dashboard/events`)**
2. **Registrations & Check-In Roster (`/dashboard/registrations`)**
3. **Products & SKU Catalog (`/dashboard/products`)**
4. **Orders & Fulfillment Queue (`/dashboard/orders`)**
5. **Transactions & Webhook Reconciliation (`/dashboard/transactions`)**
6. **Organization Members & Roles (`/dashboard/members`, `/dashboard/settings`)**

- **Unified CampusHub DataGrid Chrome**:
  - Built-in toolbar with instant `quickFilterText` search, semantic status/category filter pills with live row counts, row density toggle (`Comfortable 54px` / `Compact 42px`), and one-click CSV export.
  - Refined `11px` uppercase column headers on `var(--st-surface-low)` with `1px` structural hairline borders and `tabular-nums` right-aligned financial columns.
