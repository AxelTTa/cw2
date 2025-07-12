export const metadata = {
  title: 'Clutch',
  description: 'Sports stats and crypto rewards app',
}

export function generateViewport() {
  return {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  }
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body style={{
        margin: 0,
        padding: 0,
        overflowX: 'hidden'
      }}>{children}</body>
    </html>
  )
}