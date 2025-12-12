import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientPermissionsProvider } from "@/components/ClientPermissionsProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - prevents invisible text during font load
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap", // Optimize font loading - prevents invisible text during font load
});

export const metadata: Metadata = {
  title: "BerryTap",
  description: "BerryTap application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientPermissionsProvider>
        {children}
        </ClientPermissionsProvider>
      </body>
    </html>
  );
}
