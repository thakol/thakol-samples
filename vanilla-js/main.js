import { UserManager, WebStorageStateStore } from "oidc-client-ts";

// Default configs (pointing to default local or production values)
const DEFAULT_REALM_URL = "https://auth.thakol.io/realms/YOUR_REALM";
const DEFAULT_CLIENT_ID = "default-client";

// DOM Elements
const loadingState = document.getElementById("loading-state");
const loggedOutState = document.getElementById("logged-out-state");
const loggedInState = document.getElementById("logged-in-state");

const realmUrlInput = document.getElementById("realm-url");
const clientIdInput = document.getElementById("client-id");
const loginBtn = document.getElementById("login-btn");
const logoutBtn = document.getElementById("logout-btn");

const profileAvatar = document.getElementById("profile-avatar");
const profileName = document.getElementById("profile-name");
const profileEmail = document.getElementById("profile-email");
const sessionExpires = document.getElementById("session-expires");
const claimsBox = document.getElementById("claims-box");
const tokenBox = document.getElementById("token-box");

// 1. Load configuration from localStorage or default
let authority = localStorage.getItem("thakol_authority") || DEFAULT_REALM_URL;
let clientId = localStorage.getItem("thakol_client_id") || DEFAULT_CLIENT_ID;

realmUrlInput.value = authority;
clientIdInput.value = clientId;

// 2. Initialize OIDC UserManager
function createUserManager(authorityUrl, clientUuid) {
  return new UserManager({
    authority: authorityUrl,
    client_id: clientUuid,
    redirect_uri: window.location.origin,
    post_logout_redirect_uri: window.location.origin,
    response_type: "code",
    scope: "openid profile email",
    // Preserve pending state/PKCE across tabs in the original browser profile for email links.
      stateStore: new WebStorageStateStore({ store: window.localStorage }),
      userStore: new WebStorageStateStore({ store: window.localStorage }),
    automaticSilentRenew: true,
  });
}

let userManager = createUserManager(authority, clientId);

// 3. Check authentication status
async function initAuth() {
  const urlParams = new URLSearchParams(window.location.search);
  
  // A. Handle callback from Thakol redirect
  if (urlParams.has("code") && urlParams.has("state")) {
    try {
      loadingState.innerText = "Exchanging code for credentials...";
      loadingState.classList.remove("hidden");
      
      const user = await userManager.signinRedirectCallback();
      // Do not log the user object: it contains bearer tokens.
      
      // Clean query parameters from address bar
      window.history.replaceState({}, document.title, window.location.pathname);
      showAuthenticatedUser(user);
    } catch (err) {
      console.error("Callback error:", err);
      alert("Authentication Callback Failed! Double check your Client ID, Redirect URIs, and allowed Web Origins in Thakol Dashboard.\n\nError: " + err.message);
      showLoggedOutState();
    }
  } else {
    // B. Check if user session already exists
    try {
      const user = await userManager.getUser();
      if (user && !user.expired) {
        showAuthenticatedUser(user);
      } else {
        showLoggedOutState();
      }
    } catch (err) {
      console.error("Error loading user profile:", err);
      showLoggedOutState();
    }
  }
}

// Render logged-out view
function showLoggedOutState() {
  loadingState.classList.add("hidden");
  loggedInState.classList.add("hidden");
  loggedOutState.classList.remove("hidden");
}

// Render logged-in view
function showAuthenticatedUser(user) {
  loadingState.classList.add("hidden");
  loggedOutState.classList.add("hidden");
  loggedInState.classList.remove("hidden");

  const name = user.profile.name || user.profile.preferred_username || "Thakol Developer";
  const email = user.profile.email || "No email claim";
  
  profileName.innerText = name;
  profileEmail.innerText = email;
  profileAvatar.innerText = name.charAt(0).toUpperCase();

  // Expiration date
  if (user.expires_at) {
    const expiresDate = new Date(user.expires_at * 1000);
    sessionExpires.innerText = expiresDate.toLocaleString();
  } else {
    sessionExpires.innerText = "Session active";
  }

  // Display user claims and tokens
  claimsBox.innerText = JSON.stringify(user.profile, null, 2);
  tokenBox.innerText = user.access_token;
}

// 4. Register Event Listeners
loginBtn.addEventListener("click", async () => {
  // Update credentials based on UI form
  const newAuthority = realmUrlInput.value.trim();
  const newClientId = clientIdInput.value.trim();

  if (!newAuthority || !newClientId) {
    alert("Please enter both Realm URL and Client ID");
    return;
  }

  localStorage.setItem("thakol_authority", newAuthority);
  localStorage.setItem("thakol_client_id", newClientId);

  userManager = createUserManager(newAuthority, newClientId);

  try {
    loadingState.classList.remove("hidden");
    loggedOutState.classList.add("hidden");
    await userManager.signinRedirect();
  } catch (err) {
    console.error("Redirect login error:", err);
    alert("Failed to redirect to login: " + err.message);
    showLoggedOutState();
  }
});

logoutBtn.addEventListener("click", async () => {
  try {
    await userManager.signoutRedirect();
  } catch (err) {
    console.error("Signout error:", err);
    // Local fallback clear if Keycloak logout fails or redirect fails
    await userManager.clearStaleState();
    window.location.reload();
  }
});

// Run auth check on load
initAuth();
