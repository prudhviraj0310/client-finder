import './globals.css';

export const metadata = {
  title: 'Client Finder — Target · Analyze · Convert',
  description: 'AI-powered autonomous client acquisition platform',
  keywords: 'client acquisition, business intelligence, personalized outreach, lead generation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
