# Turf Booking Web App — Multi-Step Auth & Role-Based Management System

A production-ready full-stack Turf Booking application built with **React**, **Express (Node.js)**, **Tailwind CSS**, and **Firebase Auth / Phone OTP**. Features multi-step role-based onboarding (Customer vs. Turf Owner), venue image upload validation, rate-limited phone OTP authentication, and administrator approval workflows with strict security rules prohibiting public admin signup.

---

## 🌟 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: Express.js (Node.js), JSON/Memory Data Store with file persistence
- **Authentication**: Firebase Auth (Google OAuth + Phone OTP), JWT with `httpOnly` cookie & `Authorization: Bearer` support
- **Security**: Strict Admin Signup Protection, OTP Rate Limiting (max 3/10 min), Role & Approval Verification Middlewares

---

## 📋 Multi-Step Signup Flow

### Step 1: Role Selection Screen
- **Two Visual Cards**:
  - **"I'm a Customer"**: Search nearby grounds, book slots, join matches, and earn rewards.
  - **"I'm a Turf Owner"**: List sports venues, configure hourly rates & surge pricing, and manage slot schedules.
- Selected role passes to Step 2.

### Step 2: Authentication Method
- **Google OAuth**: Captures Google-verified name, email, and avatar profile photo.
- **Phone Number OTP**:
  - Country code dropdown (`+91`, `+1`, `+44`, etc.) + mobile input.
  - Server-side rate limiting (maximum 3 OTP requests per 10 minutes per phone number).
  - 6-digit OTP code entry with 30s resend timer cooldown.
- **Role Redirection**:
  - **Customer**: Authenticates immediately and redirects to Customer Dashboard (`/dashboard/customer`).
  - **Turf Owner**: Authenticates and proceeds to Step 3.

### Step 3: Venue Details (Turf Owner Only)
- **Turf / Business Name**: Text input
- **Full Location Address**: Street address, locality, city, and GPS coordinates (latitude/longitude)
- **Sports Offered**: Multi-select pills (`Football`, `Cricket`, `Box Cricket`, `Badminton`, `Tennis`, `Volleyball`)
- **Hourly Pricing**: Price per hour (₹)
- **Turf Photos**: File uploader accepting images (min 1, max 5) with live preview and base64 encoding validation.
- **Status On Submit**: Creates turf with `is_approved = false` and `status = "pending review"`.

### Step 4: Completion Screen
- **Customer**: Direct redirect after authentication.
- **Owner**: Displays *"Your turf registration is under review, we'll notify you once approved"* banner and redirects to the Owner Dashboard in limited view.

---

## 🔒 Security & Admin Policy

1. **NO Public Admin Signup**: Public endpoints (`/auth/google`, `/auth/phone/verify-otp`, `/auth/register`) strictly reject any attempt to register `role = 'admin'` with `403 Forbidden`. Platform admins are pre-provisioned or created via internal system console.
2. **Owner Approval Guard**: Owner endpoints for publishing live slots or modifying turf grounds check `role === 'owner'` AND `is_approved === true`. Unapproved owners see a persistent yellow **"Pending Administrator Approval"** banner.
3. **JWT Authentication**: Issued upon authentication containing `{ id, email, phone, role, is_approved }`. Supported via `httpOnly` cookies and `Authorization: Bearer <token>` headers.
4. **OTP Rate Limiting**: Maximum 3 OTP requests per 10-minute window per phone number.

---

## 🗄️ Database Schema

### `users` Collection / Store
```ts
interface User {
  id: string;
  fullname: string;
  email: string;
  phone: string;
  role: 'customer' | 'owner' | 'admin';
  authProvider?: 'google' | 'phone' | 'email';
  avatarUrl?: string;
  is_approved?: boolean; // false for pending owners, true for customers/admins
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
}
```

### `turfs` Collection / Store
```ts
interface Turf {
  id: string;
  owner_id: string;
  owner_name?: string;
  name: string;
  description: string;
  location: string;
  city: string;
  area: string;
  latitude: number;
  longitude: number;
  price_per_hour: number;
  weekend_price_per_hour?: number;
  sport_types: SportType[];
  images: string[]; // min 1, max 5 image URLs or base64 data
  rating: number;
  reviews_count: number;
  amenities: string[];
  is_approved?: boolean; // false until approved by platform admin
  status: 'active' | 'pending' | 'rejected';
  created_at: string;
}
```

---

## 🚀 REST API Endpoints

| Method | Endpoint | Auth | Description |
| text | text | text | text |
| `POST` | `/api/auth/google` | Public | Authenticates via Google OAuth payload. Rejects `role = 'admin'`. |
| `POST` | `/api/auth/phone/send-otp` | Public | Rate-limited OTP generator (max 3/10 min). |
| `POST` | `/api/auth/phone/verify-otp` | Public | Verifies 6-digit OTP code, sets JWT cookie. |
| `POST` | `/api/auth/complete-owner-profile` | JWT (`verifyJWT`) | Submits owner business fields, creates pending turf record. |
| `GET` | `/api/turfs` | Public | Lists active turfs. |
| `POST` | `/api/turfs` | JWT + `checkApprovedOwner` | Creates turf ground (requires approved owner status). |
| `PUT` | `/api/admin/turfs/:id/approve` | JWT + Admin | Approves pending turf and owner account. |

---

## 🛠️ Setup Instructions

### 1. Clone & Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="your-gemini-key"
APP_URL="http://localhost:3000"
JWT_SECRET="super-secret-jwt-key-turfhub-2026"
PORT=3000
```

### 3. Run Development Server
```bash
npm run dev
```

App will run on `http://localhost:3000`.
