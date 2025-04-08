import "./globals.css";
import { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";
import Navbar from "@/components/Navbar";
import { ReactNode } from "react";
import { AudioProvider } from "@/lib/AudioContext";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react"; // Add Analytics import

export const metadata: Metadata = {
  title: "JojiArCH",
  description: "Complete Joji & his aliases discography",
  icons: {
    icon: "/favicon.svg",
  },
};

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai-looped",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en" className="dark" data-darkreader-lock>
        <body
          className={`${ibmPlexSansThaiLooped.variable} bg-background text-foreground font-sans pt-20`}
        >
          <AudioProvider>
            <div className="sticky top-0 w-full z-50">
              <Navbar />
            </div>
            <ClientWrapper>
              {children}
              <Analytics /> {/* Add Analytics here */}
            </ClientWrapper>
          </AudioProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
