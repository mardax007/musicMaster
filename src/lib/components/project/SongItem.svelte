<script lang="ts">
	import { deleteSong } from "$lib/scripts/projectManager";
	import type { Song } from "$lib/scripts/types";
	import DefaultButton from "../buttons/defaultButton.svelte";

    export let song: Song;
    export let projectId: string;
</script>

<buttton role="button" tabindex="0" on:keyup on:click={() => {
    window.history.pushState({}, '', `?songId=${song.id}`);
    window.location.href = `?songId=${song.id}`;
}} class="song">
    <div class="info">
        <h3>{song.name}</h3>
        <p>{(new Date(song.createdAt)).toLocaleDateString('fr')}</p>
    </div>
    <div class="buttons">
        <DefaultButton image="/icons/delete.svg" action={() => {
            deleteSong(projectId, song.id);
        }} text="Delete" />
    </div>
</buttton>

<style lang="scss">
    .song {
        display: flex;
        gap: 0.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 0 0.5rem #00000020;
        padding: 0.5rem;
        max-width: fit-content;
        transition: all 0.2s ease-in-out;
        cursor: pointer;
    }

    .song:hover {
        transform: scale(1.05);
    }

    .song .info {
        display: flex;
        flex-direction: column;

        justify-content: space-between;
        align-items: flex-start;
        gap: 0.5rem;

        h3 {
            margin: 0;
        }

        p {
            margin: 0;
            font-size: 0.8rem;
        }
    }

    .song .buttons {
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
        gap: 0.5rem;
    }
</style>