import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'わん🐾みっしょん - ペットおせわアプリ',
  description:
    'お子さまとわんちゃんが一緒に成長できる、楽しいペットお世話体験アプリです。毎日のお世話を通して責任感と愛情を育みます。',
  keywords: 'ペット, 犬, お世話, 子供, 教育, 散歩, 餌やり, 家族',
  authors: [{ name: 'わん🐾みっしょんチーム' }],
  creator: 'わん🐾みっしょんチーム',
  publisher: 'わん🐾みっしょん',
  robots: 'index, follow',
  openGraph: {
    title: 'わん🐾みっしょん - ペットおせわアプリ',
    description:
      'お子さまとわんちゃんが一緒に成長できる、楽しいペットお世話体験アプリ',
    type: 'website',
    locale: 'ja_JP',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'わん🐾みっしょん - ペットおせわアプリ',
    description:
      'お子さまとわんちゃんが一緒に成長できる、楽しいペットお世話体験アプリ',
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const themeColor = '#f97316';

export const colorScheme = 'light';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

// Kodaiさんのlayout.tsx
// authProviderを追加してある
// import type React from "react";
// import { ThemeProvider } from "@/components/theme-provider";
// // imoprt AuthProvider

// export default function OnboardingLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">
//       <ThemeProvider
//         attribute="class"
//         defaultTheme="light"
//         enableSystem={false}
//       >
//         <AuthProvider>
//           <main className="container mx-auto max-w-md px-4 py-8">
//             {children}
//           </main>
//         </AuthProvider>
//       </ThemeProvider>
//     </div>
//   );
// }
