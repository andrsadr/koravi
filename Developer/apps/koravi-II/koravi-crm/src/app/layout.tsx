import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import ConditionalLayout from "@/components/layout/ConditionalLayout";
import { Toaster } from "@/components/ui/toaster";
import { ReducedMotionProvider } from "@/components/ui/ReducedMotion";
import { ErrorBoundary } from "@/components/ui/ErrorBoundary";
import { PerformanceMonitor } from "@/components/ui/PerformanceMonitor";

const outfit = Outfit({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Koravi CRM",
  description: "Modern CRM for beauty professionals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${outfit.variable} font-sans antialiased`}
      >
        <PerformanceMonitor />
        <ReducedMotionProvider>
          <ErrorBoundary>
            <ConditionalLayout>
              {children}
            </ConditionalLayout>
          </ErrorBoundary>
          <Toaster />
        </ReducedMotionProvider>
      </body>
    </html>
  );
}
