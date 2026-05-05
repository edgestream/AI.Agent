import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agent Workspace",
  description: "Arbeitsplatz mit Agenten-Chat und dynamischer Webflaeche.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de" className="h-full">
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
