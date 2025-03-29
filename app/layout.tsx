import "./globals.css";
import { Metadata } from "next";
import { IBM_Plex_Sans_Thai_Looped } from "next/font/google";
import ClientWrapper from "@/components/ClientWrapper";
import Navbar from "@/components/Navbar"; // Ensure this points to the right file
import { ReactNode } from "react";
import { AudioProvider } from "@/lib/AudioContext";

export const metadata: Metadata = {
  title: "JojiArCH",
  description: "Complete Joji & his aliases discography",
};

const ibmPlexSansThaiLooped = IBM_Plex_Sans_Thai_Looped({
  subsets: ["thai", "latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-ibm-plex-thai-looped",
  display: "swap",
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark" data-darkreader-lock>
      <body
        className={`${ibmPlexSansThaiLooped.variable} bg-background text-foreground font-sans pt-20`}
      >
        <AudioProvider>
          <div className="sticky top-0 w-full z-50">
            <Navbar />
          </div>
          <ClientWrapper>{children}</ClientWrapper>
        </AudioProvider>
      </body>
    </html>
  );
}
