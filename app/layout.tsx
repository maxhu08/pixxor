import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { DialogProvider } from "@/components/dialogs/dialog-provider";
import { Navbar } from "@/components/navbar/navbar";
import { ThemeProvider } from "@/contexts/theme-context";
import { headers } from "next/headers";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get("x-nonce") || undefined;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <a
          href="#main-content"
          className="bg-primary text-md text-primary-foreground sr-only z-999 rounded-br-md focus:not-sr-only focus:absolute focus:px-4 focus:py-2"
        >
          Skip to content
        </a>
        <ThemeProvider disableTransitionOnChange nonce={nonce}>
          <Navbar />
          <main id="main-content">{children}</main>
          <DialogProvider />
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
