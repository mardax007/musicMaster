import { addDoc, collection, deleteDoc, doc, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { generateUID, importSong } from "./util";
import { projectID, projects, songs, existingInstruments, players, userInfo } from "./stores";
import type { ExistingInstrument, Instrument } from "./types";
import { GoogleAuthProvider, getAuth, onAuthStateChanged, signInWithPopup } from "firebase/auth";
import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyDUNw2CbgUulP1b6dFNuCs3G-mre-JluwY",
    authDomain: "music--master.firebaseapp.com",
    projectId: "music--master",
    storageBucket: "music--master.appspot.com",
    messagingSenderId: "530014715765",
    appId: "1:530014715765:web:13c4604451ae8637badd3c",
    measurementId: "G-E9NW3W3HCK"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let $existingInstruments = [] as ExistingInstrument[];
let $projectID = "";
let $songs = [] as any;
let $players = [] as any;
let $userInfo = {} as any;

existingInstruments.subscribe((value) => $existingInstruments = value);
projectID.subscribe((value) => $projectID = value);
songs.subscribe((value) => $songs = value);
players.subscribe((value) => $players = value);
userInfo.subscribe((value) => $userInfo = value);

function updateExistingInstruments(instrument: string) {
    const projectRef = doc(db, `projects/${$projectID}`);
    updateDoc(projectRef, {
        existingInstruments: [
            ...$existingInstruments,
            {
                mainName: instrument,
                names: [instrument],
                uid: generateUID()
            }
        ]
    });
}

function openProject(_projectID: string) {
    projectID.set(_projectID)

    if (_projectID == "") return;
    const projectRef = doc(db, `projects/${$projectID}`);
    onSnapshot(projectRef, (doc) => {
        const data = doc.data();
        if (!data) return;

        const tempSongs = []
        if (data.songs) data.songs.forEach(songs => {
            tempSongs.push(importSong(songs));
        });
        
        songs.set(data.songs || []);
        existingInstruments.set(data.existingInstruments || []);
        players.set(data.players || []);

        cleanupSongs();
    });
}

function cleanupSongs() {
    $songs.forEach(song => {
        for (let i = 0; i < song.instruments.length; i++) {
            const instrument = song.instruments[i];
            const existingInstrument = $existingInstruments.find((i) => i.names.includes(instrument.name));

            song.instruments[i].uid = existingInstrument?.uid || generateUID();
            song.instruments[i].name = existingInstrument?.mainName || generateUID();
        }

        song.instruments = song.instruments.reduce((acc: Instrument[], instrument) => {
            const existingInstrumentIndex = acc.findIndex((i) => i.uid === instrument.uid);
            if (existingInstrumentIndex !== -1) {
                acc[existingInstrumentIndex].count += instrument.count;
            } else {
                acc.push(instrument);
            }

            return acc;
        }, []);

        song.instruments = song.instruments.filter((i) => i.uid !== "");
    });
}

async function createNewProject(name: string, projects: any) {
    const projectDirRef = collection(db, `projects`);
    const projectDir = await addDoc(projectDirRef, {
        name,
        owners: [$userInfo.id]
    });

    const projectOwnedRef = doc(db, `users/${$userInfo.id}`);
    updateDoc(projectOwnedRef, {
        projects: [
            ...projects,
            {
                name,
                uid: projectDir.id
            }
        ]
    });
}

function deleteProject(uid: string, projects: any) {
    const projectRef = doc(db, `projects/${uid}`);
    deleteDoc(projectRef);

    const userRef = doc(db, `users/${$userInfo.uid}`);
    updateDoc(userRef, {
        projects: projects.filter((p) => p.uid !== uid)
    });
}

function saveSong(song: any) {
    const projectRef = doc(db, `projects/${$projectID}/`);
    
    const temp = $songs.filter((s) => s.uid !== song.uid);

    updateDoc(projectRef, {
        songs: [
            ...temp,
            {
                name: song.name,
                instruments: song.instruments,
                uid: song.uid
            }
        ]
    });
}

function deleteSong(uid: string) {
    const projectRef = doc(db, `projects/${$projectID}`);
    updateDoc(projectRef, {
        songs: $songs.filter((s) => s.uid !== uid)
    });
}

function combineInstruments(mainName: string, names: string[]) {
    const projectRef = doc(db, `projects/${$projectID}`);

    console.log($existingInstruments);

    updateDoc(projectRef, {
        existingInstruments: [
            ...$existingInstruments,
            {
                mainName: mainName,
                names: names,
                uid: generateUID()
            }
        ]
    });
}

function createPlayer(name: string) {
    const projectRef = doc(db, `projects/${$projectID}`);

    updateDoc(projectRef, {
        players: [
            ...$players,
            {
                name: name,
                uid: generateUID()
            }
        ]
    });
}

function deletePlayer(uid: string) {
    const projectRef = doc(db, `projects/${$projectID}`);
    updateDoc(projectRef, {
        players: $players.filter((p) => p.uid !== uid)
    });
}

function deleteInstrument(id: string) {
    const instrumentRef = doc(db, `projects/${$projectID}`);

    updateDoc(instrumentRef, {
        existingInstruments: $existingInstruments.filter((i) => i.uid !== id)
    });
}

async function signInWithGoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, `users/${user.uid}`);
        onSnapshot(userRef, (doc) => {
            if (!doc.exists()) {
                setDoc(userRef, {
                    projects: [],
                    info: {
                        name: user.displayName,
                        email: user.email,
                    }
                });
            } else {
                projects.set(doc.data()?.projects || []);
                const userData = doc.data()?.info || {};
                userData.id = user.uid;
                userInfo.set(userData);
            }
        });
    }
});

export { updateExistingInstruments, openProject, deleteProject, createNewProject, saveSong, deleteSong, combineInstruments, createPlayer, deletePlayer, deleteInstrument, signInWithGoogle }