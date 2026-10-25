import { ClerkProvider } from '@clerk/nextjs';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import { StoreProvider } from '@/redux/StoreProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Hirentis | AI Interview Practice',
  description:
    'Practice technical interviews with an AI interviewer that reads your resume, asks follow-up questions and scores every answer.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <ClerkProvider>
          <StoreProvider>{children}</StoreProvider>
        </ClerkProvider>
        <Toaster richColors position="bottom-right" />
      </body>
    </html>
  );
}
