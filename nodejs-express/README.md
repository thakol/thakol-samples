# Node.js Express OIDC Sample

This directory contains a complete Node.js Express backend application demonstrating OIDC integration with Thakol.io.

It shows two core integration strategies:
1. **Session-Based Web Authentication** — Using the community-standard library [`express-openid-connect`](https://github.com/auth0/express-openid-connect) to secure server-rendered pages and set up secure sessions.
2. **Stateless API Bearer Token Verification** — Creating custom Express middleware that intercepts REST API requests, extracts the JWT bearer token, queries the JWKS public keys endpoint from Thakol to verify the signature, and populates the `req.user` payload.

---

## 📁 File Structure

* `app.js` — Main Express configuration setting up cookie sessions, JWT verification middleware, web pages, and protected API endpoints.
* `.env.example` — Template configuration details for Node.js environments.

---

## ⚡ How to Setup & Run

### Step 1: Install Dependencies
Run the installation script in this directory:
```bash
npm install
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env` and fill in the values:
```bash
cp .env.example .env
```

Modify the environment variables inside `.env`:
* `KEYCLOAK_CLIENT_ID` — Your client ID (e.g. `default-client`).
* `KEYCLOAK_CLIENT_SECRET` — Your client secret (required if your client is set to confidential, leave empty if public).
* `KEYCLOAK_ISSUER` — E.g. `https://auth.thakol.io/realms/your-realm` or `http://localhost:8080/realms/your-realm`
* `SESSION_SECRET` — A random secret string used to encrypt session cookies (must be at least 32 characters long).

### Step 3: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client has:
* **Redirect URI:** `http://localhost:3003/callback`
* **Post-Logout Redirect URI:** `http://localhost:3003`

### Step 4: Run the Express Server
Launch the application:
```bash
npm start
```
Open `http://localhost:3003` in your browser.

---

## 🔒 Testing the REST API Gating

You can verify token-based authorization on the REST API `/api/data` endpoint using cURL or Postman.

1. Obtain a valid JWT Access Token (e.g. by logging into one of the frontend client samples).
2. Query the Express API:
```bash
curl -H "Authorization: Bearer <YOUR_ACCESS_TOKEN>" http://localhost:3003/api/data
```
The server will verify the signature dynamically using Thakol's JSON Web Key Set (JWKS) keys and respond with the authenticated payload metadata!


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
