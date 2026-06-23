import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserManager, WebStorageStateStore } from 'oidc-client-ts';

const AuthContext = createContext(null);

const DEFAULT_REALM_URL = "https://auth.thakol.io/realms/YOUR_REALM";
const DEFAULT_CLIENT_ID = "default-client";

export function AuthProvider({ children }) {
  const [authority, setAuthority] = useState(() => localStorage.getItem("thakol_authority") || DEFAULT_REALM_URL);
  const [clientId, setClientId] = useState(() => localStorage.getItem("thakol_client_id") || DEFAULT_CLIENT_ID);
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize UserManager reference
  const [userManager, setUserManager] = useState(() => {
    return new UserManager({
      authority,
      client_id: clientId,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      response_type: "code",
      scope: "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
    });
  });

  // Re-create userManager when credentials change
  const updateConfig = (newAuthority, newClientId) => {
    localStorage.setItem("thakol_authority", newAuthority);
    localStorage.setItem("thakol_client_id", newClientId);
    
    setAuthority(newAuthority);
    setClientId(newClientId);

    const mgr = new UserManager({
      authority: newAuthority,
      client_id: newClientId,
      redirect_uri: window.location.origin,
      post_logout_redirect_uri: window.location.origin,
      response_type: "code",
      scope: "openid profile email",
      userStore: new WebStorageStateStore({ store: window.localStorage }),
      automaticSilentRenew: true,
    });
    setUserManager(mgr);
    return mgr;
  };

  useEffect(() => {
    const checkAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      
      // A. Handle redirection callback
      if (urlParams.has("code") && urlParams.has("state")) {
        try {
          setLoading(true);
          const u = await userManager.signinRedirectCallback();
          setUser(u);
          window.history.replaceState({}, document.title, window.location.pathname);
        } catch (err) {
          console.error("Callback error:", err);
          setError("Callback failed. Verify client settings in Thakol Dashboard: " + err.message);
        } finally {
          setLoading(false);
        }
      } else {
        // B. Check local session storage
        try {
          const u = await userManager.getUser();
          if (u && !u.expired) {
            setUser(u);
          }
        } catch (err) {
          console.error("Error reading user context:", err);
        } finally {
          setLoading(false);
        }
      }
    };

    checkAuth();
  }, [userManager]);

  const login = async (customMgr = userManager) => {
    try {
      setLoading(true);
      await customMgr.signinRedirect();
    } catch (err) {
      console.error("Redirect login error:", err);
      setError("Redirection failed: " + err.message);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await userManager.signoutRedirect();
    } catch (err) {
      console.error("Logout error:", err);
      await userManager.clearStaleState();
      setUser(null);
      window.location.reload();
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      isAuthenticated: !!user,
      authority,
      clientId,
      updateConfig,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
