import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './styles/globals.css';
import { JSX } from 'react';
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps } from '@mantine/core';
import { theme } from './theme';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    template: '%s | Acme',
    default: 'Acme',
  },
  description: 'Example app with Next.js, Typescript with Effect TS, Tailwind CSS and deployed on Github pages',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): JSX.Element => (
  <html lang="en" {...mantineHtmlProps}>
    <head>
      <ColorSchemeScript />
    </head>
    <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <MantineProvider theme={theme}>{children}</MantineProvider>
    </body>
  </html>
);

export default RootLayout;
