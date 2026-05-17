import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  icons: {
    icon: "/icon.png",
  },
  title: {
    default: "The Halal Food Index — Find Halal Restaurants in the UK",
    template: "%s | The Halal Food Index",
  },
  description:
    "The UK's most comprehensive halal restaurant directory. Find HFA and HMC certified halal restaurants near you.",
  keywords: [
    "halal restaurants",
    "halal food UK",
    "halal certified",
    "HFA",
    "HMC",
    "Muslim food",
    "halal directory",
  ],
  openGraph: {
    title: "The Halal Food Index",
    description: "Find trusted halal restaurants across the UK.",
    siteName: "The Halal Food Index",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-GB" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{const t=localStorage.getItem('admin-theme')||'light';if(t==='dark'||(t==='system'&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
