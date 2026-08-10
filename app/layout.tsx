import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Barangay San Pedro",
    template: "%s | Barangay San Pedro",
  },
  description:
    "Official website of Barangay San Pedro, Bacacay, Albay — document requests, announcements, and barangay services.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
