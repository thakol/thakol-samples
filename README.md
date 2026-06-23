# Thakol.io — Integration Samples

Welcome to the official integration samples repository for the [Thakol.io](https://thakol.io) authentication engine. 

Thakol is a beautiful, developer-focused authentication SaaS powered by a multi-tenant **Keycloak** core. It abstracts OIDC complexity behind a sleek dashboard and provides enterprise-grade authentication out-of-the-box.

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

---

## 🛠️ Getting Started Locally

To run the samples, configure them to talk to either the live Thakol.io service or a local instance of the Thakol stack.

1. Clone or check out this folder.
2. Navigate to any of the subfolders (e.g. `cd react-js`).
3. Follow the instructions in that directory's `README.md` to install dependencies, copy environment variables, and start the development server.
