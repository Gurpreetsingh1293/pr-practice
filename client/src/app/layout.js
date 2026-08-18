import { Inter, Outfit } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', weight: ['400', '600', '700', '800'] });

export const metadata = {
  title: 'GraminLink — Rural SHG B2B Matchmaking Engine',
  description:
    'Connect rural Self-Help Groups with urban B2B buyers. Real-time inventory aggregation, geo-spatial matching, and milestone-based escrow for rural livelihoods.',
  keywords: 'SHG, rural, B2B, India, micro-entrepreneur, handicrafts, organic produce, Y4D Foundation',
  openGraph: {
    title: 'GraminLink',
    description: 'Bridge the gap between rural SHGs and urban B2B buyers.',
    type: 'website',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body className="font-sans">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
