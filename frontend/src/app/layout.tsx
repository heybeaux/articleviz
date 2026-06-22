import type { Metadata } from "next";
import { Inter, Lexend, Atkinson_Hyperlegible } from "next/font/google";
import { PreferencesProvider } from "@/contexts/PreferencesContext";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const lexend = Lexend({
  subsets: ["latin"],
  variable: "--font-lexend",
  display: "swap",
});

const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-atkinson",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ArticleViz",
  description: "Transform articles into interactive visualizations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${lexend.variable} ${atkinson.variable}`}>
      <body className="antialiased">
        <PreferencesProvider>
          {children}
        </PreferencesProvider>
      </body>
    </html>
  );
}
