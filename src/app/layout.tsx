import type { Metadata, Viewport } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Header from "@/components/Header";
import BreakingTicker from "@/components/BreakingTicker";
import Footer from "@/components/Footer";
import SearchModal from "@/components/SearchModal";
import Toast from "@/components/Toast";
import ScrollToTop from "@/components/ScrollToTop";
import AnalyticsTracker from "@/components/AnalyticsTracker";
import MobileBottomNav from "@/components/MobileBottomNav";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-vazirmatn",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0f17" },
  ],
};

export const metadata: Metadata = {
  title: "کوردتێک | KurdTech - یەکەمین مەگەزینی تەکنەلۆژیا و هەواڵی زیرەکی دەستکرد لە کوردستان",
  description:
    "نوێترین هەواڵەکانی تەکنەلۆژیا، زیرەکی دەستکرد، مۆبایل، پێداچوونەوە و نرخی ئامێرەکان لە بازاڕەکانی هەولێر، سلێمانی و دهۆک",
  keywords: ["کوردتێک", "KurdTech", "مۆبایل", "ئایفۆن", "سامسۆنگ", "نرخی دۆلار", "زیرەکی دەستکرد", "گەیمینگ", "کوردستان"],
  authors: [{ name: "تیمی تەکنیکی کوردتێک" }],
  openGraph: {
    title: "کوردتێک | KurdTech - مەگەزینی تەکنەلۆژیای کوردستان",
    description: "نوێترین هەواڵەکانی تەکنەلۆژیا، پێداچوونەوەی ڕەقەواڵە و نرخی ئامێرەکان لە کوردستان",
    siteName: "KurdTech",
    locale: "ckb_IQ",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ckb" dir="rtl" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const savedTheme = localStorage.getItem('kurdtech_theme');
                if (savedTheme === 'light') {
                  document.documentElement.classList.remove('dark');
                } else if (savedTheme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body
        className={`${vazirmatn.variable} font-sans bg-slate-50 dark:bg-[#0b0f17] text-slate-900 dark:text-slate-100 antialiased selection:bg-purple-600 selection:text-white min-h-screen flex flex-col transition-colors duration-200 relative overflow-x-hidden pb-20 lg:pb-0`}
      >
        {/* Ambient Glow Aurora Meshes */}
        <div className="fixed top-0 right-1/4 -translate-y-1/2 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-purple-600/10 dark:bg-purple-600/15 rounded-full blur-[120px] sm:blur-[140px] pointer-events-none -z-10" />
        <div className="fixed top-32 left-10 w-[280px] sm:w-[450px] h-[280px] sm:h-[450px] bg-indigo-600/10 dark:bg-indigo-600/12 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none -z-10" />
        <div className="fixed bottom-10 right-10 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-fuchsia-600/5 dark:bg-fuchsia-600/8 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none -z-10" />

        <AppProvider>
          <BreakingTicker />
          <Header />
          <div className="flex-1 flex flex-col">{children}</div>
          <Footer />
          <MobileBottomNav />
          <SearchModal />
          <Toast />
          <ScrollToTop />
          <AnalyticsTracker />
        </AppProvider>
      </body>
    </html>
  );
}
