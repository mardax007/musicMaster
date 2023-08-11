<script lang="ts">
    import { page } from '$app/stores';
    import { get } from 'svelte/store';
    import Collaborator from '$lib/components/project/Collaborator.svelte';
	import { onMount } from 'svelte';
	import type { Instrument, InstrumentUsed, Project, Song } from '$lib/scripts/types';
	import { collection, deleteDoc, getFirestore, onSnapshot } from 'firebase/firestore';
    import { addNewInstrument, incrementInstrumentCount, setInstrumentPlayer } from '$lib/scripts/songManager';
	import SongItem from '$lib/components/project/SongItem.svelte';
	import KnownInstrument from '$lib/components/project/knownInstrument.svelte';
	import { openPopup } from '$lib/scripts/eventTriggerer';
	import CreateFile from '$lib/components/buttons/createFile.svelte';
	import { getCollaboratorInfo } from '$lib/scripts/projectManager';
	import { getKnownInstrumentsCollectionRef, getProjectDocRef, getSongDocRef, getSongInstrumentsCollectionRef, getSongsCollectionRef } from '$lib/scripts/documentReferences';

    let projectId = get(page).params.slug;
    let project: Project;
    let songId: string;
    let song: Song;

    onMount(() => {
        const urlParams = new URLSearchParams(window.location.search);
        songId = urlParams.get('songId') ?? "";

        onSnapshot(getProjectDocRef(projectId), (doc) => {
            project = doc.data() as Project;
        });

        onSnapshot(
            getSongsCollectionRef(projectId),
            (snapshot) => {
                project.songs = snapshot.docs.map((doc) => {
                    const data = {
                        id: doc.id,
                        ...doc.data()
                    } as unknown as Song;

                    return data;
                }) as Song[];
            }
        );

        onSnapshot(
            getKnownInstrumentsCollectionRef(projectId),
            (snapshot) => {
                project.knownInstruments = snapshot.docs.map((doc) => {
                    const data = doc.data();

                    return {
                        id: doc.id,
                        ...data
                    } as unknown as Instrument;
                }) as Instrument[];
            }
        );

        window.onpopstate = () => {
            setTimeout(() => {
                const urlParams = new URLSearchParams(window.location.search);
                songId = urlParams.get('songId') ?? "";
            }, 100);
        }
    })

    let unsubSong = () => {};
    let unsubInstruments = () => {};

    $: {
        if (songId) {
            unsubSong()
            unsubSong = onSnapshot(
                getSongDocRef(projectId, songId),
                (doc) => {
                    if (!doc.exists()) {
                        songId = "";
                        history.pushState({}, "", `/project/${projectId}`);
                        return;
                    };
                    song = doc.data() as Song;
                }
            );

            unsubInstruments()
            unsubInstruments = onSnapshot(
                getSongInstrumentsCollectionRef(projectId, songId),
                (snapshot) => {
                    song.instruments = snapshot.docs.map((songDoc) => {
                        const data = {
                            id: songDoc.id,
                            ...songDoc.data()
                        } as unknown as InstrumentUsed;

                        if ((data.count ?? 1) <= 0) {
                            deleteDoc(songDoc.ref);
                            return
                        }

                        return data;
                    }) as InstrumentUsed[];
                }
            );
        }
    }

    let instrumentSearch: string;
    let suggestedInstruments: Instrument[];
    $: {
        if(!instrumentSearch) instrumentSearch = "";
        suggestedInstruments = (project?.knownInstruments ?? []).filter((knownInstrument: Instrument) => {
            if (!knownInstrument) return
            return knownInstrument.subnames.some((subname) => {
                return subname.toLowerCase().includes(instrumentSearch.toLowerCase());
            });
        });

        if (!suggestedInstruments) suggestedInstruments = [];

        if (suggestedInstruments?.length == 0) suggestedInstruments = project?.knownInstruments ?? [];
    }
</script>

{#if project && !songId}
    <h1>{project.name}</h1>
    <p>{project.description} • {(new Date(project.createdAt)).toLocaleDateString('fr')}</p>
    <div id="collaborators">
        {#each project.collaborators as collaborator}
            <Collaborator {collaborator} projectId={projectId} />
        {/each}
        <Collaborator projectId={projectId} />
    </div>

    <div id="songs">
        <h2>Songs</h2>
        <div id="songList">
            {#each project.songs ?? [] as song}
                <SongItem {song} projectId={projectId} />
            {/each}
        </div>
    </div>

    <br>

    <div id="createSong">
        <CreateFile text="Create song" action={() => {
            openPopup(projectId, "createSong");
        }} />
    </div>

    <div id="knownInstruments">
        <h2>Instruments</h2>
        <div id="knownInstrumentList">
            {#each project.knownInstruments ?? [] as knownInstrument}
                {#if knownInstrument}
                    <KnownInstrument {knownInstrument} projectId={projectId} />
                {/if}
            {/each}
        </div>
    </div>
{:else if songId && song}
    <button on:click={() => {
        songId = "";
        history.pushState({}, "", `/project/${projectId}`);
    }}>Back</button>
    <h1>{song.name}</h1>
    <p>{(new Date(song.createdAt)).toLocaleDateString('fr')}</p>

    <div>
        <h2>Instruments</h2>
        {#each song.instruments ?? [] as instrument}
            {#if instrument}
                <p>
                    <input autocomplete="off" type="text" list="players" placeholder="Select player" value={instrument.playedBy ?? ""} on:blur={(e) => {
                        const newPlayer = e.target.value;
                        setInstrumentPlayer(projectId, song.id, instrument.id, newPlayer);
                    }} />
                    <button on:click={() => {
                        incrementInstrumentCount(projectId, song.id, instrument.id, 1);
                    }}>+</button>
                    <button on:click={() => {
                        incrementInstrumentCount(projectId, song.id, instrument.id, -1);
                    }}>-</button>
                    {instrument.name} - {instrument.count ?? 1}x
                </p>
            {/if}
        {/each}
        <datalist id="players">
            {#each project.collaborators as collaborator}
                {#await getCollaboratorInfo(collaborator) then collaboratorData}
                    <option value={collaboratorData.displayName}>
                {/await}
            {/each}
        </datalist>
        <form on:submit={async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const instrumentName = formData.get('instrumentName')?.toString();
            if (!instrumentName) {
                alert('Please enter an instrument name');
                return;
            }
            instrumentSearch = "";
            await addNewInstrument(instrumentName.trim(), projectId, song.id)
        }}>
            <input autocomplete="off" list="suggestions" bind:value={instrumentSearch} name="instrumentName" type="text" placeholder="Instrument name" />
            <input type="submit" value="Add" />
        </form>
        {#if project.knownInstruments.length > 0}
            <datalist id="suggestions">
                {#each suggestedInstruments ?? [] as suggestedInstrument}
                    <option value={suggestedInstrument.name}>
                {/each}
            </datalist>
        {/if}
    </div>
{/if}

<style lang="scss">
    #collaborators {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    #songList {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }

    #knownInstruments {
        margin-top: 2rem;
    }

    #knownInstrumentList {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
    }
</style>