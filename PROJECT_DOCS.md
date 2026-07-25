# KOK Books Admin Dashboard

## Overview
Admin dashboard for managing the KOK Books e-commerce platform. Built with React 19, TanStack Start, and Redux Toolkit.

## Tech Stack
- **Framework**: React 19
- **Routing**: TanStack Start
- **State Management**: Redux Toolkit
- **UI**: Radix UI components + Tailwind CSS
- **Build**: Vite
- **Language**: TypeScript

## Project Structure
```
src/
├── components/     # Admin UI components
├── hooks/          # Custom React hooks
├── lib/            # Utilities, auth, axios config
├── mock/           # Mock data for development
├── routes/         # Page components (file-based routing under _admin)
├── services/       # API service layers for all modules
└── store/          # Redux slices configuration
```

## Key Modules/Pages
- **Dashboard**: Order analytics, product analytics
- **Books**: Book management, bulk upload, bulk update
- **Catalog**: Authors, categories, genres, publishers, languages, formats, series, subjects, etc.
- **Orders**: Order management, processing, cancellations, returns, exchanges
- **Customers**: Customer management, reviews, wishlists, tickets
- **Shipping**: Shipments, AWB, couriers, tracking, NDR, pickup rules
- **Payments**: Transactions, refunds, COD
- **Inventory**: Stock management, warehouses, barcode
- **Marketing**: Coupons
- **Settings**: Store, company, shipping, payments, email, SMS, GST, theme
- **Integrations**: Payment gateways, couriers, SMS, email, analytics, webhooks
- **Reports**: Sales, revenue, inventory reports
- **Schools**: School and class management
- **Users**: Staff management, designations, permissions, menus
- **CMS**: Banners, blog, FAQ
- **Locale**: Countries, states, cities, currencies, languages, timezones

## Setup
```bash
npm install
npm run dev        # Development
npm run build      # Production build
npm run lint       # Lint and fix
npm run format     # Format code
```

## Environment
Check `.env` file for API configuration.