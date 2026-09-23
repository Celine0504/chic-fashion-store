import './globals.css';
import { StoreProvider } from '@/context/StoreContext';
import AuthProvider from '@/components/AuthProvider';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata = {
  title: 'CHIC FASHION STORE | Modern Elegance',
  description: 'Timeless pieces. Contemporary style. Made for you.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-neutral-900 font-sans antialiased min-h-screen flex flex-col selection:bg-neutral-900 selection:text-white">
        <AuthProvider>
          <StoreProvider>
            <Navbar />
            <main className="flex-grow">{children}</main>
            <Footer />
          </StoreProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
