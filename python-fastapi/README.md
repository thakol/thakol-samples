# Python FastAPI OIDC Sample

This directory contains a complete Python backend application demonstrating integration with Thakol.io.

It uses [**FastAPI**](https://fastapi.tiangolo.com) for web hosting and the community-standard [**Authlib**](https://authlib.org) library to configure the OIDC client, manage login redirection, verify the token signature, and secure server routes using sessions.

---

## 📁 File Structure

* `main.py` — The FastAPI application script setting up routes, session states, and Authlib redirect handlers.
* `requirements.txt` — Python dependencies needed for the application.
* `.env.example` — Template configuration details for Python environments.

---

## ⚡ How to Setup & Run

### Step 1: Create a Virtual Environment & Install Dependencies
Create a virtual environment and install requirements from this directory:
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
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
* `SESSION_SECRET_KEY` — A random secret string used to encrypt the Starlette session cookie.

### Step 3: Configure Redirect URIs in Thakol
Log into your **Thakol Developer Console** and ensure your Client has:
* **Redirect URI:** `http://localhost:8000/callback`

### Step 4: Run the FastAPI Server
Launch the server using uvicorn:
```bash
python3 main.py
```
Open `http://localhost:8000` in your browser.
