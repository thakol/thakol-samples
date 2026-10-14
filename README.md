# Thakol.io — Integration Samples

Welcome to the official integration samples repository for the [Thakol.io](https://thakol.io) authentication engine. 

Thakol is a beautiful, developer-focused authentication SaaS powered by a multi-tenant **Keycloak** core. It abstracts OIDC complexity behind a sleek dashboard and provides hosted authentication for a limited public preview.

This repository contains step-by-step example applications demonstrating how to secure your frontend and backend stacks using OpenID Connect (OIDC) standards.

---

## 🚀 Overview of Samples

| Directory | Type | Technology | Auth Library / Tool | Key Concepts Covered |
| :--- | :--- | :--- | :--- | :--- |
| [**`vanilla-js`**](./vanilla-js) | SPA / Frontend | HTML5 & Vanilla JS | `oidc-client-ts` | Authorization Code Flow + PKCE, Config Panel, Token Storage |
| [**`react-js`**](./react-js) | SPA / Frontend | React 18 & Vite | `oidc-client-ts` | Reusable `useAuth` hook, Context Provider, Profile view |
| [**`angular`**](./angular) | SPA / Frontend | Angular 17 | `angular-oauth2-oidc` | AppModule config, Route guards, User claims template |
| [**`nextjs`**](./nextjs) | Fullstack | Next.js App Router | `next-auth` (Auth.js) | Client & Server Components session gating, Route Handlers |
| [**`nodejs-express`**](./nodejs-express) | Server / API | Express | `express-openid-connect` | Server-side sessions, API middleware token validation |
| [**`python-fastapi`**](./python-fastapi) | Server / API | FastAPI | `authlib` | Token verification, login/callback redirect handlers |
| [**`go-http`**](./go-http) | Server / API | Go `net/http` | `go-oidc` & `oauth2` | Manual state validation, token signature checks with JWKS |

---

## ⚙️ Core Configuration Parameters

Regardless of the framework you choose, your application will interact with Thakol via OpenID Connect (OIDC). To initialize any OIDC client, you need three main values from your **Thakol Developer Dashboard**:

1. **Issuer / Authority (Realm URL)**
   - The URL of your workspace's identity realm.
   - Format: `https://auth.thakol.io/realms/YOUR_WORKSPACE_REALM`
   - *Local dev alternative:* `http://localhost:8080/realms/YOUR_WORKSPACE_REALM`

2. **Client ID**
   - The identifier of the OIDC client you registered for your app.
   - E.g. `default-client` or `my-react-app`.

3. **Redirect URI**
   - The URL in your application where Thakol will redirect users after a successful login.
   - For security, this **must** exactly match one of the redirect URIs registered for the client in the Thakol Dashboard.
   - E.g. `http://localhost:3000/callback` or `http://localhost:3000/api/auth/callback/keycloak` (Next.js/Auth.js).

---

## 🛡️ Security Best Practices

* **Always use PKCE for Frontends**: Single Page Applications (React, Angular, Vanilla JS) run in untrusted clients (browsers). Always use the **Authorization Code Flow with PKCE** (`response_type: "code"`). Never use the implicit flow (`response_type: "id_token token"`) which is now deprecated.
* **Keep Client Secrets Server-Side**: Confidential clients (like Node.js, Python, or Go backends) can use a `client_secret` to authenticate. Never expose a `client_secret` in your frontend SPA code (e.g. bundle it inside React or Angular builds).
* **Verify Tokens on Backend**: When protecting REST APIs, your backend must receive the JWT bearer token in the `Authorization` header, parse it, and verify its signature using the public keys exposed at your realm's JWKS endpoint: `.../protocol/openid-connect/certs`.

## 🛠️ Getting Started & Configuring Parameters

To run the samples and verify the OIDC authentication flow, you must specify your Thakol Realm/Authority and Client details:

### 1. In Frontend SPA Apps (Vanilla JS, React, Angular)
These samples feature an **interactive developer configuration panel** built directly into the UI. You do not need to edit any source code files:
1. Navigate to the project directory (e.g. `cd react-js`) and run `npm install && npm run dev`.
2. Open the page in your browser (e.g. `http://localhost:3002`).
3. In the form fields shown on the screen, paste:
   - **Authority / Realm URL**: `https://auth.thakol.io/realms/YOUR_REALM` (or use the playground `https://demoauth.thakol.io/realms/demo`).
   - **Client ID**: `default-client`.
4. Click **Sign In with Thakol** to start the redirection flow.

### 2. In Backend/Fullstack Apps (Next.js, Express, FastAPI, Go)
These applications require configuration via environment variables:
1. Navigate to the app directory (e.g. `cd nextjs`).
2. Copy the `.env.example` file to a local environment file:
   - **Next.js**: `cp .env.example .env.local`
   - **Express / Python**: `cp .env.example .env`
3. Open the newly created file in your text editor and update the parameters:
   - `KEYCLOAK_ISSUER`: Your own approved workspace realm URL.
   - `KEYCLOAK_CLIENT_ID`: Your registered client ID; the public demo client is for browser samples only.
   - `KEYCLOAK_CLIENT_SECRET`: Your client secret (required only for confidential clients/backends; leave blank or omit for public clients).
4. Set the sample's session secret too: `NEXTAUTH_SECRET` (Next.js), `SESSION_SECRET` (Express), or `SESSION_SECRET_KEY` (FastAPI). Copy the Go `.env.example` to `.env` and set `BASE_URL`/`PORT` as its README describes.
5. Run the installation and dev/start scripts as defined in the subfolder's `README.md`.


## Email codes and sign-in links

All seven samples use the same OIDC authorization-code flow for password, email OTP and email
links. The workspace owner enables each email method under Settings → Advanced → Sign-In
Methods; optional account creation has a separate permission for each method and also requires
application self-registration. Access to the workspace dashboard itself remains approval-gated.

The hosted page sends/verifies the proof. Do not add a custom OTP API, forward a link token into
the sample, use password grant, or remove state/PKCE checks. Links expire after five minutes and
require confirmation in the original browser/profile. If state is stored per tab, use the
original sign-in tab. The React and Vanilla JS samples explicitly share pending OIDC state for a callback
opened in another tab of the same profile; Angular uses the original sign-in tab; never clear it while waiting for the email.

Required MFA enrolls existing and new application users before the authorization code is issued.
Enabling or repairing it ends older application SSO sessions once. Optional MFA challenges enrolled
users without forcing enrollment. Test both enrolled and unenrolled users. Passkeys, SMS and guided SAML are planned.

See [OTP setup](https://thakol.io/docs/email-otp), [link setup](https://thakol.io/docs/email-links),
and the [acceptance checklist](./PASSWORDLESS.md). Samples are development tools: do not copy
raw-token displays, debug logs or development-only HTTP settings into a production application.
