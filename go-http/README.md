# Go HTTP OIDC Sample

This directory contains a lightweight Go backend application demonstrating standard OIDC integration with Thakol.io.

It uses the standard Go web server routing from the native library `net/http`, combined with the community-standard libraries [**`go-oidc`**](https://github.com/coreos/go-oidc) and [**`oauth2`**](https://golang.org/x/oauth2) to implement sign-in redirection, code exchange, and JWT signature verification.

---

## 📁 File Structure

* `main.go` — The Go backend server defining http endpoints, authorization codes exchange, token signature verification, and dynamic HTML dashboards.
* `go.mod` — Module file registering packages and dependencies.
* `.env.example` — Template configuration details for Go environments.

---

## ⚡ How to Setup & Run

### Step 1: Install Go Dependencies
Download the required packages from this directory:
```bash
go mod download
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

### Step 3: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client has:
* **Redirect URI:** `http://localhost:8081/callback`

### Step 4: Run the Go Server
Launch the application:
```bash
go run main.go
```
Open `http://localhost:8081` in your browser.
