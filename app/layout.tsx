import type { Metadata } from "next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import { DM_Mono, Outfit, Syne } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-syne",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: {
    default: "HR Intelligence — MLB Home Run Prop Analytics",
    template: "%s | HR Intelligence",
  },
  description:
    "AI-powered MLB home run and laser prop analytics. xDinger scores, zone heat maps, pitch splits, and handedness edge data for serious bettors.",
  keywords: [
    "MLB home run props",
    "baseball prop betting",
    "home run predictions",
    "MLB analytics",
    "baseball betting analytics",
    "xDinger",
    "laser props",
    "MLB prop bets today",
    "baseball statcast betting",
    "home run prop picks",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "HR Intelligence",
    title: "HR Intelligence — MLB Home Run Prop Analytics",
    description:
      "The sharpest MLB prop analytics tool on the market. xDinger scores, zone heat maps, pitch splits, laser props.",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "HR Intelligence Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HR Intelligence — MLB Home Run Prop Analytics",
    description:
      "xDinger scores, zone heat maps, pitch splits. The data edge serious bettors need.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistSans.variable} ${GeistMono.variable} dark`}
      suppressHydrationWarning
    >
      <body
        className={`${outfit.variable} ${dmMono.variable} ${syne.variable} min-h-screen bg-[#18181B] text-[#F4F4F5] font-[family-name:var(--font-outfit)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
