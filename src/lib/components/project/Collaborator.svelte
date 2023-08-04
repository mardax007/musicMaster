<script lang="ts">
	import { getCollaboratorInfo } from "$lib/scripts/additionalData";

    export let collaborator: string;
</script>

{#await getCollaboratorInfo(collaborator) then collaboratorData }
    <p>{collaboratorData.displayName}</p>
{/await}