import { Song } from "./types";

function generateUID() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function importSong(data: Song) {
    const song = new Song(data.name);
    song.uid = data.uid;
    song.instruments = data.instruments;

    return song;
}

export { generateUID, importSong };