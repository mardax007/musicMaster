import { addDoc, collection, deleteDoc, doc, getDoc, getFirestore, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { generateUID, importSong } from "./util";
import { projectID, projects, songs, existingInstruments, players, userInfo, invites } from "./stores";
import type { ExistingInstrument, Instrument, Song } from "./types";
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
let $songs = [] as Song[];
let $players = [] as any;
let $userInfo = {} as any;
let $projects = [] as any;
let $invites = [] as any;

existingInstruments.subscribe((value) => $existingInstruments = value);
projectID.subscribe((value) => $projectID = value);
songs.subscribe((value) => $songs = value);
players.subscribe((value) => $players = value);
userInfo.subscribe((value) => $userInfo = value);
projects.subscribe((value) => $projects = value);
invites.subscribe((value) => $invites = value);

async function updateExistingInstruments(instrument: string) {
    try {
        const projectRef = doc(db, `projects/${$projectID}`);
        await updateDoc(projectRef, {
            existingInstruments: [
                ...$existingInstruments,
                {
                    mainName: instrument,
                    names: [instrument],
                    uid: generateUID()
                }
            ]
        });
    } catch (err) {
        alert(`Could not update existing instruments.`)
    }
}

async function openProject(_projectID: string) {
    try {
        projectID.set(_projectID)

        if (_projectID == "") return;
        const projectRef = doc(db, `projects/${$projectID}`);
        onSnapshot(projectRef, (document) => {
            const data = document.data();
            if (!data) return;

            const tempSongs = []
            if (data.songs) data.songs.forEach(songs => {
                tempSongs.push(importSong(songs));
            });

            tempSongs.sort((a, b) => {
                if (a.creationDate > b.creationDate) return 1;
                if (a.creationDate < b.creationDate) return -1;
                return 0;
            });

            songs.set(tempSongs);
            existingInstruments.set(data.existingInstruments || []);
            players.set(data.players || []);

            cleanupSongs();
        });
    } catch (err) {
        alert(`Could not open project ${_projectID}.`);
    }
}

function cleanupSongs() {
    $songs.forEach((song: Song) => {
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
        members: [$userInfo.id]
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

async function saveSong(song: Song) {
    try {
        const projectRef = doc(db, `projects/${$projectID}/`);

        const temp: Song[] = $songs.filter((s) => s.uid !== song.uid);
        temp.push(song);

        await updateDoc(projectRef, {
            songs: temp.map((s: Song) => (s.export()))
        });
    } catch (err) {
        alert(`Could not save song ${song.uid}.`)
    }
}

async function deleteSong(uid: string) {
    try {
        const projectRef = doc(db, `projects/${$projectID}`);

        const data = $songs.map((s) => (s.export()));
        await updateDoc(projectRef, {
            songs: data.filter((s) => s.uid !== uid)
        });
    } catch (err) {
        alert(`Could not delete song ${uid}.`)
    }
}

async function combineInstruments(mainName: string, names: string[]) {
    try {
        const projectRef = doc(db, `projects/${$projectID}`);

        await updateDoc(projectRef, {
            existingInstruments: [
                ...$existingInstruments,
                {
                    mainName: mainName,
                    names: names,
                    uid: generateUID()
                }
            ]
        }).then(() => {
            cleanupSongs();
        });
    } catch (err) {
        alert(`Could not combine instruments ${names} to ${mainName}.`)
    }
}

async function createPlayer(name: string) {
    try {
        const projectRef = doc(db, `projects/${$projectID}`);

        await updateDoc(projectRef, {
            players: [
                ...$players,
                {
                    name: name,
                    uid: generateUID()
                }
            ]
        });
    } catch (err) {
        alert(`Could not create player ${name}.`)
    }
}

async function deletePlayer(uid: string) {
    try {
        const projectRef = doc(db, `projects/${$projectID}`);
        await updateDoc(projectRef, {
            players: $players.filter((p) => p.uid !== uid)
        });
    } catch (err) {
        alert(`Could not delete player ${uid}.`)
    }
}

async function deleteInstrument(id: string) {
    try {
        const instrumentRef = doc(db, `projects/${$projectID}`);

        await updateDoc(instrumentRef, {
            existingInstruments: $existingInstruments.filter((i) => i.uid !== id)
        }).then(() => {
            cleanupSongs();
        });
    } catch (err) {
        alert(`Could not delete instrument ${id}.`)
    }
}

async function signInWithGoogle() {
    try {
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
    } catch (err) {
        alert(`Could not sign in with Google.`)
    }
}

async function inviteUser(userEmail:string) {
    try {
        const userEmailIdIndex = doc(db, `userIndex/${await emailHash(userEmail)}`);
        const userEmailIdIndexDoc = await getDoc(userEmailIdIndex);
        const userId = userEmailIdIndexDoc.data()?.id;

        const projectRef = doc(db, `projects/${$projectID}`);
        const projectDoc = await getDoc(projectRef);
        const projectData = projectDoc.data();
        const members = new Set(projectData?.members);

        if (members.has(userId)) {
            alert(`User ${userEmail} is already an member of this project.`);
            return;
        }

        members.add(userId);

        try {
            const invitedUserRef = collection(db, `users/${userId}/invites`);
            await addDoc(invitedUserRef, {
                name: projectData?.name,
                uid: $projectID
            });
        } catch (err) {
            alert(`No access. ` + err)
        }


        await updateDoc(projectRef, {
            members: [
                ...(Array.from(members))
            ]
        });
    } catch (err) {
        alert(`Could not invite user ${userEmail}.`)
    }
}

async function acceptInvite(invite: any) {
    try {
        const userRef = doc(db, `users/${$userInfo.id}`);
        await updateDoc(userRef, {
            projects: [
                ...$projects,
                {
                    name: $invites.filter((i) => i.uid === invite.uid)[0].name,
                    uid: invite.uid
                }
            ]
        });

        await deleteDoc(doc(db, `users/${$userInfo.id}/invites/${invite.docID}`));


    } catch (err) {
        alert(`Could not accept invite for project ${invite.uid}.`)
    }
}

async function leaveProject(uid: string) {
    try {
        const projectRef = doc(db, `projects/${uid}`);
        const projectDoc = await getDoc(projectRef);
        const projectData = projectDoc.data();
        const members = new Set(projectData?.members);

        members.delete($userInfo.id);

        if (members.size == 0) {
            const projectRef = doc(db, `projects/${uid}`);
            deleteDoc(projectRef);
        } else {
            await updateDoc(projectRef, {
                members: [
                    ...(Array.from(members))
                ]
            });
        }

        const userRef = doc(db, `users/${$userInfo.id}`);
        await updateDoc(userRef, {
            projects: $projects.filter((p) => p.uid !== uid)
        });
    } catch (err) {
        alert(`Could not leave project ${uid}.`)
    }
}

async function emailHash(email: string) {
    const userEmailHashArraybuffer = await window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(email));
    return btoa(String.fromCharCode(...new Uint8Array(userEmailHashArraybuffer)));
}

onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userEmailIdIndex = doc(db, `userIndex/${await emailHash(user.email ?? user.displayName ?? "unknown")}`);
        await setDoc(userEmailIdIndex, {
            id: user.uid,
        });

        try {
            const userRef = doc(db, `users/${user.uid}`);
            onSnapshot(userRef, (doc) => {
                const projectsData = doc.data()?.projects || [];
                const userData = doc.data()?.info || {};
                userData.id = user.uid;

                console.log(doc.data())

                projects.set(projectsData);
                userInfo.set(userData);
            }, (err) => {
                console.log(err);
            });

            console.log(user.uid);
            const invitesRef = collection(db, `users/${user.uid}/invites`);
            onSnapshot(invitesRef, (snapshot) => {
                const invitesData = snapshot.docs.map((doc) => {
                    const data = doc.data();
                    data.docID = doc.id;
                    return data;
                });
                invites.set(invitesData);
            });
        } catch (err) {
            alert(`Could not load info.`)
        }
    }
});

export { updateExistingInstruments, openProject, createNewProject, saveSong, deleteSong, combineInstruments, createPlayer, deletePlayer, deleteInstrument, signInWithGoogle, inviteUser, acceptInvite, leaveProject }