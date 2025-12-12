import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/providers/SessionProvider";
import { Provider } from "@/providers/provider";
import { ContextProvider } from "@/providers/ContextProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
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
      <body className={inter.className}>
        <ClientOnly>
          {/* <SessionProvider> */}
            <Provider>
              <TooltipProvider delayDuration={150}>
                <ContextProvider>{children}</ContextProvider>
              </TooltipProvider>
            </Provider>
          {/* </SessionProvider> */}
        </ClientOnly>
      </body>
    </html>
  );
}
