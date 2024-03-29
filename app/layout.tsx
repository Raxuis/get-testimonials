import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Get Testimonials",
  description: "Give testimonials on products by Raphaël | Raxuis"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <link rel="icon" href="/logo.svg" />
      <body className={cn(inter.className, "h-full")}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html >
  );
}
