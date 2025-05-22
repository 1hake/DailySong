import { useState } from 'react'
import './App.css'

function App() {
  const [artist, setArtist] = useState('Stromae')
  const [track, setTrack] = useState('Papaoutai')
  const [result, setResult] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSearch = async () => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const url = `http://192.168.1.42:3000/search?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}`
      const response = await fetch(url)
      if (!response.ok) throw new Error('API error')
      const data = await response.text()
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="input-page">
      <h1>Song Search</h1>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          value={artist}
          onChange={e => setArtist(e.target.value)}
          placeholder="Artist"
          style={{ marginRight: 8 }}
        />
        <input
          type="text"
          value={track}
          onChange={e => setTrack(e.target.value)}
          placeholder="Track"
          style={{ marginRight: 8 }}
        />
        <button onClick={handleSearch} disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {result && (
        <pre style={{ background: '#f4f4f4', padding: 12, borderRadius: 4 }}>{result}</pre>
      )}
    </div>
  )
}

export default App
