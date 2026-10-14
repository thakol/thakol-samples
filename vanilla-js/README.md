# Vanilla JS OIDC Sample

This directory contains a lightweight, pure JavaScript Single Page Application (SPA) demonstrating standard OIDC integration with Thakol.io.

It uses the modern OIDC community library [`oidc-client-ts`](https://github.com/authts/oidc-client-ts) which implements the secure **Authorization Code Flow with PKCE** and provides automated token silent renewals and storage management.

---

## 📁 File Structure

* `index.html` — Main HTML page containing the layout, config inputs, and authenticated profile grids.
* `main.js` — Client logic for OIDC redirection, callback resolution, token parsing, and DOM updates.
* `style.css` — Modern dark theme styling matching the Thakol.io dashboard branding.
* `vite.config.js` — Simple configuration to serve the SPA locally on port `3001`.

---

## ⚡ How to Setup & Run

### Step 1: Install Dependencies
Run npm install from this directory:
```bash
npm install
```

### Step 2: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client (e.g. `default-client`) has:
* **Redirect URI:** `http://localhost:3001`
* **Web Origins (CORS):** `http://localhost:3001` or `*`

### Step 3: Run the Development Server
Launch the local Vite server:
```bash
npm run dev
```
Open `http://localhost:3001` in your browser.

### Step 4: Sign In
1. Input your workspace **Realm / Authority URL** (e.g. `https://auth.thakol.io/realms/your-realm`).
2. Input your **Client ID** (e.g. `default-client`).
3. Click **Sign In with Thakol** to redirect to the login form, sign in, and return to view your decoded token profile!


## Email OTP and email links

This sample's existing OIDC login also supports the hosted email-code and email-link methods.
Enable them in the workspace's Advanced → Sign-In Methods settings; no new token endpoint or
client secret in the browser is needed. Open links in the original browser/profile (and original
sign-in tab if your app stores state per tab), then confirm sign-in. Keep callback state and
PKCE validation. For signup, enable the selected method's signup permission plus self-registration.

Follow [the shared acceptance checklist](../PASSWORDLESS.md) and check the
[current roadmap](https://thakol.io/roadmap) for mandatory-MFA enrollment coverage. Enrolled users
are challenged; existing unenrolled application users are a known rollout gap being corrected.
