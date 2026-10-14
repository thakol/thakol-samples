import { AuthConfig } from 'angular-oauth2-oidc';

export const DEFAULT_REALM_URL = 'https://auth.thakol.io/realms/YOUR_REALM';
export const DEFAULT_CLIENT_ID = 'default-client';

export function getAuthConfig(authorityUrl: string, clientUuid: string): AuthConfig {
  return {
    // Url of the Identity Provider
    issuer: authorityUrl,

    // URL of the SPA to redirect the user to after login
    redirectUri: window.location.origin,

    // The SPA's Client ID registered in Thakol
    clientId: clientUuid,

    // Just-in-time token validation response type
    responseType: 'code',

    // Scope for the permissions requested
    scope: 'openid profile email',

    showDebugInformation: false,

    // Enable PKCE flow
    useSilentRefresh: true,
    
    // Allow HTTP during local development
    requireHttps: 'remoteOnly',
  };
}
