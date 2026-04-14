import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

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
    refreshTokenIssuedAt?: number; // Track when refresh token was issued
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
    // Use refreshTokenIssuedAt if available, otherwise fall back to accessTokenIssuedAt
    // This handles legacy tokens that might not have refreshTokenIssuedAt
    const refreshTokenIssuedAt = token.refreshTokenIssuedAt || token.accessTokenIssuedAt;
    
    if (refreshTokenIssuedAt) {
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;
      const refreshTokenAge = Date.now() - refreshTokenIssuedAt;
      
      if (refreshTokenAge > sevenDaysInMs) {
        console.error("❌ Refresh token expired (7 days)");
        throw new Error("Refresh token expired");
      }
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
      // If refresh token is invalid/expired, mark error
      if (response.status === 401 || response.status === 403) {
        throw new Error("Refresh token invalid or expired");
      }
      throw data;
    }

    console.log("✅ Access token refreshed");
    
    const now = Date.now();
    return {
      ...token,
      accessToken: data.access,
      accessTokenIssuedAt: now, // Reset access token issuance time
      refreshToken: data.refresh ?? token.refreshToken, // Use new refresh token if provided
      refreshTokenIssuedAt: data.refresh ? now : token.refreshTokenIssuedAt, // Update if new refresh token provided
      error: undefined, // Clear any previous errors
    };
  } catch (error) {
    console.error("❌ Failed to refresh access token:", error);
    
    // If refresh token is expired/invalid, mark for sign out
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isExpired = errorMessage.includes("expired") || errorMessage.includes("invalid");
    
    return {
      ...token,
      error: isExpired ? "RefreshAccessTokenError" : "RefreshAccessTokenError",
      accessToken: undefined, // Clear invalid access token
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/auth/login/`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                email: credentials.email,
                password: credentials.password,
              }),
            }
          );

          const data = await response.json();

          if (!response.ok) {
            console.error("❌ Login failed:", data);
            throw new Error(data.message || data.error || "Login failed");
          }

          // Unwrap the new { success, data } wrapper
          const payload = data.data || data;

          return {
            id: String(payload.user.id || payload.user.pk),
            name: payload.user.full_name || payload.user.fullname,
            email: payload.user.email,
            accessToken: payload.tokens.access,
            refreshToken: payload.tokens.refresh,
          };
        } catch (error) {
          console.error("❌ Auth error:", error);
          return null;
        }
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
    async jwt({ token, user, account, trigger, session: updateSession }) {
      // Handle session update if needed
      if (trigger === "update" && updateSession) {
        token.user = { ...token.user, ...updateSession };
      }

      /**
       * CREDENTIALS LOGIN:
       * email/password → Your Backend → Your JWTs
       */
      if (user && account?.provider === "credentials") {
        const u = user as any;
        const now = Date.now();
        token.accessToken = u.accessToken;
        token.refreshToken = u.refreshToken;
        token.accessTokenIssuedAt = now;
        token.refreshTokenIssuedAt = now;
        token.sub = u.id;
        token.user = {
          id: u.id,
          name: u.name,
          email: u.email,
        };
        console.log("✅ Credentials login - Tokens issued at:", new Date(now));
        return token;
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

          // Unwrap the new { success, data } wrapper
          const payload = data.data || data;

          // Store tokens with timestamp
          const now = Date.now();
          token.accessToken = payload.tokens.access;
          token.refreshToken = payload.tokens.refresh;
          token.accessTokenIssuedAt = now; // Track when access token was issued
          token.refreshTokenIssuedAt = now; // Track when refresh token was issued
          
          token.sub = String(payload.user.id || payload.user.pk);
          token.user = {
            id: String(payload.user.id || payload.user.pk),
            name: payload.user.full_name || payload.user.fullname,
            email: payload.user.email,
          };

          console.log("✅ Initial login - Tokens issued at:", new Date(now));
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
      
      // If no access token, return token (might be initial state or error state)
      if (!token.accessToken) {
        // If there's an error and no token, don't try to refresh
        if (token.error === "RefreshAccessTokenError") {
          return token;
        }
        // Otherwise, if we have a refresh token, try to get a new access token
        if (token.refreshToken) {
          return await refreshAccessToken(token);
        }
        return token;
      }

      // If no accessTokenIssuedAt, assume it's expired and refresh
      if (!token.accessTokenIssuedAt) {
        console.log("⏰ Access token has no issued timestamp, refreshing...");
        return await refreshAccessToken(token);
      }

      const oneHourInMs = 60 * 60 * 1000; // 1 hour in milliseconds
      const tokenAge = Date.now() - token.accessTokenIssuedAt;
      
      // If token is less than 1 hour old, return it
      if (tokenAge < oneHourInMs) {
        // Optional: Log time remaining when close to expiry
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

      // If refresh failed and no access token, session should be invalid
      if (token.error === "RefreshAccessTokenError" && !token.accessToken) {
        // The session will be invalid, client should handle sign out
        console.warn("⚠️ Session invalid - refresh token expired");
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