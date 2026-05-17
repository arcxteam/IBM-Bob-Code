import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legacy Code Master Agent — IBM Bob Hackathon",
  description: "AI-powered development tool that helps developers understand, maintain, and improve legacy codebases. Powered by IBM Bob with full repository context understanding.",
  keywords: ["IBM Bob", "Hackathon", "Code Analysis", "AI Development", "Legacy Code", "Refactoring", "Documentation"],
  authors: [{ name: "Bob Agent Team" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Legacy Code Master Agent",
    description: "Turn any complex codebase into a well-documented, maintainable system. Powered by IBM Bob.",
    url: "/",
    siteName: "Bob Agent",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Legacy Code Master Agent",
    description: "AI-powered legacy code analysis tool for IBM Bob Hackathon",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
