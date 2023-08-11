<script lang="ts">
	import { acceptInvite, declineInvite, getProject } from "$lib/scripts/projectManager";
	import { user, userData } from "$lib/scripts/stores";
</script>

{#if $user}
    <div id="wrapper">
        <h1>Welkom {($user?.displayName || $user?.displayName)}</h1>

        <h2>Jouw projecten</h2>
        <div id="projects">
            {#each $userData?.projects ?? [] as projectId}
                {#await getProject(projectId) then projectData}
                    <a href="/project/{projectId}">{projectData.name}</a>
                {/await}
            {/each}
        </div>
        <button
            id="createProject"
            on:click={() => window.location.href = "/project/create"}
        >Maak een nieuw project</button>
        <h2>Uitnodigingen</h2>
        <div id="invites">
            {#each $userData?.invites ?? [] as invite}
                <div class="invite">
                    {#await getProject(invite.id) then project}
                        <h3>{project.name}</h3>
                    {/await}
                    <button
                        on:click={() => {
                            window.location.href = "/project/" + invite.id;
                            acceptInvite(invite.id, ($user?.uid || ""))
                        }}
                    >Accepteer</button>
                    <button
                        on:click={() => {
                            declineInvite(invite.id, ($user?.uid || ""))
                        }}
                    >Weiger</button>
                </div>
            {/each}
        </div>
    </div>
{/if}