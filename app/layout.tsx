import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Toneforge — Guitar Tone Lab", description: "Build inspired-by guitar tones in your browser." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
