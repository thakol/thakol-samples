import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { OAuthModule } from 'angular-oauth2-oidc';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';

@NgModule({
  declarations: [App],
  imports: [
    BrowserModule, 
    AppRoutingModule,
    FormsModule,
    OAuthModule.forRoot()
  ],
  providers: [
    provideHttpClient()
  ],
  bootstrap: [App],
})
export class AppModule {}
