require('dotenv').config();
const express = require('express');
const { auth, requiresAuth } = require('express-openid-connect');
const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');

const app = express();
const port = process.env.PORT || 3003;

// Configure HTML styles helper
const stylesHtml = `
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
`;

// 1. Configure Session-Based Web Auth Middleware
app.use(
  auth({
    authRequired: false,
    auth0Logout: false,
    issuerBaseURL: process.env.KEYCLOAK_ISSUER || "https://auth.thakol.io/realms/YOUR_REALM",
    baseURL: process.env.BASE_URL || `http://localhost:${port}`,
    clientID: process.env.KEYCLOAK_CLIENT_ID || "default-client",
    clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || "",
    secret: process.env.SESSION_SECRET || "a-long-random-string-used-to-sign-session-cookies-in-express",
    authorizationParams: {
      response_type: "code",
      scope: "openid profile email",
    },
  })
);

// 2. Configure Stateless API Token JWT Verification Middleware
const jwksClientInstance = jwksClient({
  jwksUri: `${process.env.KEYCLOAK_ISSUER}/protocol/openid-connect/certs`,
});

function getKey(header, callback) {
  jwksClientInstance.getSigningKey(header.kid, (err, key) => {
    if (err) {
      callback(err);
    } else {
      const signingKey = key.getPublicKey();
      callback(null, signingKey);
    }
  });
}

function verifyApiJwt(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or malformed Authorization header. Use Bearer token.' });
  }

  const token = authHeader.split(' ')[1];
  
  jwt.verify(
    token, 
    getKey, 
    {
      algorithms: ['RS256'],
      issuer: process.env.KEYCLOAK_ISSUER,
      audience: process.env.KEYCLOAK_CLIENT_ID
    }, 
    (err, decoded) => {
      if (err) {
        console.error('JWT validation error:', err);
        return res.status(401).json({ error: `Invalid access token: ${err.message}` });
      }
      req.user = decoded;
      next();
    }
  );
}

// ===== WEB ROUTING =====

// Public Route
app.get('/', (req, res) => {
  const isAuthenticated = req.oidc.isAuthenticated();
  res.send(`
    ${stylesHtml}
    <div class="card">
      <h1>Thakol Node.js Express</h1>
      <p>This page demonstrates OIDC authentication using session cookies.</p>
      ${isAuthenticated 
        ? `<div class="badge">Logged In</div>
           <div style="margin-top: 10px;">
             <a href="/profile" class="btn btn-primary">Go to Profile</a>
             <a href="/logout" class="btn btn-secondary">Sign Out</a>
           </div>`
        : `<a href="/login" class="btn btn-primary">Sign In with Thakol</a>`
      }
    </div>
  `);
});

// Protected Profile Route
app.get('/profile', requiresAuth(), (req, res) => {
  res.send(`
    ${stylesHtml}
    <div class="card">
      <div class="badge">Session Gated Profile</div>
      <h1>Welcome, ${req.oidc.user.name || req.oidc.user.email}!</h1>
      <p>Email: ${req.oidc.user.email}</p>
      
      <div style="margin-top: 10px;">
        <span style="font-size: 0.85rem; color: #6a737d; text-transform: uppercase; font-weight: 600;">Decoded Session Claims</span>
        <pre><code>${JSON.stringify(req.oidc.user, null, 2)}</code></pre>
      </div>

      <div style="margin-top: 24px;">
        <a href="/" class="btn btn-secondary">Back to Home</a>
        <a href="/logout" class="btn btn-secondary" style="color: #ef4444; border-color: rgba(239,68,68,0.2);">Sign Out</a>
      </div>
    </div>
  `);
});

// ===== STATELOCKED API ROUTING =====

// Protected API Endpoint
app.get('/api/data', verifyApiJwt, (req, res) => {
  res.json({
    message: 'Authorized API access successful!',
    scope: req.user.scope,
    client: req.user.azp,
    roles: req.user.realm_access?.roles || [],
    userId: req.user.sub,
    email: req.user.email
  });
});

app.listen(port, () => {
  console.log(`Node.js / Express integration server running on http://localhost:${port}`);
});
