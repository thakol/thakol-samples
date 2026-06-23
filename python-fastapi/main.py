import os
import json
from fastapi import FastAPI, Request, HTTPException
from fastapi.responses import HTMLResponse, RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from authlib.integrations.starlette_client import OAuth
from dotenv import load_dotenv

# Load environments
load_dotenv()

app = FastAPI()

# Starlette session middleware to handle state during auth redirect
app.add_middleware(
    SessionMiddleware, 
    secret_key=os.getenv("SESSION_SECRET_KEY", "a-very-random-secret-key-for-session-management-12345")
)

# Initialize OAuth registry
oauth = OAuth()
oauth.register(
    name="thakol",
    client_id=os.getenv("KEYCLOAK_CLIENT_ID", "default-client"),
    client_secret=os.getenv("KEYCLOAK_CLIENT_SECRET", ""),
    server_metadata_url=f"{os.getenv('KEYCLOAK_ISSUER')}/.well-known/openid-configuration",
    client_kwargs={"scope": "openid profile email"},
)

# HTML template styles helper matching Thakol dashboard theme
STYLES_HTML = """
<style>
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@700;800&family=JetBrains+Mono&display=swap');
  body {
    background-color: hsl(222, 47%, 4%);
    color: hsl(210, 40%, 98%);
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 40px 20px;
    display: flex;
    justify-content: center;
    line-height: 1.6;
  }
  .card {
    background: rgba(13, 17, 23, 0.7);
    border: 1px solid hsla(217, 30%, 20%, 0.5);
    border-radius: 16px;
    padding: 32px;
    width: 100%;
    max-width: 600px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(12px);
  }
  h1 {
    font-family: 'Outfit', sans-serif;
    font-size: 2rem;
    margin: 0 0 10px 0;
    background: linear-gradient(135deg, #ffffff 40%, hsl(215, 20%, 75%) 80%, hsl(217, 100%, 50%) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    color: hsl(215, 20%, 75%);
    font-size: 1rem;
    margin: 0 0 24px 0;
  }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 12px 24px;
    border-radius: 8px;
    font-size: 0.95rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition: all 0.3s;
    border: none;
  }
  .btn-primary {
    background: linear-gradient(135deg, hsl(24, 100%, 55%), hsl(14, 100%, 50%));
    color: #ffffff;
    box-shadow: 0 4px 14px rgba(255, 100, 0, 0.2);
    margin-right: 12px;
  }
  .btn-primary:hover {
    background: linear-gradient(135deg, hsl(24, 100%, 60%), hsl(14, 100%, 55%));
    transform: translateY(-2px);
  }
  .btn-secondary {
    background: transparent;
    color: #fff;
    border: 1px solid hsla(217, 30%, 20%, 0.5);
  }
  .btn-secondary:hover {
    background: rgba(255, 255, 255, 0.04);
  }
  .badge {
    background: rgba(16, 185, 129, 0.1);
    border: 1px solid rgba(16, 185, 129, 0.25);
    color: #10b981;
    padding: 4px 12px;
    border-radius: 50px;
    font-size: 0.8rem;
    font-weight: 600;
    display: inline-flex;
    margin-bottom: 20px;
  }
  pre {
    background: #090d13;
    padding: 16px;
    border-radius: 8px;
    overflow-x: auto;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.85rem;
    color: #a5d6ff;
    border: 1px solid hsla(217, 30%, 20%, 0.5);
    margin-top: 10px;
  }
</style>
"""

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    user = request.session.get("user")
    
    if user:
        body = f"""
        <div class="card">
          <div class="badge">FastAPI Authenticated</div>
          <h1>Welcome, {user.get('name', 'Developer')}!</h1>
          <p>Email: {user.get('email', 'No email')}</p>
          <div style="margin-top: 10px;">
            <a href="/dashboard" class="btn btn-primary">Go to Dashboard</a>
            <a href="/logout" class="btn btn-secondary">Sign Out</a>
          </div>
        </div>
        """
    else:
        body = """
        <div class="card">
          <h1>Thakol FastAPI Integration</h1>
          <p>Secure Python backends using FastAPI and Authlib OIDC clients.</p>
          <a href="/login" class="btn btn-primary">Sign In with Thakol</a>
        </div>
        """
        
    return f"{STYLES_HTML}<body>{body}</body>"


@app.get("/login")
async def login(request: Request):
    # Retrieve local url callback handler
    redirect_uri = request.url_for("callback")
    # For HTTPS behind reverse proxies, force https scheme
    if "https" in os.getenv("BASE_URL", ""):
        redirect_uri = str(redirect_uri).replace("http://", "https://")
    return await oauth.thakol.authorize_redirect(request, redirect_uri)


@app.get("/callback")
async def callback(request: Request):
    try:
        # Code exchange and token validations
        token = await oauth.thakol.authorize_access_token(request)
        user = token.get("userinfo")
        if not user:
            raise HTTPException(status_code=400, detail="Missing userinfo in token exchange")
        
        # Save token details inside session
        request.session["user"] = dict(user)
        request.session["access_token"] = token.get("access_token")
        return RedirectResponse(url="/dashboard")
    except Exception as e:
        print("Authlib callback failure:", e)
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    user = request.session.get("user")
    access_token = request.session.get("access_token")
    
    if not user:
        return RedirectResponse(url="/")
        
    body = f"""
    <div class="card">
      <div class="badge">Session Gated Dashboard</div>
      <h1>Workspace Dashboard</h1>
      <p>Secure FastAPI route authenticated successfully!</p>
      
      <div style="margin-top: 10px;">
        <span style="font-size: 0.85rem; color: #6a737d; text-transform: uppercase; font-weight: 600;">Decoded ID Token Claims</span>
        <pre><code>{json.dumps(user, indent=2)}</code></pre>
      </div>

      <div style="margin-top: 20px;">
        <span style="font-size: 0.85rem; color: #6a737d; text-transform: uppercase; font-weight: 600;">Raw Access Token (JWT)</span>
        <pre style="word-break: break-all; white-space: pre-wrap;"><code style="color: #6a737d;">{access_token}</code></pre>
      </div>

      <div style="margin-top: 24px;">
        <a href="/" class="btn btn-secondary">Back to Home</a>
        <a href="/logout" class="btn btn-secondary" style="color: #ef4444; border-color: rgba(239,68,68,0.2);">Sign Out</a>
      </div>
    </div>
    """
    return f"{STYLES_HTML}<body>{body}</body>"


@app.get("/logout")
async def logout(request: Request):
    request.session.clear()
    return RedirectResponse(url="/")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
