import express from "express";
import axios from "axios";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
export const prisma = new PrismaClient();

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

// 🔎 fallback Deezer API
async function searchDeezer(artist: string, track: string): Promise<string | null> {
    const query = `${artist} ${track}`;
    const res = await axios.get("https://api.deezer.com/search", {
        params: { q: query },
    });
    return res.data?.data?.[0]?.link || null;
}

//ajouter le daily song a un user et ajouter le lien de toutes les plateformes qui sont liés
app.post("/daily-song", async (req: any, res: any) => {
    const { spotifyLink, deezerLink, youtubeLink } = req.body;
    const { user } = req.user;

    // const track = await prisma.track.create({
    //     data: {
    //         spotifyLink,
    //         deezerLink,
    //         youtubeLink,
    //     },
    // });
});

// 📡 Route principale
app.get("/search", async (req: any, res: any) => {
    const { artist, track } = req.query;

    if (!artist || !track) {
        return res.status(400).json({ error: "artist and track are required" });
    }

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
