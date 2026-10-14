# Passwordless integration acceptance

Use your approved active workspace, actual issuer/client ID, exact callbacks and HTTPS production
origin. Public SPAs use code + S256 PKCE and no client secret. Server samples keep their secret
and session state on the server. The authentication method is chosen on the hosted page.

1. Enable working email delivery and unique emails in the application realm.
2. Enable Email code and/or Email login link in workspace advanced sign-in settings.
3. Start login from the sample and request mail to an address you control.
4. OTP: enter the most recent code in the original sign-in session. Link: open it in the original
   browser/profile, check the address and confirm. Keep the original tab when the app uses
   tab-scoped state. GET previews must not complete sign-in.
5. Confirm the application validates callback state and completes its normal code exchange,
   then obtains a verified-email profile. APIs still verify JWT signature, issuer, audience and expiry.
6. Try invalid/expired proof, resend, replay, disabled user, password fallback and logout.
7. Test both enrolled and unenrolled users when MFA is required. The existing-user mandatory
   enrollment gap is currently being fixed; a successful enrolled-user check alone is insufficient.
8. If signup is wanted, enable that method's separate signup checkbox and application
   self-registration. Prove no account exists before verification and one exists after success.
9. Check dashboard usage for successful auth. Send/resend/preview/failure are not usage events;
   launch counters are free and delivery is best effort.

Never log or share passwords, codes, links, callback authorization codes or full tokens. Do not
commit real configuration or mailbox credentials. No inbox delivery is claimed merely because
SMTP accepts the message; record actual receipt and the real application callback.
