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
* `KEYCLOAK_CLIENT_SECRET` — The server-only client secret for this sample's confidential OIDC client.
* `KEYCLOAK_ISSUER` — E.g. `https://auth.thakol.io/realms/your-realm` or `http://localhost:8080/realms/your-realm`
* `NEXTAUTH_SECRET` — A random secret string used to encrypt NextAuth cookies (e.g. run `openssl rand -base64 32`).

### Step 3: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client has:
* **Redirect URI:** `http://localhost:3000/api/auth/callback/keycloak`
* **Web Origins (CORS):** `http://localhost:3000` (exact origin; avoid wildcard origins)

### Step 4: Run the Development Server
Launch the Next.js server:
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.


## Email OTP and email links

This sample's existing OIDC login also supports the hosted email-code and email-link methods.
Enable them in the workspace's Advanced → Sign-In Methods settings; no new token endpoint or
client secret in the browser is needed. Open links in the original browser/profile (and original
sign-in tab if your app stores state per tab), then confirm sign-in. Keep callback state and
PKCE validation. For signup, enable the selected method's signup permission plus self-registration.

Follow [the shared acceptance checklist](../PASSWORDLESS.md) and check the
[current roadmap](https://thakol.io/roadmap) for rollout status. Required MFA enrolls existing and
new users before returning the authorization code. Enabling or repairing it ends older application
SSO sessions once; optional MFA challenges enrolled users without forcing enrollment.
