import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import { isClerkConfigured } from "@/lib/clerk-env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InfraPulse AI",
  description: "Infrastructure monitoring for servers, networks, and uptime.",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Clerk's provider throws when its publishable key is missing, so it is only
  // mounted once configuration is confirmed. Importing it lazily keeps Clerk's
  // key validation out of the unconfigured code path entirely.
  const clerkConfigured = isClerkConfigured();

  if (clerkConfigured) {
    const { ClerkProvider } = await import("@clerk/nextjs");
    children = <ClerkProvider>{children}</ClerkProvider>;
  }

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}