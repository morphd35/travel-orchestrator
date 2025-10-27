import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";
import GlobalNavigation from "@/components/GlobalNavigation";
import { AuthProvider } from "@/lib/auth";
import { ThemeProvider } from "@/lib/themeContext";

// Background monitoring disabled - not suitable for Next.js server architecture
// Use external cron jobs or serverless functions for production monitoring
// if (typeof window === 'undefined') {
//   import('@/lib/backgroundMonitor');
// }

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Travel Conductor",
  description: "Build trips the easy way",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            <GlobalNavigation />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
