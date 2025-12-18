import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

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
    async jwt({ token, account, user }) {
      console.log("🔐 JWT callback triggered");
      console.log("Token received:", JSON.stringify(token, null, 2));
      console.log("Account received:", JSON.stringify(account, null, 2));
      console.log("User received:", JSON.stringify(user, null, 2));
      
      // ✅ Only run ONCE during Google sign-in
      if (account?.provider === "google" && account.id_token) {
        console.log("🔄 Processing Google authentication...");
        console.log("ID Token present:", account.id_token.substring(0, 20) + "...");
        
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/google`;
          console.log("🌐 Calling backend API:", apiUrl);
          
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ token: account.id_token }),
          });

          console.log("📥 Response status:", response.status);
          console.log("📥 Response status text:", response.statusText);
          console.log("📥 Response headers:", Object.fromEntries(response.headers.entries()));

          // 🔐 IMPORTANT: read text first
          const text = await response.text();
          console.log("📥 Raw response text:", text);

          if (!response.ok) {
            console.error("❌ Backend error response:", {
              status: response.status,
              statusText: response.statusText,
              body: text
            });
            return token; // ⛔ prevent crash
          }

          console.log("✅ Backend API call successful");
          
          try {
            const data = JSON.parse(text);
            console.log("📊 Parsed response data:", JSON.stringify(data, null, 2));
            
            // Check the structure of the response
            if (data && data.data) {
              console.log("🔑 Access token received:", data.data.access ? "Yes" : "No");
              console.log("👤 User PK:", data.data.user?.pk);
              console.log("👤 User name:", data.data.user?.fullname);
              console.log("📧 User email:", data.data.user?.email);
              
              token.accessToken = data.data.access;
              token.sub = String(data.data.user.pk);
              token.user = {
                id: data.data.user.pk,
                name: data.data.user.fullname,
                email: data.data.user.email,
              };
            } else {
              console.warn("⚠️ Unexpected response structure:", data);
            }
          } catch (parseError) {
            console.error("❌ Failed to parse JSON response:", parseError);
            console.error("Raw text that failed to parse:", text);
          }
        } catch (error) {
          console.error("❌ JWT Google callback failed:", error);
          if (error instanceof Error) {
            console.error("Error details:", {
              name: error.name,
              message: error.message,
              stack: error.stack
            });
          }
          return token;
        }
      }
    
      // ✅ Persist values for future calls
      if (user) {
        console.log("💾 Persisting user data in token");
        token.accessToken = user.accessToken ?? token.accessToken;
        token.user = user ?? token.user;
      }
      
      console.log("🔄 Final token before returning:", JSON.stringify(token, null, 2));
      return token;
    },
    
    async session({ session, token }) {
      console.log("🔑 Session callback triggered");
      console.log("Session received:", JSON.stringify(session, null, 2));
      console.log("Token in session callback:", JSON.stringify(token, null, 2));
      
      if (session.user) {
        session.user.id = token.sub;
        console.log("🆔 Setting user ID:", token.sub);
      }
      
      if (token.accessToken) {
        session.accessToken = token.accessToken;
        console.log("🔑 Setting access token in session");
      }
      
      if (token.user) {
        session.user = token.user;
        console.log("👤 Setting user data in session:", JSON.stringify(token.user, null, 2));
      }
      
      console.log("✅ Final session object:", JSON.stringify(session, null, 2));
      return session;
    },
    
    // Optional: Add signIn callback for additional logging
    async signIn({ account, profile }) {
      console.log("👤 SignIn callback triggered");
      console.log("SignIn account:", JSON.stringify(account, null, 2));
      console.log("SignIn profile:", JSON.stringify(profile, null, 2));
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  
  // Enable debug mode for NextAuth logs
  debug: process.env.NODE_ENV === 'development',
  
  // Add logger configuration
  logger: {
    error(code, metadata) {
      console.error("❌ NextAuth Error:", code, metadata);
    },
    warn(code) {
      console.warn("⚠️ NextAuth Warning:", code);
    },
    debug(code, metadata) {
      console.debug("🐛 NextAuth Debug:", code, metadata);
    }
  }
});

export { handler as GET, handler as POST };