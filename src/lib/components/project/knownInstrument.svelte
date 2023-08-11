<script lang="ts">
	import { groupInstruments, removeSubname, renameInstrument } from "$lib/scripts/instrumentManager";
	import type { Instrument } from "$lib/scripts/types";

    export let knownInstrument: Instrument;
    export let projectId: string;

    function handleDragEnd(e) {
        const element = document.elementFromPoint(e.clientX, e.clientY);
        let closestKnownInstrument = element?.closest(".knownInstrument");

        if (closestKnownInstrument) {
            if (closestKnownInstrument.id !== knownInstrument.id) {
                groupInstruments(closestKnownInstrument.id, knownInstrument.id, projectId);
            }
        }
    }

    let selected = false;
</script>

<div id={knownInstrument.id} class="knownInstrument" draggable={!selected} on:dragend={handleDragEnd} role="button" tabindex="0">
    {#if selected}
        <form on:submit={() => {
            selected = false;
            renameInstrument(projectId, knownInstrument.id, knownInstrument.name);
        }}>
            <input bind:value={knownInstrument.name} type="text" placeholder="Subname" on:blur={() => {
                selected = false;
                renameInstrument(projectId, knownInstrument.id, knownInstrument.name);
            }} />
        </form>
    {:else}
        <button on:click={() => {
            selected = true;
        }}>
            <h3>{knownInstrument.name}</h3>
        </button>
    {/if}
    <div id="subnames">
        {#each knownInstrument.subnames as subname}
            <button tabindex="0" on:click={() => {
                removeSubname(projectId, knownInstrument.id, subname);
            }}>{subname}</button>
        {/each}
    </div>
</div>

<style lang="scss">
    .knownInstrument {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        border: 1px solid black;
        border-radius: 5px;
        padding: 5px;
        margin: 5px;
        cursor: grab;
        transition: all 0.2s ease-in-out;
    }

    .knownInstrument:hover {
        transform: scale(1.025);
    }

    button {
        background-color: transparent;
        border: none;
    }

    #subnames {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;

        button {
            background-color: transparent;
            border: none;
            padding: 0.25rem;
            margin: 0 0.5rem;
            border-radius: 0.5rem;
            box-shadow: 0 0 0.5rem #00000020;
            transition: all 0.2s ease-in-out;
        }

        button:hover {
            cursor: pointer;
            text-decoration: line-through;
            transform: scale(1.1);
        }
    }

    h3, input {
        margin: 0.5rem 0;
        z-index: 100;
    }
</style>
