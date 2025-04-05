"use client";

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/firebase/config"; // Update to match your Firebase config path
import { useRouter } from "next/navigation";
import Loader from "@/components/loader"; // Path to your loader component
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [user, loading] = useAuthState(auth); // Firebase hook to track auth state
  const router = useRouter();

  console.log({ user });
  useEffect(() => {
    if (!loading && !user) {
      router.push("/sign-in"); // Redirect to sign-in if user is not authenticated
      return;
    }
  });

  if (loading)
    return (
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <Loader />
        </body>
      </html>
    ); // Show loader while checking auth state

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
