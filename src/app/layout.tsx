import type { Metadata } from "next";
import { Geist, Geist_Mono, Bebas_Neue, Montserrat } from "next/font/google"; // [MODIFIED]
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "@/lib/firebase/auth-context";
import { ThemeProvider } from "@/components/ThemeProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import PageTransition from "@/components/PageTransition";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const bebasNeue = Bebas_Neue({ // [NEW]
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({ // [NEW]
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://filmmuse.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "FilmMuse - Find the perfect film for your mood",
    template: "%s | FilmMuse",
  },
  description: "Discover films curated to your taste with mood-based discovery and curated lists",
  keywords: ["movies", "films", "recommendations", "watchlist", "film discovery"],
  authors: [{ name: "FilmMuse" }],
  creator: "FilmMuse",
  publisher: "FilmMuse",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "FilmMuse",
    title: "FilmMuse - Find the perfect film for your mood",
    description: "Discover films curated to your taste with mood-based discovery and curated lists",
  },
  twitter: {
    card: "summary_large_image",
    title: "FilmMuse - Find the perfect film for your mood",
    description: "Discover films curated to your taste with mood-based discovery and curated lists",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const stored = localStorage.getItem('filmMuse_theme');
                const theme = stored && ['light', 'dark', 'system'].includes(stored) ? stored : 'dark';
                let resolved = 'dark';
                if (theme === 'system') {
                  resolved = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                } else {
                  resolved = theme;
                }
                document.documentElement.classList.remove('light', 'dark');
                document.documentElement.classList.add(resolved);
              })();
            `,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://m.media-amazon.com" />
        <link rel="dns-prefetch" href="https://ia.media-imdb.com" />
        <link rel="dns-prefetch" href="https://img.omdbapi.com" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "FilmMuse",
              description: "Discover films curated to your taste with mood-based discovery and curated lists",
              url: siteUrl,
              applicationCategory: "EntertainmentApplication",
              operatingSystem: "Web",
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bebasNeue.variable} ${montserrat.variable} antialiased`} // [MODIFIED]
      >
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "rgba(10, 10, 10, 0.95)",
              color: "#fff",
              border: "1px solid rgba(16, 185, 129, 0.2)",
              borderRadius: "0.75rem",
              padding: "1rem",
              backdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            },
            success: {
              iconTheme: {
                primary: "#10b981",
                secondary: "#fff",
              },
              style: {
                border: "1px solid rgba(16, 185, 129, 0.3)",
              },
            },
            error: {
              iconTheme: {
                primary: "#ef4444",
                secondary: "#fff",
              },
              style: {
                border: "1px solid rgba(239, 68, 68, 0.3)",
              },
            },
            className: "font-sans",
          }}
        />
      </body>
    </html>
  );
}
