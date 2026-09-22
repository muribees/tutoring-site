import type { Metadata } from "next";
import { Newsreader, Figtree } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { site } from "@/content";
import "./globals.css";

const display = Newsreader({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const body = Figtree({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: `${site.name} · Tutoring`,
  description:
    "Math, Spanish, and computer science tutoring with Maria Uribe Estrada, a senior at Palo Alto High School.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
