import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";

// Extend the session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    accessToken?: string;
  }

  interface User {
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    user?: any;
  }
}

const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, user, account }) {
      // Only on initial sign in with Google or Microsoft
      if (
        (account?.provider === "google") &&
        account.id_token
      ) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/google`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: account.id_token }),
          }
        );
        const data = await response.json();
        console.log(data)
        if (response.ok) {
          token.accessToken = data.data.access;
          token.sub = data.data.user.pk; // Set sub to backend user id
          token.user = {
            id: data.data.user.pk,
            name: data.data.user.fullname,
            email: data.data.user.email,
          };
        } else {
          token.accessToken = undefined;
          token.user = undefined;
        }
      }

      // For subsequent calls, persist accessToken and user
      if (user) {
        token.accessToken = user.accessToken || token.accessToken;
        token.user = user || token.user;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub;
      }
      session.accessToken = token.accessToken;
      if (token.user) session.user = token.user;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export { handler as GET, handler as POST };
