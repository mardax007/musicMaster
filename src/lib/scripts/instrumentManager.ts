import { arrayRemove, arrayUnion, deleteDoc, getDoc, getDocs, query, setDoc, updateDoc, where } from "firebase/firestore";
import { getKnownInstrumentDocRef, getKnownInstrumentsCollectionRef, getSongInstrumentDocRef, getSongInstrumentsCollectionRef, getSongsCollectionRef } from "./documentReferences";
import type { Instrument, InstrumentUsed, Song } from "./types";
import { getSongs, incrementInstrumentCount } from "./songManager";

async function getKnownInstrument(name: string, projectId: string) {
    const q = query(
        getKnownInstrumentsCollectionRef(projectId),
        where("subnames", "array-contains", name)
    );
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map((doc) => {
        return {id: doc.id, ...doc.data()};
    });
    return data;
}

async function addSubname(projectId: string, instrumentId: string, subname: string | Array<string>) {
    const data = Array.isArray(subname) ? subname : [subname];
    await updateDoc(
        getKnownInstrumentDocRef(projectId, instrumentId),
        { subnames: arrayUnion(...data) });
}

async function removeSubname(projectId: string, instrumentId: string, subname: string | Array<string>) {
    const data = Array.isArray(subname) ? subname : [subname];
    const instrumentDocRef = getKnownInstrumentDocRef(projectId, instrumentId);

    const instrumentDoc = (await getDoc(instrumentDocRef)).data() as Instrument;
    instrumentDoc.subnames = instrumentDoc.subnames.filter((subname) => !data.includes(subname));
    if (instrumentDoc.subnames.length === 0) {
        await deleteDoc(instrumentDocRef);

        const songsCollection: Song[] = await getSongs(projectId);

        songsCollection.forEach(async (song) => {
            song.instruments.forEach(async (instrument: InstrumentUsed) => {
                if (instrument.id == instrumentId) {
                    await deleteDoc(getSongInstrumentDocRef(projectId, song.id, instrumentId));
                    return;
                }
            });
        });
    } else {
        await updateDoc(
            instrumentDocRef,
            { subnames: arrayRemove(...data) }
        );
    }
}

async function groupInstruments(parentId: string, childId: string, projectId: string) {
    const songsCollection: Song[] = await getSongs(projectId);

    const childInstrument = (await getDoc(getKnownInstrumentDocRef(projectId, childId))).data() as Instrument;
    const parentInstrument = (await getDoc(getKnownInstrumentDocRef(projectId, parentId))).data() as Instrument;

    songsCollection.forEach(async (song) => {
        song.instruments.forEach(async (instrument: InstrumentUsed) => {
            if (instrument.id == parentId) {
                incrementInstrumentCount(projectId, song.id, parentId, instrument.count ?? 1);
                addSubname(projectId, parentId, [childInstrument.name, ...childInstrument.subnames]);
            } else if (instrument.id == childId) {
                setDoc(getSongInstrumentDocRef(projectId, song.id, parentId), {
                    name: parentInstrument.name,
                    playedBy: instrument.playedBy ?? "",
                    count: instrument.count ?? 1
                } as InstrumentUsed);
            }

            await deleteDoc(getSongInstrumentDocRef(projectId, song.id, childId));
        });
    });

    await deleteDoc(getKnownInstrumentDocRef(projectId, childId));
    await updateDoc(getKnownInstrumentDocRef(projectId, parentId), {
        subnames: arrayUnion(childInstrument.name, ...childInstrument.subnames)
    });
}

async function renameInstrument(projectId: string, instrumentId: string, newName: string) {
    await updateDoc(
        getKnownInstrumentDocRef(projectId, instrumentId),
        {
            name: newName,
            subnames: arrayUnion(newName)
        }
    );

    const songsCollection: Song[] = await getSongs(projectId);

    songsCollection.forEach(async (song) => {
        song.instruments.forEach(async (instrument: InstrumentUsed) => {
            if (instrument.id == instrumentId) {
                await updateDoc(getSongInstrumentDocRef(projectId, song.id, instrumentId), {
                    name: newName
                } as InstrumentUsed);
                return;
            }
        });
    });
}

export { getKnownInstrument, addSubname, removeSubname, renameInstrument, groupInstruments };