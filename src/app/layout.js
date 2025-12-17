import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Aprofundir | Mercat de les Flors",
  description: "Recursos pedagògics i exploració d'espectacles familiars.",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ca">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}