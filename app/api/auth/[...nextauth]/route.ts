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
      
      // ✅ Only run ONCE during Google sign-in
      if (account?.provider === "google" && account.access_token) {
        console.log("🔄 Processing Google authentication...");
        console.log("Access Token present:", account.access_token.substring(0, 20) + "...");
        
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/auth/google/`; // ✅ Added /api prefix
          console.log("🌐 Calling backend API:", apiUrl);
          console.log("📤 Request body:", JSON.stringify({ access_token: account.access_token }));
          
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({ 
              access_token: account.access_token 
            }),
          });

          console.log("📥 Response status:", response.status);
          console.log("📥 Response status text:", response.statusText);

          // Read response text
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
            
            console.log("📧 Beasky email:", data);
            // Check the structure of the response
            if (data) {
              console.log("🔑 Access token received:", data.access ? "Yes" : "No");
              console.log("👤 User PK:", data.user?.pk);
              console.log("👤 User name:", data.user?.fullname);
              console.log("📧 User email:", data.user?.email);
              
              token.accessToken = data.tokens.access;
              token.sub = String(data.user.pk);
              token.user = {
                id: String(data.user.pk),
                name: data.user.fullname,
                email: data.user.email,
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
      
      if (session.user) {
        session.user.id = token.sub;
      }
      
      if (token.accessToken) {
        session.accessToken = token.accessToken as string;
      }
      
      if (token.user) {
        session.user = {
          ...session.user,
          ...token.user
        };
      }
      
      console.log("✅ Final session object:", JSON.stringify(session, null, 2));
      return session;
    },
    
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
  
  debug: process.env.NODE_ENV === 'development',
});

export { handler as GET, handler as POST };
