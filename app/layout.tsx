import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DialogProvider } from "@/components/dialogs/dialog-provider";
import { Navbar } from "@/components/navbar/navbar";
import { Toaster } from "sonner";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "pixxor",
  description:
    "Share your photos, add stunning effects, and organize albums effortlessly with pixxor.",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <Navbar />
        {children}
        <DialogProvider />
        <Toaster />
      </body>
    </html>
  );
}
