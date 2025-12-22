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
    accessTokenExpires?: number;
    user?: any;
    error?: string;
  }
}

/* -------------------------------------------------------------------------- */
/*                          Refresh Access Token Helper                        */
/* -------------------------------------------------------------------------- */

async function refreshAccessToken(token: any) {
  try {
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
      throw data;
    }

    return {
      ...token,
      accessToken: data.access,
      accessTokenExpires: Date.now() + data.expires_in * 1000,
      refreshToken: data.refresh ?? token.refreshToken, // supports rotation
    };
  } catch (error) {
    console.error("❌ Failed to refresh access token", error);

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
  },

  callbacks: {
    /* ------------------------------- JWT ---------------------------------- */
    async jwt({ token, account }) {
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

          token.accessToken = data.tokens.access;
          token.refreshToken = data.tokens.refresh;
          token.accessTokenExpires =
            Date.now() + data.tokens.expires_in * 1000;

          token.sub = String(data.user.pk);
          token.user = {
            id: String(data.user.pk),
            name: data.user.fullname,
            email: data.user.email,
          };

          return token;
        } catch (error) {
          return token;
        }
      }

      /**
       * TOKEN STILL VALID
       */
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      /**
       * TOKEN EXPIRED → REFRESH
       */
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

    async signIn() {
      return true;
    },
  },

  pages: {
    signIn: "/login",
  },

  debug: process.env.NODE_ENV === "development",
});

export { handler as GET, handler as POST };
