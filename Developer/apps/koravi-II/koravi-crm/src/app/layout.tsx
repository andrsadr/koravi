import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

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
        <AppLayout>
          {children}
        </AppLayout>
      </body>
    </html>
  );
}
