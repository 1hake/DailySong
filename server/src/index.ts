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
    try {
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
    } catch (error) {
        console.error(error);
        return [];
    }
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
    console.log(deezerId);
    return {
        spotifyUri: spotifyId ? `spotify:track:${spotifyId}` : null,
        deezerUri: deezerId ? `https://dzr.page.link/${deezerId}` : null,
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
    const ddgLinks = await searchDuckDuckGo(query);
    const deezerUrl = await searchDeezer(artist as string, track as string);

    const allLinks = await axios.get(`https://api.song.link/v1-alpha.1/links?url=${deezerUrl}&userCountry=FR`);
    const allLinksObject = allLinks.data.entitiesByUniqueId as Record<string, any>;

    let spotifyId = undefined;
    let deezerId = undefined;
    let youtubeId = undefined;

    for (const key in allLinksObject) {
        if (key.startsWith("SPOTIFY_SONG::")) {
            spotifyId = key.replace("SPOTIFY_SONG::", "");
        } else if (key.startsWith("DEEZER_SONG::")) {
            deezerId = key.replace("DEEZER_SONG::", "");
        } else if (key.startsWith("YOUTUBE_VIDEO::")) {
            youtubeId = key.replace("YOUTUBE_VIDEO::", "");
        }
    }
    // console.log(spotifyId, deezerId, youtubeId);

    const spotifyLink = spotifyId ? `spotify:track:${spotifyId}` : null;
    const deezerLink = deezerId ? `https://dzr.page.link/${deezerId}` : null;
    const youtubeLink = youtubeId ? `https://music.youtube.com/watch?v=${youtubeId}` : null;

    return res.json({
        links: { spotifyLink, deezerLink, youtubeLink },
    });
});

// ▶️ Lance le serveur
app.listen(3000, () => {
    console.log("Server is running");
    console.log("API running at http://0.0.0.0:3000/search");
});
