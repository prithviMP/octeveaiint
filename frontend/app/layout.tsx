import type { Metadata } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { AmbientBackground } from "@/components/layout/AmbientBackground";
import { ColdStartBanner } from "@/components/layout/ColdStartBanner";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { HealthProvider } from "@/hooks/useHealth";
import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-geist" });
const jetbrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains-mono" });

export const metadata: Metadata = {
  title: { default: "AI Interview Coach", template: "%s · AI Interview Coach" },
  description: "Practice technical interview questions and track your performance.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <body className="relative min-h-screen font-sans antialiased">
        <AmbientBackground />
        <HealthProvider>
          <div className="relative z-10 flex min-h-screen flex-col">
            <ColdStartBanner />
            <SiteHeader />
            <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">{children}</main>
            <SiteFooter />
          </div>
        </HealthProvider>
      </body>
    </html>
  );
}
