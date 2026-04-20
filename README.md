# 🏪 SchoolSupplies POS System

A modern, full-featured Point-of-Sale (POS) system built for school supply stores. Built with Next.js, Supabase, and Tailwind CSS.

## ✨ Features

### 🛒 **POS Register**
- Real-time inventory management
- Split-layout design (products left, cart right)
- Category filtering & search
- Quantity tracking with stock validation
- Checkout with change calculation
- Transaction history

### 📊 **Dashboard**
- Today's sales analytics
- Product statistics
- Low stock alerts
- Quick action buttons
- Transaction overview

### 📦 **Inventory Management**
- Product CRUD operations
- Stock level tracking
- Category organization
- Low stock indicators (< 10 units)
- Bulk actions

### 🧾 **Transactions**
- Complete transaction history
- Advanced search & filtering
- 4-card analytics (total revenue, count, today's revenue, average transaction)
- Formatted date/time display (Philippine locale)
- Transaction details with items count

### 📈 **Reports & Analytics**
- All-time statistics
- Top 5 products by units sold
- Recent transactions (last 5)
- Revenue trends
- Performance metrics

### 🔐 **Security**
- Role-based access control (Admin/Cashier)
- Supabase authentication with JWT
- Middleware-protected routes
- Automatic role-based redirects

## 🛠️ Tech Stack

- **Frontend**: Next.js 15.3.8 (App Router) + TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v3
- **State Management**: React Hooks
- **Deployment**: Vercel

## 📋 Project Structure

```
schoolsupplies/
├── app/
│   ├── (auth)/                 # Authentication routes
│   │   └── login/
│   ├── (dashboard)/            # Protected dashboard routes
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   ├── pos/
│   │   ├── inventory/
│   │   ├── transactions/
│   │   └── reports/
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   └── Sidebar.tsx             # Main navigation
├── lib/
│   ├── auth-context.tsx        # Auth provider
│   └── supabase/
│       ├── auth.ts
│       ├── client.ts
│       └── database.ts
├── public/
├── src/
│   └── middleware.ts           # Route protection
├── package.json
├── tsconfig.json
├── next.config.ts
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- Vercel account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/ManoyJoseph/Schoolsupplies.git
cd schoolsupplies
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Initialize Supabase database**
Run the `database.sql` file in your Supabase SQL editor to create tables and schema.

5. **Start the development server**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 Authentication & Roles

### User Roles
- **Admin**: Full access to all pages (Dashboard, Inventory, Transactions, Reports)
- **Cashier**: Limited to POS Register only

### Login Flow
1. User navigates to `/login`
2. Enters email/password
3. System verifies credentials via Supabase
4. Role is fetched from `profiles` table
5. User is redirected based on role:
   - Admin → Dashboard
   - Cashier → POS Register

## 📱 Pages Overview

### **Login** (`/login`)
- Email/password authentication
- Role-based redirects
- Session management

### **Dashboard** (`/dashboard`)
- **Today's Stats**: Revenue and transaction count
- **Quick Actions**: Links to POS, Inventory, Transactions, Reports
- **Metrics**: Product count, low stock alerts
- **Admin Only**

### **POS Register** (`/pos`)
- Live product grid with search & category filter
- Shopping cart with real-time calculations
- Checkout with tendered amount & change
- Stock validation
- Error handling with detailed messages

### **Inventory** (`/inventory`)
- Product listing with search & category filtering
- Add/Edit/Delete products
- Stock tracking
- Low stock indicators
- Category management

### **Transactions** (`/transactions`)
- Complete transaction history
- Search by transaction ID
- 4-card analytics dashboard
- Formatted date/time display
- Items count per transaction

### **Reports** (`/reports`)
- **Today's Analytics**: Revenue & transaction count
- **All-Time Stats**: Total revenue, transactions, items sold, average transaction value
- **Top Products**: Medal-ranked (🥇🥈🥉) top 5 by units sold
- **Recent Transactions**: Last 5 transactions with details

## 🗄️ Database Schema

### Products
- `id`, `name`, `price`, `stock_quantity`, `category_id`, `description`

### Categories
- `id`, `name`, `description`

### Transactions
- `id`, `total_amount`, `amount_tendered`, `change_amount`, `created_at`

### Transaction Items
- `id`, `transaction_id`, `product_id`, `quantity`, `subtotal`, `product_name`

### Profiles
- `id`, `email`, `role` (admin/cashier)

## 🔒 Route Protection

Routing is enforced via middleware (`src/middleware.ts`):
- Unauthenticated users → redirected to `/login`
- Cashiers → blocked from accessing admin pages
- Logged-in users on `/login` → redirected to dashboard based on role

## 🚢 Deployment

### Deploy to Vercel

1. **Commit your changes**
```bash
git add -A
git commit -m "Your commit message"
git push origin main
```

2. **Vercel Auto-Deploy**
   - Vercel automatically detects the push
   - Builds and deploys your changes
   - Monitor progress in [Vercel Dashboard](https://vercel.com)

3. **Environment Variables**
   - Add `.env.local` variables to Vercel project settings
   - Settings → Environment Variables

### Build Command
```bash
npm run build
```

### Start Command
```bash
npm start
```

## 🧪 Testing Locally

### Create Test Accounts
1. Go to Supabase → Authentication
2. Create test user (Admin):
   - Email: `admin@test.com`
   - Password: `test123456`
   - Add profile: role = `admin`

3. Create test user (Cashier):
   - Email: `cashier@test.com`
   - Password: `test123456`
   - Add profile: role = `cashier`

### Add Sample Data
Insert sample products & categories via Supabase SQL:
```sql
INSERT INTO categories (name, description) VALUES ('Notebooks', 'Writing books');
INSERT INTO products (name, price, stock_quantity, category_id) 
VALUES ('Math Notebook', 50.00, 25, 1);
```

## 🐛 Troubleshooting

### Build Fails
```bash
rm -rf .next
npm run build
```

### Supabase Connection Issues
- Verify URL and keys in `.env.local`
- Check Supabase project is running
- Ensure database tables exist (run `database.sql`)

### Stock Quantity Errors
- Ensure database field is `stock_quantity` (not `stock`)
- This applies to POS inventory management

### Middleware Not Protecting Routes
- Check `src/middleware.ts` exists
- Verify `.env.local` has Supabase credentials
- Restart dev server: `npm run dev`

## 📞 Support

For issues or questions:
- Check Supabase documentation: https://supabase.com/docs
- Next.js docs: https://nextjs.org/docs
- GitHub Issues: [Your Repo Issues]

## 📄 License

This project is licensed under the MIT License.
