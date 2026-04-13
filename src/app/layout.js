'use client';

import './globals.css';
import { AuthProvider } from '@/lib/AuthContext';
import { TaskProvider } from '@/lib/TaskContext';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <title>Client Finder — Target · Analyze · Convert</title>
        <meta name="description" content="AI-powered autonomous client acquisition platform" />
        <meta name="keywords" content="client acquisition, business intelligence, personalized outreach, lead generation" />
      </head>
      <body>
        <AuthProvider>
          <TaskProvider>
            {children}
          </TaskProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
