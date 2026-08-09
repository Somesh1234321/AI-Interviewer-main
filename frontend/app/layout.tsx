import type { Metadata } from "next";
import { Inter } from "next/font/google";

import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";

import "../app/globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AI Interview Agent",
    template: "%s | AI Interview Agent",
  },
  description: "Practice interviews with an AI-powered interview agent.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} relative flex min-h-screen flex-col overflow-x-hidden`}>
        {/* Animated background blobs */}
        <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
          <div className="absolute -left-32 -top-32 h-96 w-96 animate-blob rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-[28rem] w-[28rem] animate-blob rounded-full bg-violet/20 blur-3xl [animation-delay:2s]" />
          <div className="absolute bottom-0 left-1/3 h-80 w-80 animate-blob rounded-full bg-fuchsia-400/20 blur-3xl [animation-delay:4s]" />
        </div>

        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
