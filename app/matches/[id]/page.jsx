import Header from '../../components/Header'
import MatchClient from './MatchClient'

export async function generateStaticParams() {
  return []
}

export default function MatchDetail() {
  return (
    <div style={{
      backgroundColor: '#0a0a0a',
      color: '#ffffff',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <Header />
      <MatchClient />
    </div>
  )
}