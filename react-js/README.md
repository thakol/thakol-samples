# React JS OIDC Sample

This directory contains a modern React 18 Single Page Application (SPA) demonstrating integration with Thakol.io.

It implements a reusable `AuthProvider` component and a custom `useAuth` hook wrapping the official community [`oidc-client-ts`](https://github.com/authts/oidc-client-ts) library. It implements the secure **Authorization Code Flow with PKCE**.

---

## 📁 File Structure

* `src/context/AuthContext.jsx` — React Context holding OIDC `UserManager` instance, active session state (`user`, `loading`, `isAuthenticated`), and callback handshakes.
* `src/App.jsx` — Clean rendering of dynamic login forms, developer parameters config panel, and glowing glassmorphic profiles.
* `src/index.css` — Modern dark theme styling matching the Thakol.io dashboard branding.
* `vite.config.js` — Vite setup to host the React application locally on port `3002`.

---

## ⚡ How to Setup & Run

### Step 1: Install Dependencies
Run npm install from this directory:
```bash
npm install
```

### Step 2: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client (e.g. `default-client`) has:
* **Redirect URI:** `http://localhost:3002`
* **Web Origins (CORS):** `http://localhost:3002` or `*`

### Step 3: Run the Development Server
Launch the React dev app:
```bash
npm run dev
```
Open `http://localhost:3002` in your browser.

### Step 4: Sign In
1. Input your workspace **Realm / Authority URL** (e.g. `https://auth.thakol.io/realms/your-realm`).
2. Input your **Client ID** (e.g. `default-client`).
3. Click **Sign In with Thakol** to redirect to the secure authentication core and return to inspect claims!


## Email OTP and email links

This sample's existing OIDC login also supports the hosted email-code and email-link methods.
Enable them in the workspace's Advanced → Sign-In Methods settings; no new token endpoint or
client secret in the browser is needed. Open links in the original browser/profile (and original
sign-in tab if your app stores state per tab), then confirm sign-in. Keep callback state and
PKCE validation. For signup, enable the selected method's signup permission plus self-registration.

Follow [the shared acceptance checklist](../PASSWORDLESS.md) and check the
[current roadmap](https://thakol.io/roadmap) for mandatory-MFA enrollment coverage. Enrolled users
are challenged; existing unenrolled application users are a known rollout gap being corrected.
