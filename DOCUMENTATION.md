# 📚 SchoolSupplies POS - Technical Documentation

Comprehensive technical documentation for developers working on the SchoolSupplies POS system.

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Code Structure](#code-structure)
3. [Authentication & Middleware](#authentication--middleware)
4. [Data Flow](#data-flow)
5. [Component Documentation](#component-documentation)
6. [Supabase Integration](#supabase-integration)
7. [Styling & UI](#styling--ui)
8. [Development Guidelines](#development-guidelines)
9. [Common Tasks](#common-tasks)

---

## Architecture Overview

### MVC-like Pattern
- **Model**: Supabase database (PostgreSQL)
- **View**: React components with Tailwind CSS
- **Controller**: Next.js server components & API routes

### Key Principles
- Client-side rendering for interactive pages
- Real-time data fetching using Supabase client
- Middleware-based route protection
- Role-based access control (RBAC)

---

## Code Structure

### `/app` - Next.js App Router
```
app/
├── (auth)/                          # Auth group - no sidebar
│   ├── layout.tsx                  # Auth layout wrapper
│   └── login/
│       ├── page.tsx                # Login page
│       └── login-content.tsx        # Login form component
│
├── (dashboard)/                     # Dashboard group - with sidebar
│   ├── layout.tsx                  # Dashboard layout (Sidebar + main)
│   ├── dashboard/page.tsx          # Admin dashboard
│   ├── pos/page.tsx                # POS register
│   ├── inventory/page.tsx          # Inventory management
│   ├── suppliers/page.tsx          # Supplier management
│   ├── purchase-orders/page.tsx    # Purchase order tracking
│   ├── transactions/page.tsx       # Transaction history
│   └── reports/page.tsx            # Analytics & reports
│
├── globals.css                      # Global Tailwind styles
├── layout.tsx                       # Root layout (auth provider)
└── page.tsx                         # Landing page (redirects to /login)
```

### `/components`
```
components/
└── Sidebar.tsx                      # Main navigation component
    - Dynamic links based on user role (with Lucide icons)
    - User info display
    - Role badge (Admin/Cashier)
    - Authentication & logout handling
```

### `/lib` - Utilities & Contexts
```
lib/
├── auth-context.tsx                 # AuthContext provider
│   - useAuth() hook
│   - User session management
│
└── supabase/
    ├── client.ts                   # Client-side Supabase instance
    ├── auth.ts                     # Auth utilities
    └── database.ts                 # Database utilities
```

### `/src`
```
src/
└── middleware.ts                    # Route protection middleware
    - Session validation
    - Role-based redirects
    - Route access control
```

---

## Authentication & Middleware

### Middleware Flow (`src/middleware.ts`)

```
Request → Middleware
  ↓
Check Auth Session
  ↓
  ├─ No Session → Redirect to /login
  └─ Session Exists
      ↓
      Fetch User Role from profiles table
      ↓
      ├─ Admin → Allow access
      └─ Cashier
          ├─ Accessing /pos → Allow
          └─ Accessing /dashboard, /inventory, /reports, /transactions → Redirect to /pos
```

### Protected Routes
- `/dashboard` - Admin only
- `/inventory` - Admin only
- `/suppliers` - Admin only
- `/purchase-orders` - Admin only
- `/transactions` - Admin only
- `/reports` - Admin only
- `/pos` - Cashier & Admin
- `/login` - Unauthenticated only

### Session Storage
- Stored in HTTP-only cookies (via `@supabase/ssr`)
- Validated on every request
- Automatically refreshed via Supabase

---

## Data Flow

### POS Checkout Flow

```
User adds items to cart
  ↓
Input tendered amount
  ↓
Submit checkout
  ↓
Validation
  ├─ Tendered >= Total? 
  └─ Stock available?
  ↓
Supabase Transaction (atomic)
  ├─ Insert into transactions table
  ├─ Insert into transaction_items table
  ├─ Update products.stock_quantity
  └─ Commit or rollback
  ↓
Show success message with change amount
↓
Clear cart & refresh
```

### Real-time Data Fetching Pattern

```typescript
useEffect(() => {
  fetchData();
}, []);

const fetchData = async () => {
  const supabase = createClient();
  const { data } = await supabase
    .from("table_name")
    .select("*, relations(*)");
  setData(data);
};
```

---

## Component Documentation

### Sidebar Component (`components/Sidebar.tsx`)

**Purpose**: Main navigation and user info display

**Props**: None (uses `useAuth()` hook)

**Key Features**:
- Dynamic link rendering based on user role
- User email & role badge display
- Lucide React icons for all navigation items
- Gradient background styling (slate-900 to slate-800)
- Fixed positioning (w-64)
- Responsive on mobile
- Active link highlighting with blue background

**Icons Used**:
- POS Register: `ShoppingCart`
- Dashboard: `LayoutDashboard`
- Inventory: `Package`
- Suppliers: `Truck`
- Purchase Orders: `ClipboardList`
- Transactions: `CreditCard`
- Reports: `BarChart3`
- Brand Logo: `Store`
- Logout: `LogOut`

**Usage**:
```tsx
<Sidebar /> // In dashboard layout
```

**Key State**:
- User info from `useAuth()`
- User role from profiles table
- Current pathname from `usePathname()`

### Login Page (`app/(auth)/login/login-content.tsx`)

**Purpose**: User authentication interface

**Key Features**:
- Email and password input fields with Tailwind styling
- Password visibility toggle using Lucide icons (`Eye` / `EyeOff`)
- "Remember me" checkbox with localStorage persistence
- Email auto-load on mount if previously saved
- Error and success message display
- Loading state during authentication
- Responsive single-column card design
- Brand logo using `ShoppingBag` icon

**Icons Used**:
- Brand Logo: `ShoppingBag`
- Show Password: `Eye`
- Hide Password: `EyeOff`

**Key Features**:
- Form validation (email and password required)
- Secure password handling with visibility toggle
- Remember me functionality saves email to localStorage
- Automatic redirect based on user role
- Success notification for newly registered accounts

**Data Flow**:
```
User inputs credentials
  ↓
Validation check
  ↓
signIn() async call
  ↓
getRedirectPathByRole() determines destination
  ↓
Redirect to admin dashboard or POS
```

---

## Supabase Integration

### Client Initialization

```typescript
// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
```

### Common Queries

**Fetch Products**:
```typescript
const { data } = await supabase
  .from("products")
  .select("*, categories(name)")
```

**Insert Transaction**:
```typescript
const { data, error } = await supabase
  .from("transactions")
  .insert({ total_amount, amount_tendered, change_amount })
  .select()
```

**Update Stock**:
```typescript
const { error } = await supabase
  .from("products")
  .update({ stock_quantity: newStock })
  .eq("id", productId)
```

### Relationships
- `products.category_id` → `categories.id`
- `transactions.id` → `transaction_items.transaction_id`
- `products.id` → `transaction_items.product_id`

**Fetching with Relationships**:
```typescript
// Include category info
select("*, categories(name)")

// Include transaction items
select("*, transaction_items(*)")
```

---

## Styling & UI

### Tailwind Configuration
- Custom color scheme: Blue, Violet, Emerald, Orange
- Rounded-2xl for all major elements
- Consistent spacing (p-6, gap-4, etc.)

### Design System

**Color Tokens**:
- Primary: Blue (`#3b82f6`)
- Secondary: Violet (`#a78bfa`)
- Success: Emerald (`#10b981`)
- Warning: Orange (`#f97316`)
- Neutral: Gray (`#6b7280`)

**Card Styling**:
```tsx
<div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
  {/* content */}
</div>
```

**Button Styling**:
```tsx
<button className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700">
  Action
</button>
```

**Layout**:
- Main container: `max-w-7xl mx-auto`
- Sidebar width: `w-64` (fixed)
- Main content margin: `ml-64`
- Grid: `grid-cols-1 lg:grid-cols-4` (responsive)

---

## Development Guidelines

### Code Style
- Use TypeScript strictly (`"strict": true`)
- Component names: PascalCase
- Filenames: lowercase or kebab-case (except components)
- Hooks: camelCase, prefix with `use`

### Component Structure
```typescript
"use client"; // Add if using hooks/state

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PageName() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const supabase = createClient();
    // fetch logic
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* JSX */}
    </div>
  );
}
```

### Error Handling
```typescript
try {
  // operation
} catch (error) {
  console.error("Error:", error);
  alert("Error message: " + error.message);
  // recovery logic
}
```

### State Management
- Use `useState` for local state
- Use `useContext` for global auth state
- No external state management (Redux, Zustand)

### Naming Conventions
- Boolean variables: `isLoading`, `hasError`, `canDelete`
- Data arrays: `transactions`, `products`, `categories`
- Handlers: `handleClick`, `handleSubmit`, `handleChange`
- Fetchers: `fetchData`, `fetchProducts`, `fetchTransactions`

---

## Common Tasks

### Add a New Page

1. **Create the page file**:
   ```typescript
   // app/(dashboard)/new-page/page.tsx
   "use client";
   export default function NewPage() {
     return <div className="p-8">Page content</div>;
   }
   ```

2. **Add to Sidebar** (`components/Sidebar.tsx`):
   - Import icon from `lucide-react`:
   ```tsx
   import { MyIcon } from "lucide-react";
   ```
   - Add to `adminLinks` array:
   ```tsx
   { href: "/new-page", label: "New Page", icon: MyIcon }
   ```

3. **Protect route** (auto-protected if in `/dashboard` group)

### Add Database Query

```typescript
const { data, error } = await supabase
  .from("table_name")
  .select("*")
  .eq("id", value);

if (error) {
  console.error("Database error:", error);
  return;
}
```

### Update Styling

1. **Use existing Tailwind classes** (from design system)
2. **Follow spacing patterns** (gap-4, p-6, etc.)
3. **Test on mobile** (responsive classes: `md:`, `lg:`)

### Handle Errors

```typescript
try {
  const result = await operation();
} catch (error) {
  // Log for debugging
  console.error("Operation failed:", JSON.stringify(error));
  
  // Show user-friendly message
  setError(`Failed to complete action: ${error.message}`);
  
  // Recovery
  setLoading(false);
}
```

### Add New Role

1. **Update profiles schema** (if needed)
2. **Update middleware** (`src/middleware.ts`)
3. **Update Sidebar** with role-specific links
4. **Add page-level auth checks** (optional)

---

## Debugging

### Enable Verbose Logging
```typescript
const { data, error } = await supabase.from("table").select("*");
if (error) console.error("Supabase error:", JSON.stringify(error, null, 2));
```

### Check Session
```typescript
const auth = useAuth();
console.log("Current user:", auth.user);
```

### Database Queries
- Test queries in Supabase dashboard SQL editor
- Check Row Level Security (RLS) policies
- Verify table permissions

### Build Issues
```bash
npm run build       # Full build check
rm -rf .next        # Clear cache
npm run dev         # Fresh start
```

---

## Performance Tips

1. **Memoize expensive components**:
   ```typescript
   const MemoComponent = React.memo(Component);
   ```

2. **Limit Supabase queries**:
   - Use `.limit(10)` for large datasets
   - Filter server-side when possible
   - Avoid n+1 queries (use relations)

3. **Optimize images**:
   - Use Next.js `Image` component
   - Lazy load when possible

4. **Code splitting**:
   - Dynamic imports for heavy modals
   - Lazy load routes

---

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

**Last Updated**: April 21, 2026
**Maintained By**: Development Team
