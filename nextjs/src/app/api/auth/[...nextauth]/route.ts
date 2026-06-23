import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";

const handler = NextAuth({
  providers: [
    KeycloakProvider({
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'default-client',
      clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || '',
      issuer: process.env.KEYCLOAK_ISSUER || 'https://auth.thakol.io/realms/YOUR_REALM',
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.idToken = account.id_token;
      }
      return token;
    },
    async session({ session, token }) {
      const customSession = session as any;
      customSession.accessToken = token.accessToken;
      customSession.idToken = token.idToken;
      return customSession;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'a-very-random-secret-key-for-local-session-encryption',
});

export { handler as GET, handler as POST };
