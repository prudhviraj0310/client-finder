import './globals.css';

export const metadata = {
  title: 'HexaInd TAC — Target · Analyze · Convert',
  description: 'Intelligent global outreach engine that maps businesses worldwide, analyzes their gaps, and converts them into clients through deeply personalized, problem-first communication.',
  keywords: 'client acquisition, business intelligence, personalized outreach, lead generation',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
