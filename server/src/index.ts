import express from "express";
import axios from "axios";
import { JSDOM } from "jsdom";
import cors from "cors";

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

// 🔧 decode les liens DuckDuckGo
function decodeDuckLink(rawLink: string): string | null {
    const match = rawLink.match(/uddg=([^&]+)/);
    return match ? decodeURIComponent(match[1]) : null;
}

// 🔍 scrape DuckDuckGo
async function searchDuckDuckGo(query: string): Promise<string[]> {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await axios.get(url, {
        headers: {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
        },
    });

    const dom = new JSDOM(res.data);
    const document = dom.window.document;

    const links = Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((href) => href.includes("duckduckgo.com/l/?uddg="))
        .map(decodeDuckLink)
        .filter(
            (href: any): href is string =>
                href.includes("spotify.com") || href.includes("deezer.com") || href.includes("youtube.com")
        );

    return [...new Set(links)];
}

// 🔎 fallback Deezer API
async function searchDeezer(artist: string, track: string): Promise<string | null> {
    const query = `${artist} ${track}`;
    const res = await axios.get("https://api.deezer.com/search", {
        params: { q: query },
    });

    return res.data?.data?.[0]?.link || null;
}

// 🔁 créer les deep links
function getDeepLinks({
    spotifyLink,
    deezerLink,
    youtubeLink,
}: {
    spotifyLink?: string | null;
    deezerLink?: string | null;
    youtubeLink?: string | null;
}) {
    const extractSpotifyId = (url?: any) => url?.match(/track\/([a-zA-Z0-9]+)/)?.[1];
    const extractDeezerId = (url?: any) => url?.match(/track\/(\d+)/)?.[1];
    const extractYouTubeId = (url?: any) => url?.match(/[?&]v=([^&]+)/)?.[1];

    const spotifyId = extractSpotifyId(spotifyLink);
    const deezerId = extractDeezerId(deezerLink);
    const youtubeId = extractYouTubeId(youtubeLink);

    return {
        spotifyUri: spotifyId ? `spotify:track:${spotifyId}` : null,
        deezerUri: deezerId ? `deezer://www.deezer.com/track/${deezerId}` : null,
        youtubeUri: youtubeId ? `vnd.youtube:${youtubeId}` : null,
    };
}

// 📡 Route principale
app.get("/search", async (req: any, res: any) => {
    const { artist, track } = req.query;

    if (!artist || !track) {
        return res.status(400).json({ error: "artist and track are required" });
    }

    const query = `${artist} ${track} site:spotify.com OR site:deezer.com OR site:youtube.com`;
    // console.log(await fetch`https://api.song.link/v1-alpha.1/links?url=${track}&userCountry=FR`);
    const ddgLinks = await searchDuckDuckGo(query);
    const deezerFallback = await searchDeezer(artist as string, track as string);
    const spotifyLink = ddgLinks.find((l) => l.includes("spotify.com")) || null;
    const youtubeLink = ddgLinks.find((l) => l.includes("youtube.com")) || null;
    const deezerLink = ddgLinks.find((l) => l.includes("deezer.com")) || deezerFallback;

    const { spotifyUri, deezerUri, youtubeUri } = getDeepLinks({ spotifyLink, deezerLink, youtubeLink });

    return res.json({
        links: { spotifyUri, deezerUri, youtubeUri },
    });
});

// ▶️ Lance le serveur
app.listen(3000, () => {
    console.log("Server is running");
    console.log("API running at http://0.0.0.0:3000/search");
});
