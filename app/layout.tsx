import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/providers/provider";
import { ContextProvider } from "@/providers/ContextProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import NextTopLoader from 'nextjs-toploader';
import ClientOnly from "@/components/client-only";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sign Flow",
  description: "Sign Flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
      <NextTopLoader
          color="#D4AF37"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={true}
          easing="ease"
          speed={200}
          shadow="0 0 10px #D4AF37,0 0 5px #D4AF37"
        />
        <ClientOnly>
          {/* <SessionProvider> */}
            <Providers>
              <TooltipProvider delayDuration={150}>
                <ContextProvider>{children}</ContextProvider>
              </TooltipProvider>
            </Providers>
          {/* </SessionProvider> */}
        </ClientOnly>
      </body>
    </html>
  );
}
