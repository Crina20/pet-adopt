"use client";

import { Geist, Geist_Mono } from "next/font/google";
import { FirebaseUserProvider } from "@/contexts/FirebaseUserContext"; // Import FirebaseUserContextProvider
import Loader from "@/components/loader"; // Your loader component
import "./globals.css";

// Add Google Fonts
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
  return (
    <FirebaseUserProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          {/* Children will have access to the user context */}
          {children}
        </body>
      </html>
    </FirebaseUserProvider>
  );
}
