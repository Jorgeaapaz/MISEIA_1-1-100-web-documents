import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GlobalProvider } from "@/context/GlobalContext";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Web Documents",
  description: "Gestion de documentos web - sube, organiza y consulta tus archivos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <GlobalProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </GlobalProvider>
      </body>
    </html>
  );
}
