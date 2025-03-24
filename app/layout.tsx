import { AudioProvider } from "@/lib/AudioContext";
import AudioPlayer from "@/components/AudioPlayer";
import "./globals.css"; // Add this if missing

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AudioProvider>
          {children}
          <AudioPlayer />
        </AudioProvider>
      </body>
    </html>
  );
}
