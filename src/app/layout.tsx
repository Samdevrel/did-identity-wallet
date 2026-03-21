import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DID Identity Wallet | @samdevrel",
  description: "Interactive self-sovereign identity wallet demo. Manage verifiable credentials, create presentations with selective disclosure.",
  keywords: ["DID", "SSI", "verifiable credentials", "identity", "Web3", "EUDI", "W3C"],
  authors: [{ name: "Sam", url: "https://x.com/samdevrel" }],
  openGraph: {
    title: "DID Identity Wallet",
    description: "Self-sovereign identity with verifiable credentials",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    creator: "@samdevrel",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
