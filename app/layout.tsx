import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OwlEats — Know what’s worth the walk",
  description: "A demo of personalized Rice dining notifications."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
