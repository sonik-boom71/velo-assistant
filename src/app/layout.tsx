import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AppDataProvider } from "@/lib/storage";
import { TopBar } from "@/components/TopBar";
import { Nav } from "@/components/Nav";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Велоассистент",
  description: "Журнал ТО, чек-лист, питание и бюджет для велосипеда",
};

export const viewport: Viewport = {
  themeColor: "#0c0e0f",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={`${inter.variable} ${mono.variable}`}>
      <body className="font-sans antialiased">
        <AppDataProvider>
          <div className="mx-auto flex min-h-screen max-w-md flex-col pb-20">
            <TopBar />
            <main className="flex-1 px-4 py-4">{children}</main>
          </div>
          <Nav />
        </AppDataProvider>
      </body>
    </html>
  );
}
