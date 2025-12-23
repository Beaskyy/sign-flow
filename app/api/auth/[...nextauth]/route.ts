import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

/* -------------------------------------------------------------------------- */
/*                               Type Augments                                */
/* -------------------------------------------------------------------------- */

declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    accessTokenIssuedAt?: number; // Track when access token was issued
    user?: any;
    error?: string;
  }
}

/* -------------------------------------------------------------------------- */
/*                          Refresh Access Token Helper                        */
/* -------------------------------------------------------------------------- */

async function refreshAccessToken(token: any) {
  try {
    console.log("🔄 Refreshing access token...");
    
    if (!token.refreshToken) {
      console.error("❌ No refresh token available");
      throw new Error("No refresh token");
    }

    // Check if refresh token is still valid (7 days = 604800000 ms)
    const refreshTokenIssuedAt = token.accessTokenIssuedAt || Date.now();
    const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
    
    if (Date.now() - refreshTokenIssuedAt > sevenDaysInMs) {
      console.error("❌ Refresh token expired (7 days)");
      throw new Error("Refresh token expired");
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh-token/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          refresh: token.refreshToken,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Refresh failed:", data);
      throw data;
    }

    console.log("✅ Access token refreshed");
    
    return {
      ...token,
      accessToken: data.access,
      accessTokenIssuedAt: Date.now(), // Reset issuance time
      refreshToken: data.refresh ?? token.refreshToken, // Use new refresh token if provided
    };
  } catch (error) {
    console.error("❌ Failed to refresh access token:", error);
    
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

/* -------------------------------------------------------------------------- */
/*                                 NextAuth                                   */
/* -------------------------------------------------------------------------- */

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET,

  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 days - matches refresh token expiry
  },

  callbacks: {
    /* ------------------------------- JWT ---------------------------------- */
    async jwt({ token, account, trigger, session: updateSession }) {
      // Handle session update if needed
      if (trigger === "update" && updateSession) {
        token.user = { ...token.user, ...updateSession };
      }

      /**
       * FIRST LOGIN:
       * Google → Your Backend → Your JWTs
       */
      if (account?.provider === "google" && account.access_token) {
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/google/`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                access_token: account.access_token,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            return token;
          }

          // Store tokens with timestamp
          token.accessToken = data.tokens.access;
          token.refreshToken = data.tokens.refresh;
          token.accessTokenIssuedAt = Date.now(); // Track when issued
          
          token.sub = String(data.user.pk);
          token.user = {
            id: String(data.user.pk),
            name: data.user.fullname,
            email: data.user.email,
          };

          console.log("✅ Initial login - Access token issued at:", new Date(token.accessTokenIssuedAt));
          return token;
        } catch (error) {
          console.error("❌ Google auth failed:", error);
          return token;
        }
      }

      /**
       * CHECK ACCESS TOKEN EXPIRY (1 hour = 3600000 ms)
       * We'll check if token was issued more than 1 hour ago
       */
      const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
      const tokenAge = Date.now() - (token.accessTokenIssuedAt || 0);
      
      // If token is less than 1 hour old, return it
      if (token.accessTokenIssuedAt && tokenAge < oneHourInMs) {
        // Optional: Log time remaining
        const timeLeft = Math.floor((oneHourInMs - tokenAge) / 60000);
        if (timeLeft < 5) {
          console.log(`⏰ Access token expires in ${timeLeft} minutes`);
        }
        return token;
      }

      /**
       * ACCESS TOKEN EXPIRED (1 hour passed) → REFRESH
       */
      console.log(`⏰ Access token expired (${Math.floor(tokenAge / 60000)} minutes old), refreshing...`);
      return await refreshAccessToken(token);
    },

    /* ----------------------------- SESSION -------------------------------- */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }

      session.accessToken = token.accessToken;
      session.error = token.error;

      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user,
        };
      }

      return session;
    },
  },

  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login on auth errors
  },

  events: {
    async signOut({ token }) {
      // Optional: Revoke refresh token on backend when user signs out
      if (token?.refreshToken) {
        try {
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/revoke-token/`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              refresh: token.refreshToken,
            }),
          });
          console.log("✅ Refresh token revoked on sign out");
        } catch (error) {
          console.error("❌ Failed to revoke refresh token:", error);
        }
      }
    },
  },

  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };