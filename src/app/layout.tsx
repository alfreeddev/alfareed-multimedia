import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Updated metadata for Al Fareed branding
export const metadata: Metadata = {
  title: "Al Fareed | Multimedia Solutions",
  description: "Elevate your brand with Al Fareed, your premier local destination for professional printing, custom marketing materials, and digital composing. We specialize in high-quality business cards, large-format banners, and bespoke brochures designed to convert. Whether you need expert graphic design or bulk commercial printing, our team delivers precision and fast turnaround times. Visit us today for a free quote on your next project!",
  icons: {
    icon: "/icon.png", // Points to the file in your public folder
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}