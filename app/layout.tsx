// This file defines the root layout for the Next.js application.
// It sets up global styles, fonts, and metadata.
// The AdSense script is also included here to enable monetization across all pages.
import type { Metadata } from "next";
import localFont from "next/font/local";
import Script from 'next/script';
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
// import { SessionProvider } from "next-auth/react"; // No longer directly used here
import SessionProviderWrapper from "./session-provider-wrapper"; // Import the new wrapper
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Link from 'next/link';
import { SignInButton, SignOutButton } from '@/components/auth-buttons'; // Update import path

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Mark's gpt-4.1",
  description: "Iteration of the OpenAI Responses API",
  icons: {
    icon: "/gptpluspro.svg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <SessionProviderWrapper>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6692143545933427"
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
          <div className="flex h-screen bg-gray-200 w-full flex-col text-stone-900">
            <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
              <Link href="/" className="text-xl font-bold">
                Mark&apos;s GPT-4.1
              </Link>
              <div className="flex items-center gap-4">
                {session ? (
                  <>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Credits: {session.user.credits}
                      </span>
                      <SignOutButton />
                    </div>
                  </>
                ) : (
                  <SignInButton />
                )}
              </div>
            </header>
            <main className="flex-1 overflow-auto">{children}</main>
            <Analytics />
          </div>
          <Analytics />
        </body>
      </SessionProviderWrapper>
    </html>
  );
}
