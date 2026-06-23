import { Component, OnInit } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { getAuthConfig, DEFAULT_REALM_URL, DEFAULT_CLIENT_ID } from './auth.config';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css',
})
export class App implements OnInit {
  authorityUrl = localStorage.getItem('thakol_authority') || DEFAULT_REALM_URL;
  clientId = localStorage.getItem('thakol_client_id') || DEFAULT_CLIENT_ID;

  constructor(private oauthService: OAuthService) {}

  ngOnInit() {
    this.configureAuth(this.authorityUrl, this.clientId);
  }

  private configureAuth(authority: string, client: string) {
    const config = getAuthConfig(authority, client);
    this.oauthService.configure(config);
    this.oauthService.loadDiscoveryDocumentAndTryLogin().then(() => {
      console.log('OIDC initialization complete');
    }).catch(err => {
      console.error('OIDC discovery load failed:', err);
    });
  }

  login() {
    localStorage.setItem('thakol_authority', this.authorityUrl);
    localStorage.setItem('thakol_client_id', this.clientId);
    
    // Configure flow and run login
    this.configureAuth(this.authorityUrl, this.clientId);
    this.oauthService.initCodeFlow();
  }

  logout() {
    this.oauthService.logOut();
  }

  get isAuthenticated(): boolean {
    return this.oauthService.hasValidIdToken() && this.oauthService.hasValidAccessToken();
  }

  get givenName(): string {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return '';
    return claims['name'] || claims['preferred_username'] || 'User';
  }

  get email(): string {
    const claims: any = this.oauthService.getIdentityClaims();
    if (!claims) return '';
    return claims['email'] || '';
  }

  get claimsJson(): string {
    const claims = this.oauthService.getIdentityClaims();
    return claims ? JSON.stringify(claims, null, 2) : '{}';
  }

  get accessToken(): string {
    return this.oauthService.getAccessToken() || '';
  }

  get expiresAt(): string {
    const expiration = this.oauthService.getAccessTokenExpiration();
    return expiration ? new Date(expiration).toLocaleString() : 'N/A';
  }
}
