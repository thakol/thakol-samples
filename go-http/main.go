package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/joho/godotenv"
	"golang.org/x/oauth2"
)

var (
	oauthConfig oauth2.Config
	verifier    *oidc.IDTokenVerifier
	stylesHTML  = `
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
`
)

func main() {
	// Load environment variables if .env exists
	_ = godotenv.Load()

	realmURL := os.Getenv("KEYCLOAK_ISSUER")
	clientID := os.Getenv("KEYCLOAK_CLIENT_ID")
	clientSecret := os.Getenv("KEYCLOAK_CLIENT_SECRET")
	redirectURL := os.Getenv("BASE_URL") + "/callback"
	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	if realmURL == "" || clientID == "" {
		log.Fatal("KEYCLOAK_ISSUER and KEYCLOAK_CLIENT_ID environment variables must be set")
	}

	ctx := context.Background()

	// Initialize the OIDC Provider dynamically querying issuer configurations
	provider, err := oidc.NewProvider(ctx, realmURL)
	if err != nil {
		log.Fatalf("Failed to initialize OIDC provider: %v", err)
	}

	// Create OIDC verifier structure
	oidcConfig := &oidc.Config{
		ClientID: clientID,
	}
	verifier = provider.Verifier(oidcConfig)

	// Build oauth2 configs
	oauthConfig = oauth2.Config{
		ClientID:     clientID,
		ClientSecret: clientSecret,
		Endpoint:     provider.Endpoint(),
		RedirectURL:  redirectURL,
		Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
	}

	http.HandleFunc("/", handleHome)
	http.HandleFunc("/login", handleLogin)
	http.HandleFunc("/callback", handleCallback)
	http.HandleFunc("/logout", handleLogout)

	log.Printf("Go HTTP server starting on http://localhost:%s...", port)
	log.Fatal(http.ListenAndServe(":"+port, nil))
}

func handleHome(w http.ResponseWriter, r *http.Request) {
	// In a production application, read from secure cookies or sessions.
	// For this simple demo, we check if user claims are passed via cookie
	cookie, err := r.Cookie("user_claims")
	if err != nil {
		// Logged out state
		w.Header().Set("Content-Type", "text/html")
		fmt.Fprintf(w, "%s<body><div class='card'><h1>Thakol Go Server</h1><p>Secure Go backend HTTP routers using coreos/go-oidc token checks.</p><a href='/login' class='btn btn-primary'>Sign In with Thakol</a></div></body>", stylesHTML)
		return
	}

	// Logged in state
	var claims map[string]interface{}
	_ = json.Unmarshal([]byte(cookie.Value), &claims)

	name := claims["name"]
	if name == nil {
		name = claims["preferred_username"]
	}
	email := claims["email"]

	// Retrieve access token
	tokenCookie, _ := r.Cookie("access_token")
	accessToken := ""
	if tokenCookie != nil {
		accessToken = tokenCookie.Value
	}

	w.Header().Set("Content-Type", "text/html")
	fmt.Fprintf(w, "%s<body><div class='card'><div class='badge'>Go Authenticated</div><h1>Welcome, %v!</h1><p>Email: %v</p><div style='margin-top: 10px;'><span style='font-size: 0.85rem; color: #6a737d; text-transform: uppercase; font-weight: 600;'>Decoded Profile Claims</span><pre><code>%s</code></pre></div><div style='margin-top: 20px;'><span style='font-size: 0.85rem; color: #6a737d; text-transform: uppercase; font-weight: 600;'>Raw Access Token (JWT)</span><pre style='word-break: break-all; white-space: pre-wrap;'><code style='color: #6a737d;'>%s</code></pre></div><div style='margin-top: 24px;'><a href='/logout' class='btn btn-secondary' style='color: #ef4444; border-color: rgba(239,68,68,0.2);'>Sign Out</a></div></div></body>", stylesHTML, name, email, cookie.Value, accessToken)
}

func handleLogin(w http.ResponseWriter, r *http.Request) {
	// Generate random secure state token (simplified for sandbox reference)
	state := "random-state-handshake-string"
	http.Redirect(w, r, oauthConfig.AuthCodeURL(state), http.StatusFound)
}

func handleCallback(w http.ResponseWriter, r *http.Request) {
	ctx := context.Background()

	// 1. Verify oauth state
	if r.URL.Query().Get("state") != "random-state-handshake-string" {
		http.Error(w, "OIDC state verification mismatch", http.StatusBadRequest)
		return
	}

	// 2. Exchange authorization code for token sets
	code := r.URL.Query().Get("code")
	oauth2Token, err := oauthConfig.Exchange(ctx, code)
	if err != nil {
		http.Error(w, "Failed to exchange auth code: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// 3. Extract and verify ID token signature using JWKS keys
	rawIDToken, ok := oauth2Token.Extra("id_token").(string)
	if !ok {
		http.Error(w, "ID Token missing in authorization server response", http.StatusInternalServerError)
		return
	}

	idToken, err := verifier.Verify(ctx, rawIDToken)
	if err != nil {
		http.Error(w, "ID Token verification failure: "+err.Error(), http.StatusUnauthorized)
		return
	}

	// 4. Parse custom identity profile claims
	var claims map[string]interface{}
	if err := idToken.Claims(&claims); err != nil {
		http.Error(w, "Failed to parse token claims: "+err.Error(), http.StatusInternalServerError)
		return
	}

	// Format claims to string and store inside cookie
	claimsJSON, _ := json.MarshalIndent(claims, "", "  ")
	http.SetCookie(w, &http.Cookie{
		Name:    "user_claims",
		Value:   string(claimsJSON),
		Path:    "/",
		Expires: time.Now().Add(24 * time.Hour),
	})

	// Store access token inside cookie for dashboard inspect
	http.SetCookie(w, &http.Cookie{
		Name:    "access_token",
		Value:   oauth2Token.AccessToken,
		Path:    "/",
		Expires: time.Now().Add(24 * time.Hour),
	})

	http.Redirect(w, r, "/", http.StatusFound)
}

func handleLogout(w http.ResponseWriter, r *http.Request) {
	// Clear user cookies
	http.SetCookie(w, &http.Cookie{
		Name:    "user_claims",
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
	})
	http.SetCookie(w, &http.Cookie{
		Name:    "access_token",
		Value:   "",
		Path:    "/",
		Expires: time.Unix(0, 0),
	})
	http.Redirect(w, r, "/", http.StatusFound)
}
