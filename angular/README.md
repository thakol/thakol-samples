# Angular OIDC Sample

This directory contains a complete Angular Single Page Application (SPA) demonstrating standard OIDC integration with Thakol.io.

It uses the community-standard library [`angular-oauth2-oidc`](https://github.com/manfredsteyer/angular-oauth2-oidc) to implement the **Authorization Code Flow with PKCE**, handle routing guards, parse JWT access and ID tokens, and sync sessions.

---

## 📁 File Structure

* `src/app/auth.config.ts` — Dynamic configuration helper mapped to OIDC specifications.
* `src/app/app-module.ts` — Standard Angular `AppModule` importing `HttpClient` and configuring `OAuthModule.forRoot()`.
* `src/app/app.ts` — Component controller wrapping sign-in/sign-out logic, token mappings, and local session getters.
* `src/app/app.html` — Interactive UI displaying config forms, profile credentials, and decoded JWT payload.
* `src/styles.css` — Global stylesheets mapped to Thakol's dark theme design.

---

## ⚡ How to Setup & Run

### Step 1: Install Dependencies
Run the dependencies installation (specifically handling the peer warnings for the Angular version):
```bash
npm install
```

### Step 2: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client (e.g. `default-client`) has:
* **Redirect URI:** `http://localhost:4200`
* **Web Origins (CORS):** `http://localhost:4200` or `*`

### Step 3: Run the Development Server
Launch the Angular development compiler:
```bash
npm start
```
Open `http://localhost:4200` in your browser.

### Step 4: Sign In
1. Input your workspace **Realm / Authority URL** (e.g. `https://auth.thakol.io/realms/your-realm`).
2. Input your **Client ID** (e.g. `default-client`).
3. Click **Sign In with Thakol** to authenticate and load your active session data!
