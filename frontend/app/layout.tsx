import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "Findora — Campus Lost & Found",
  description:
    "One Campus. One Community. Every Belonging Matters. Connect with your campus community to report lost items and reunite found belongings.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F7F8F5] text-[#202B32] selection:bg-[#C9FD04] selection:text-[#142D3B]">
        {children}
      </body>
    </html>
  );
}
