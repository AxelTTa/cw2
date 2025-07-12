import Header from '../../components/Header'
import PlayerClient from './PlayerClient'

export async function generateStaticParams() {
  return []
}

export default function PlayerDetail() {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />
      <PlayerClient />
    </div>
  )
}