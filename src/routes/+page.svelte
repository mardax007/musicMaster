<script lang="ts">
	import { writable } from "svelte/store";
    import { GoogleAuthProvider, signInWithPopup, getAuth, onAuthStateChanged } from "firebase/auth";
    import { getFirestore, collection, getDocs, addDoc, doc, setDoc, getDoc, onSnapshot, deleteDoc, updateDoc } from "firebase/firestore";
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

    let userID: string | null = null;
    const existingInstruments = writable<ExistingInstrument[]>([]);
    const songs = writable<Song[]>([]);
    const newSong = writable<Song | null>(null);
    let selectedInstrument: string = "new";
    let instruments: Instrument[] = []

    type ExistingInstrument = {
        mainName: string;
        names: string[];
        uid: string;
    }

    type Instrument = {
        name: string;
        count: number;
        uid: string;
    }

    class Song {
        name: string;
        instruments: Instrument[] = [];
        uid: string;
        constructor(name: string) {
            this.name = name;
            this.uid = generateUID();
        }

        async addInstrument(instrument: string) {
            const existingInstrument = $existingInstruments.find((i) => i.names.includes(instrument));
            if (!existingInstrument) {
                const projectRef = doc(db, `projects/${projectID}`);
                console.log($existingInstruments);
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

            const mainName = existingInstrument ? existingInstrument.mainName : instrument;

            const existingInstrumentIndex = this.instruments.findIndex((i) => i.name === mainName);
            if (existingInstrumentIndex !== -1) {
                this.instruments[existingInstrumentIndex].count++;
            } else {
                this.instruments.push({
                    name: mainName,
                    count: 1,
                    uid: ""
                });
            }

            instruments = this.instruments;
        }
    }

    function generateUID() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }

    function createSong(name: string) {
        const song = new Song(name);
        newSong.set(song);
        instruments = song.instruments;
    }

    function cleanupSongs() {
        $songs.forEach(song => {
            for (let i = 0; i < song.instruments.length; i++) {
                const instrument = song.instruments[i];
                const existingInstrument = $existingInstruments.find((i) => i.names.includes(instrument.name));

                song.instruments[i].uid = existingInstrument?.uid || "";
                song.instruments[i].name = existingInstrument?.mainName || "";
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

            return newSong;
        });
    }

    let projectID: string | null = null;
    let projects: any[];

    onAuthStateChanged(auth, async (user) => {
        if (user) {
            userID = user.uid;

            const userRef = doc(db, `users/${userID}`);
            onSnapshot(userRef, (doc) => {
                if (!doc.exists()) {
                    setDoc(userRef, {
                        projects: []
                    });
                } else {
                    projects = doc.data()?.projects || [];
                }
            });
        }
    });

    async function signInWithGoogle() {
        const provider = new GoogleAuthProvider();
        signInWithPopup(auth, provider);
    }

    function addInstrument(e: Event) {
        e.preventDefault();

        const form = e.target;
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!data.instrument) return alert('Instrument is required');
        else $newSong?.addInstrument(data.instrument.toString());
    }

    function openProject(_projectID: string) {
        projectID = _projectID;

        const projectRef = doc(db, `projects/${projectID}`);
        onSnapshot(projectRef, (doc) => {
            const data = doc.data();
            
            if (!data) return;

            let tempSongs = []

            data.songs.forEach(songs => {
                tempSongs.push(importSong(songs));
            });
            
            $songs = data.songs || [];
            $existingInstruments = data.existingInstruments || [];

            cleanupSongs();
        });
    }

    function importSong(data: Song) {
        const song = new Song(data.name);
        song.uid = data.uid;
        song.instruments = data.instruments;

        return song;
    }
</script>

<div>
    <button on:click={signInWithGoogle}>Sign in with Google</button>
    <br>
    <br>
    {#if !projectID && projects}
        {#each projects as project}
            <button on:click={() => {
                openProject(project.uid);
            }}>{project.name}</button>
        {/each}
        <br>
        <br>
        <button on:click={async () => {
            const name = prompt("Project name");
            if (!name) return;

            const projectDirRef = collection(db, `projects`);
            const projectDir = await addDoc(projectDirRef, {
                name,
                owners: [userID]
            });

            const projectOwnedRef = doc(db, `users/${userID}`);
            updateDoc(projectOwnedRef, {
                projects: [
                    ...projects,
                    {
                        name,
                        uid: projectDir.id
                    }
                ]
            });
        }}>Create new</button>
    {/if}
    {#if projectID}
        {#if $newSong}
            <h1>{$newSong.name}</h1>
            <form on:submit={addInstrument}>
                <h2>Instruments</h2>
                {#each instruments as instrument}
                    <p>{instrument.name} - {instrument.count}x</p>
                    <button type="button" on:click={(e) => {
                        e.preventDefault();
                        if (instrument.count <= 1) {
                            instruments = instruments.filter((i) => i.name !== instrument.name);
                            $newSong.instruments = instruments;
                        } else {
                            instrument.count--;
                        }
                    }}>-</button>
                    <button type="button" on:click={(e) => {
                        e.preventDefault();
                        instrument.count++;
                    }}>+</button>
                {/each}
                <br>
                <br>
                <select bind:value={selectedInstrument} name="instrument" id="instrument">
                    <option value="new">New Instrument</option>
                    {#each $existingInstruments as instrument}
                        <option value={instrument.mainName}>{instrument.mainName}</option>
                    {/each}
                </select>
                {#if selectedInstrument === "new"}
                    <input type="text" name="instrument" id="instrument" placeholder="Instrument" />
                {/if}
                <button type="submit" >Add</button>
            </form>
            <button on:click={() => {
                if (!$newSong) return;
                const song = $newSong;
                newSong.set(null);

                const songRef = doc(db, `projects/${projectID}/`);
                
                const temp = $songs.filter((s) => s.uid !== song.uid);

                updateDoc(songRef, {
                    songs: [
                        ...temp,
                        {
                            name: song.name,
                            instruments: song.instruments,
                            uid: song.uid
                        }
                    ]
                });
            }}>Save</button>
        {:else}
            <h1>Songs</h1>
            <ul>
                {#each $songs as song}
                    <li>{song.name}</li>
                    <button on:click={() => {
                        newSong.set(importSong(song));
                        instruments = song.instruments;
                    }}>Edit</button>
                    <button on:click={() => {

                        const songRef = doc(db, `projects/${projectID}`);
                        updateDoc(songRef, {
                            songs: $songs.filter((s) => s.uid !== song.uid)
                        });
                    }}>Delete</button>
                {/each}
            </ul>
            <form on:submit={(e) => {
                e.preventDefault();

                const form = e.target;
                if (!form) return;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                if (!data.title) return alert('Title is required');
                else createSong(data.title.toString());
            }}>
                <input type="text" name="title" id="title" placeholder="Title" />
                <button type="submit">Create</button>
            </form>
            {#each $existingInstruments as instrument}
                <input type="checkbox" name="instrument" id="instrument" value={instrument.uid} />
                <p>{instrument.mainName}</p>
            {/each}
            <button on:click={() => {
                const mainName = prompt("Main name");
                if (!mainName) return;

                const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                const ids = Array.from(checkboxes).map((checkbox) => checkbox.value);
                const names = ids.map((id) => $existingInstruments.find((i) => i.uid === id)?.mainName || "");
                const otherNames = ids.map((id) => $existingInstruments.find((i) => i.uid === id)?.names || []).flat();

                ids.forEach(id => {
                    $existingInstruments = $existingInstruments.filter((i) => i.uid !== id)
                });

                const projectRef = doc(db, `projects/${projectID}`);

                const _names = new Set([...names, ...otherNames, mainName]);

                updateDoc(projectRef, {
                    existingInstruments: [
                        ...$existingInstruments,
                        {
                            mainName: mainName,
                            names: Array.from(_names),
                            uid: generateUID()
                        }
                    ]
                });

                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });
            }}>Combine</button>
            <button on:click={() => {
                const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
                const ids = Array.from(checkboxes).map((checkbox) => checkbox.value);

                ids.forEach(id => {
                    const instrumentRef = doc(db, `projects/${projectID}`);
                    updateDoc(instrumentRef, {
                        existingInstruments: $existingInstruments.filter((i) => i.uid !== id)
                    });
                });

                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });
            }}>Delete</button>
        {/if}
    {/if}
</div>

<style lang="scss">

</style>