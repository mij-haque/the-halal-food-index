import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://thehalalfoodindex.co.uk"),
  title: {
    default: "The Halal Food Index: Halal Restaurants in Greater Manchester",
    template: "%s | The Halal Food Index",
  },
  description:
    "Greater Manchester's halal food guide: restaurants, cafés and takeaways that say they are halal, plus the halal status of UK chains.",
  openGraph: {
    title: "The Halal Food Index",
    description: "Greater Manchester's halal food guide.",
    siteName: "The Halal Food Index",
    locale: "en_GB",
    type: "website",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB">
      <body>{children}</body>
    </html>
  );
}
