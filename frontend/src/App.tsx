import { useState } from "react";
import "./App.css";

function App() {
  const [artist, setArtist] = useState("Stromae");
  const [track, setTrack] = useState("Papaoutai");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [platformLinks, setPlatformLinks] = useState<{ name: string; url: string }[]>([]);
  const [songInfo, setSongInfo] = useState<any>(null);

  const handleSearch = async () => {
    setLoading(true);
    setError(null);
    setPlatformLinks([]);
    setSongInfo(null);
    try {
      const url = `http://localhost:3000/search?artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(
        track
      )}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("API error");
      const data = await response.json();
      if (data && data.platformLinks) {
        setPlatformLinks(data.platformLinks);
      }
      setSongInfo(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="input-page" style={{ color: 'black', minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ background: '#fff', padding: 32, borderRadius: 16, boxShadow: '0 4px 24px rgba(0,0,0,0.08)', minWidth: 320, maxWidth: 400 }}>
        <h1 style={{ textAlign: 'center', marginBottom: 24, color: '#6366f1', fontWeight: 800, letterSpacing: 1 }}>🎵 Daily Song</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
          <input
            type="text"
            value={artist}
            onChange={(e) => setArtist(e.target.value)}
            placeholder="Artist"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #c7d2fe',
              fontSize: 16,
              outline: 'none',
              background: '#f1f5f9',
              transition: 'border 0.2s',
              color: 'black',
            }}
          />
          <input
            type="text"
            value={track}
            onChange={(e) => setTrack(e.target.value)}
            placeholder="Track"
            style={{
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid #c7d2fe',
              fontSize: 16,
              outline: 'none',
              background: '#f1f5f9',
              transition: 'border 0.2s',
              color: 'black',
            }}
          />
          <button
            onClick={handleSearch}
            disabled={loading}
            style={{
              padding: '10px 0',
              borderRadius: 8,
              border: 'none',
              background: '#6366f1',
              color: '#fff',
              fontWeight: 700,
              fontSize: 16,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              marginTop: 4,
              boxShadow: '0 2px 8px rgba(99,102,241,0.08)'
            }}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        {error && <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: 12 }}>{error}</div>}
        {songInfo && (
          <div style={{ background: '#f1f5f9', padding: 16, borderRadius: 10, marginBottom: 16, textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
            {songInfo.cover && <img src={songInfo.cover} alt="cover" style={{ maxWidth: 120, borderRadius: 8, marginBottom: 10, boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }} />}
            <div style={{ fontWeight: 700, fontSize: 18, color: '#6366f1', marginBottom: 2 }}>{songInfo.title}</div>
            <div style={{ color: '#334155', fontSize: 15 }}>{songInfo.artist}</div>
            {songInfo.album && <div style={{ color: '#64748b', fontSize: 14, marginTop: 2 }}>Album: {songInfo.album}</div>}
            {songInfo.year && <div style={{ color: '#64748b', fontSize: 14 }}>Year: {songInfo.year}</div>}
          </div>
        )}
        {platformLinks.length > 0 && (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
            {platformLinks.map((link) => (
              <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', background: '#eef2ff', borderRadius: 8, padding: '6px 12px', boxShadow: '0 1px 4px rgba(99,102,241,0.06)' }}>
                <img src={getPlatformIcon(link.name)} alt={link.name} style={{ width: 24, height: 24, marginRight: 8 }} />
                <span style={{ color: '#6366f1', fontWeight: 600, fontSize: 15 }}>{link.name}</span>
              </a>
            ))}
          </div>
        )}
      </div>
      <div style={{ marginTop: 32, color: '#a5b4fc', fontSize: 13, letterSpacing: 0.5 }}>Made with <span style={{ color: '#6366f1' }}>♥</span> using React & Vite</div>
    </div>
  );
}

// Helper function for platform icons
function getPlatformIcon(name: string): string {
  switch (name.toLowerCase()) {
    case 'spotify':
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/spotify.svg';
    case 'apple music':
    case 'applemusic':
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/applemusic.svg';
    case 'youtube':
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/youtube.svg';
    case 'deezer':
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/deezer.svg';
    case 'soundcloud':
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/soundcloud.svg';
    default:
      return 'https://cdn.jsdelivr.net/gh/simple-icons/simple-icons/icons/link.svg';
  }
}

export default App;
