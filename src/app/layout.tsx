import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SpentTracker",
  description: "Track monthly spending per category",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
