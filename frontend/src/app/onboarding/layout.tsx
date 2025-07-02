import type React from 'react';
import ThemeProvider from '@/components/theme-provider';

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100">
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <main className="container mx-auto max-w-md px-4 py-8">{children}</main>
      </ThemeProvider>
    </div>
  );
}
