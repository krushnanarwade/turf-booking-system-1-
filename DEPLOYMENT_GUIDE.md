# 🚀 Turf Booking System - Production Deployment & Firebase Guide

This guide provides step-by-step instructions for deploying the Turf Booking System to production platforms (such as **Render**, **Vercel**, **Cloud Run**, or custom domains) and configuring **Firebase Authentication** and **Firestore Security Rules** properly.

---

## 🔑 Critical Requirement: Adding Authorized Domains in Firebase

When deploying your web application to production (e.g., `https://your-app-name.onrender.com`), Firebase Authentication will reject sign-in attempts (Google OAuth popup, Phone OTP reCAPTCHA) with the error:

```text
auth/unauthorized-domain: This domain is not authorized for OAuth operations for your Firebase project.
```

### 📋 Step-by-Step Instructions to Authorize Production Domains

1. **Open Firebase Console**:
   Navigate to [https://console.firebase.google.com/](https://console.firebase.google.com/).

2. **Select Project**:
   Select your project: **`ai-studio-turfbookingsyste-9f79168c-0877-4eb3-bf32-305a4320aa7b`** (or your custom Firebase project).

3. **Navigate to Authentication Settings**:
   - In the left menu, click **Build** -> **Authentication**.
   - Click on the **Settings** tab at the top of the page.
   - Select **Authorized domains** from the left sub-navigation.

4. **Add Your Production Domain**:
   - Click the **Add domain** button.
   - Enter your deployed domain name **without** `https://` or trailing slashes.
     - Example for Render: `turf-booking-system.onrender.com`
     - Example for custom domain: `booking.yourdomain.com`
     - Example for Vercel: `turf-booking-system.vercel.app`
   - Click **Save**.

5. **Verify Configuration**:
   - Both `localhost` and sandbox preview URLs (`*.run.app`) are pre-authorized by default.
   - Once saved, your production users will be able to sign in via Google OAuth and verify Phone OTPs seamlessly without unauthorized domain errors.

---

## 🔥 Firebase Authentication Setup

Ensure that the required sign-in providers are enabled in Firebase Console:

1. In Firebase Console, go to **Authentication** -> **Sign-in method**.
2. **Google Sign-In**:
   - Click **Google** -> Click **Enable**.
   - Select project support email and click **Save**.
3. **Phone Number Sign-In**:
   - Click **Phone** -> Click **Enable**.
   - (Optional) Add test phone numbers and verification codes for automated testing.
   - Click **Save**.

---

## 🛡️ Firestore Security Rules Deployment

To enforce database access controls in production, deploy the `firestore.rules` file included in this repository.

### Rules Overview
- **Users Collection (`/users/{userId}`)**: Users can read/write only their own user profile.
- **Turfs Collection (`/turfs/{turfId}`)**: Publicly readable for active grounds; write access restricted to verified turf owners and platform admins.
- **Bookings Collection (`/bookings/{bookingId}`)**: Customers can access their own bookings; turf owners can view bookings for their grounds.

### Deploying Rules via Firebase CLI
```bash
# Install Firebase CLI if not installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy rules to your project
firebase deploy --only firestore:rules
```

---

## 🌐 Deploying Server to Render

1. **Build Command**: `npm run build`
2. **Start Command**: `npm start` (or `node dist/server.cjs`)
3. **Environment Variables**:
   Ensure the following environment variables are configured in your host settings:
   - `NODE_ENV=production`
   - `PORT=3000` (or host default)

---

## 🛠️ Summary Checklist Before Launch

- [ ] Repository pushed to GitHub main branch
- [ ] Build passes locally (`npm run build`)
- [ ] Production domain added under **Firebase Console -> Authentication -> Settings -> Authorized domains**
- [ ] Google & Phone Auth enabled in Firebase Console
- [ ] Firestore Security Rules deployed (`firebase deploy --only firestore:rules`)
