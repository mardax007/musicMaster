import { getDoc, getDocs, increment, setDoc, updateDoc } from "firebase/firestore";
import { generateUID } from "./util";
import { getKnownInstrumentDocRef, getSongDocRef, getSongInstrumentDocRef, getSongInstrumentsCollectionRef, getSongsCollectionRef } from "./documentReferences";
import { getKnownInstrument } from "./instrumentManager";
import type { Instrument, Song } from "./types";

async function createNewSong(projectId: string, songName: string) {
    const songId = generateUID();

    await setDoc(
        getSongDocRef(projectId, songId),
        { name: songName, id: songId, createdAt: Date.now() }
    );
}

async function addNewInstrument(instrumentName: string, projectId: string, songId: string) {
    const knownInstrument = (await getKnownInstrument(instrumentName, projectId))[0];

    if (knownInstrument) {
        const instrumentRef = getSongInstrumentDocRef(projectId, songId, knownInstrument.id);
        const instrumentData = (await getDoc(instrumentRef));

        if (instrumentData.exists()) {
            await updateDoc(instrumentRef, {count: increment(1)});
        } else {
            await setDoc(instrumentRef, {name: instrumentName});
        }
    } else {
        const instrumentId = generateUID();

        const instrumentRef = getSongInstrumentDocRef(projectId, songId, instrumentId);
        await setDoc(instrumentRef, {name: instrumentName});

        const knownInstrumentRef = getKnownInstrumentDocRef(projectId, instrumentId);
        await setDoc(knownInstrumentRef, {name: instrumentName, subnames: [instrumentName]});
    }
}

async function incrementInstrumentCount(projectId: string, songId: string, instrumentId: string, amount: number) {
    const instrumentRef = getSongInstrumentDocRef(projectId, songId, instrumentId);
    await updateDoc(instrumentRef, {count: increment(amount)});
}

async function setInstrumentPlayer(projectId: string, songId: string, instrumentId: string, player: string) {
    const instrumentRef = getSongInstrumentDocRef(projectId, songId, instrumentId);
    await updateDoc(instrumentRef, {player: player});
}

async function getSongs(projectId: string) {
    const songsCollection: Song[] = await Promise.all((await getDocs(getSongsCollectionRef(projectId))).docs.map(async (doc) => {
        const instruments = (await getDocs(getSongInstrumentsCollectionRef(projectId, doc.id))).docs.map((doc) => {
            return {id: doc.id, ...doc.data()} as Instrument;
        });

        return {id: doc.id, instruments: instruments, ...doc.data()} as unknown as Song;
    }));

    return songsCollection;
}

export { createNewSong, addNewInstrument, incrementInstrumentCount, setInstrumentPlayer, getSongs };