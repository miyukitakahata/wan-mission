import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'v0 App',
  description: 'Created with v0',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <AuthProvider>
        <body>{children}</body>
      </AuthProvider>
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
