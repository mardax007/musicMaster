<script lang="ts">
    import { page } from '$app/stores';
	import { getProject } from '$lib/scripts/projectManager';
    import { get } from 'svelte/store';
    import Collaborator from '$lib/components/project/Collaborator.svelte';
	import { onMount } from 'svelte';
	import type { Project } from '$lib/scripts/types';
	import { collection, doc, getFirestore, onSnapshot } from 'firebase/firestore';

    let slug = get(page).params.slug;

    let project: Project;

    onMount(() => {
        const projectRef = doc(getFirestore(), "projects", slug);
        onSnapshot(projectRef, (doc) => {
            project = doc.data() as Project;
            console.log(project);
        });
        
        const songsRef = collection(getFirestore(), "projects", slug, "songs");
    })
</script>

{#if project}
    <h1>{project.name}</h1>
    <p>{project.description} • {(new Date(project.createdAt)).toLocaleDateString('fr')}</p>
    <div id="collaborators">
        {#each project.collaborators as collaborator}
            <Collaborator {collaborator} />
        {/each}
    </div>

    <div id="songs">
        <h2>Songs</h2>
        <div id="songList">
            {#each project.songs as song}
                <div class="song">
                    <h2>{song.name}</h2>
                    <p>{(new Date(song.createdAt)).toLocaleDateString('fr')}</p>
                </div>
            {/each}
        </div>

        <div id="createSong">
            <button on:click={
                () => {
                    document.getElementById('popup').style.display = 'flex';
                }
            }>Create a new song</button>
        </div>
    </div>

    <div id="knownInstruments">
        <h2>Instruments</h2>
        <div id="knownInstrumentList">
            {#each project.knownInstruments as knownInstrument}
                <div class="knownInstrument">
                    <h2>{knownInstrument.name}</h2>
                    <p>
                        {#each knownInstrument.types as type}
                            {type + ", "}
                        {/each}
                    </p>
                </div>
            {/each}
        </div>
    </div>
{/if}

<div id="popup" style="display: none">
    <div id="popupContent">
        <h1>Create a new song</h1>
        <input type="text" placeholder="Song name" />
        <button on:click={() => {
            document.getElementById('popup').style.display = 'none';
        }}>Create</button>
    </div>
</div>
