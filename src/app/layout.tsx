
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "CleanCSV — Remove Duplicate CSV Rows Online",
    template: "%s | CleanCSV",
  },
  description:
    "Clean CSV files in your browser. Find duplicate rows by email, ID, phone number, or selected columns, then download your cleaned data privately.",
  applicationName: "CleanCSV",
  keywords: [
    "CSV duplicate remover",
    "remove duplicate CSV rows",
    "CSV cleaner",
    "deduplicate spreadsheet",
    "CRM data cleaning",
  ],
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: "CleanCSV — Clean Your CSV Files",
    description:
      "Find duplicate records and export clean CSV files with browser-based processing.",
    type: "website",
    siteName: "CleanCSV",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
