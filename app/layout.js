import './globals.css'
import { Toaster } from '@/components/ui/sonner'

export const metadata = {
  title: 'Grofience — Grow | Finance | Confidence',
  description: 'A premium teen finance tracker. Learn money management the fun, gamified way.',
  icons: {
    icon: '/grofience-logo.png',
    shortcut: '/grofience-logo.png',
    apple: '/grofience-logo.png',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Grofience',
  },
}

export const viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* PWA Manifest — required for "Add to Home Screen" on Android */}
        <link rel="manifest" href="/manifest.json" />

        {/* iOS Safari PWA support */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Grofience" />

        {/* iOS home screen icon */}
        <link rel="apple-touch-icon" href="/grofience-logo.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/grofience-logo.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/grofience-logo.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/grofience-logo.png" />

        {/* Android / Chrome theme */}
        <meta name="theme-color" content="#2563eb" />

        {/* iOS splash screen background */}
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/grofience-logo.png" />
      </head>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />

        {/* Service Worker Registration — enables PWA install on mobile */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[Grofience] PWA ready. Scope:', reg.scope);
                    })
                    .catch(function(err) {
                      console.warn('[Grofience] SW failed:', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
