export const metadata = {
  title: 'ChilizWinner',
  description: 'Sports stats and crypto rewards app',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}