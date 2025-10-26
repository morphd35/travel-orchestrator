import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import GlobalNavigation from "@/components/GlobalNavigation";
import { AuthProvider } from "@/lib/auth";

// Initialize background watch monitoring (server-side only)
if (typeof window === 'undefined') {
  import('@/lib/backgroundMonitor');
}

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Conductor",
  description: "Build trips the easy way",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <AuthProvider>
          <GlobalNavigation />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
