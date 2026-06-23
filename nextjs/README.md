# Next.js OIDC Sample

This directory contains a complete Next.js App Router application demonstrating authentication integration with Thakol.io.

It uses the industry-standard library [**NextAuth.js (Auth.js)**](https://next-auth.js.org) with the `KeycloakProvider` to handle OIDC login, token callbacks, secure cookie-based session management, and server-side route gating.

---

## 📁 File Structure

* `src/app/api/auth/[...nextauth]/route.ts` — NextAuth handler registering the Keycloak OIDC provider and custom JWT/session callbacks.
* `src/app/providers.tsx` — Client-side React context wrapper providing the NextAuth session.
* `src/app/layout.tsx` — Root layout mounting globals, fonts, and the Session Provider.
* `src/app/page.tsx` — Client component displaying current user session claims and dynamic auth buttons.
* `src/app/protected/page.tsx` — Server component showcasing how to secure pages on the server via `getServerSession()`.
* `.env.example` — Template configuration details for Next.js environments.

---

## ⚡ How to Setup & Run

### Step 1: Install Dependencies
Run the installation script in this directory:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env.local` and fill in the values:
```bash
cp .env.example .env.local
```

Modify the environment variables inside `.env.local`:
* `KEYCLOAK_CLIENT_ID` — Your client ID registered in Thakol dashboard (e.g. `default-client`).
* `KEYCLOAK_CLIENT_SECRET` — The client secret (required if your client is set to confidential, leave empty if public).
* `KEYCLOAK_ISSUER` — E.g. `https://auth.thakol.io/realms/your-realm` or `http://localhost:8080/realms/your-realm`
* `NEXTAUTH_SECRET` — A random secret string used to encrypt NextAuth cookies (e.g. run `openssl rand -base64 32`).

### Step 3: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client has:
* **Redirect URI:** `http://localhost:3000/api/auth/callback/keycloak`
* **Web Origins (CORS):** `http://localhost:3000` or `*`

### Step 4: Run the Development Server
Launch the Next.js server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.
