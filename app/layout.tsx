import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "./_components/navbar";
import { Toaster } from "@/components/ui/sonner";
import { getCurrentSession } from "@/lib/auth/auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TIHLDE Quicksend",
  description: "Created by Mads Nylund",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  const token = await getCurrentSession();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-w-8xl mx-auto px-2 md:px-4 lg:px-8 bg-background`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar isAuthenticated={token ? true : false} />
          <main>
            {children}
          </main>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
