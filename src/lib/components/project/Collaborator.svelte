<script lang="ts">
	import { openPopup } from "$lib/scripts/eventTriggerer";
	import { getCollaboratorInfo, removeColab } from "$lib/scripts/projectManager";

    export let collaborator: string | undefined = undefined;
    export let projectId: string;
</script>


{#if collaborator}
    {#await getCollaboratorInfo(collaborator) then collaboratorData }
        <button on:click={() => {
            removeColab(projectId, collaboratorData.id)
        }}>
            <img src={collaboratorData.photoURL} width="24px" height="24px" alt={collaboratorData.displayName} />
        </button>
    {/await}
{:else}
    <button on:click={() => {
        openPopup(projectId, "addColab");
    }}>
        <img src="/icons/plus.svg" alt="Add collaborator" width="24px" height="24px">
    </button>
{/if}

<style lang="scss">
    button {
        border: none;
        background: none;
        cursor: pointer;
        border-radius: 50%;
        padding: 0;
        margin: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s ease-in-out;
    }

    button:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

    img {
        border-radius: 50%;
    }
</style>