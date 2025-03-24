import "./globals.css";
import { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper"; // Import the new ClientWrapper
import { ReactNode } from "react";
import Navbar from "@/components/Navbar";

// Metadata
export const metadata: Metadata = {
  title: "Music Archive",
  description: "A music archive organized by eras",
};

// Load IBM Plex Sans Thai Looped with all weights
const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai-looped",
  display: "swap",
});

// RootLayout: Server Component
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${ibmPlexSansThaiLooped.variable} bg-background text-foreground font-sans`}
      >
        <Navbar />
        <ClientWrapper>{children}</ClientWrapper>
      </body>
    </html>
  );
}
