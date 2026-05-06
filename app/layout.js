import './globals.css';
import ChatPanel from './components/ChatPanel';

export const metadata = {
  title: 'Caribbean AI Implementation Planner',
  description:
    'Build your country\'s working AI policy from the Caribbean AI Deployment Blueprint by Dr. Rohan Jowallah (2026). Includes plan upload and evaluation, action plan generation, and Word/PDF export.',
  keywords: [
    'Caribbean AI',
    'AI policy',
    'Caribbean AI Deployment Blueprint',
    'Jowallah',
    'CARICOM',
    'sovereign AI',
    'AI governance',
    'AI implementation plan'
  ],
  authors: [{ name: 'Dr. Rohan Jowallah' }],
  openGraph: {
    title: 'Caribbean AI Implementation Planner',
    description:
      'Turn the Caribbean AI Deployment Blueprint into a country-specific working policy document. Includes plan evaluation and action plan generation.',
    type: 'website'
  }
};

export const viewport = {
  themeColor: '#009B3A',
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        {children}
        <ChatPanel />
      </body>
    </html>
  );
}
