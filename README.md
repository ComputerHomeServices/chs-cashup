# CashUp Pro

A premium cash management application for retail stores, built with React, Vite, Tailwind CSS v4, and Supabase.

## 🚀 Features

- **Store Dashboard**: Visual overview of sales and accuracy.
- **Cashup Multi-Denomination Entry**: Input for 11 currency denominations with real-time totals.
- **Variance Tracking**: Automatically match actual totals against system expectations.
- **Secure Auth**: Row-level security (RLS) ensuring data privacy.
- **Mobile Responsive**: Designed to work on tablets and smartphones during shift changes.

## 🛠️ Setup

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Configuration**:
   The project is pre-configured with the Supabase credentials you provided in `.env`.

3. **Database Schema**:
   The database schema has already been applied to your Supabase project.

4. **Run Development Server**:
   ```bash
   npm run dev
   ```

## 🏗️ Architecture

- `/src/components`: Reusable UI components (SummaryCard, DenominationInput, etc.).
- `/src/pages`: Main application screens (Dashboard, New Cashup, History).
- `/src/hooks`: Custom hooks for Auth and Data fetching.
- `/src/lib`: Supabase client and utility functions.
- `/supabase/migrations`: Database schema versions.

## 🔑 Permissions

The application uses Supabase Auth. Every user can see and manage their own cashup records. Users with the `role: 'admin'` metadata in `auth.users` can view records for all users.
