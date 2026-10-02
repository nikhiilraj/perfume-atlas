import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: {
    default: "Perfume Atlas — Find your next scent",
    template: "%s · Perfume Atlas",
  },
  description:
    "An independent perfume guide for India. Explore scent character, find your fit, and compare buying routes with honest evidence.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <SiteHeader />
        {children}
        <footer className="site-footer">
          <span>PERFUME ATLAS</span>
          <p>
            An independent guide. Descriptions help you shortlist; sampling
            helps you decide.
          </p>
          <a
            href="https://github.com/nikhiilraj/perfume-atlas"
            target="_blank"
            rel="noreferrer"
          >
            Open project
          </a>
        </footer>
      </body>
    </html>
  );
}
