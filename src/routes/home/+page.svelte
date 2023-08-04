<script lang="ts">
	import { user, userData } from "$lib/scripts/stores";
</script>

{#if $user}
    <div id="wrapper">
        <h1>Welkom {($user?.displayName || $user?.displayName)}</h1>

        <h2>Jouw projecten</h2>
        <div id="projects">
            {#each $userData?.projects ?? [] as project}
                <a href="/project/{project.id}">{project.name}</a>
            {/each}
        </div>
        <button 
            id="createProject"
            on:click={() => window.location.href = "/project/create"}
        >Maak een nieuw project</button>
        <h2>Uitnodigingen</h2>
        <div id="invites">

        </div>
    </div>
{/if}