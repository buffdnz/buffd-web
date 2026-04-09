import React from 'react';
import { Inter } from 'next/font/google';
import DarkModeToggle from '../components/DarkModeToggle';
import Navbar from '../components/Navbar';
import Banner from '../components/Banner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Buffd',
  description: 'Premium Car Cleaning Without the Premium Price',
};

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en">
      <body className={`${inter.className} pt-20 bg-black text-white antialiased`}>
        <Banner />
        <Navbar />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;