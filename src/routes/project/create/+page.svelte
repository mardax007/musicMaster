<script lang="ts">
	import { createNewProject } from "$lib/scripts/projectManager";
	import { user } from "$lib/scripts/stores";
</script>

<form on:submit={(e) => {
    e.preventDefault();

    const form = e.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    createNewProject({
        name: data.name.toString(),
        description: data.description.toString()
    }, $user?.uid ?? "Unknown user");
}}>
    <input type="text" name="name" placeholder="Project naam" />
    <input type="text" name="description" placeholder="Project beschrijving" />
    <input type="submit" value="Maak project aan" />
</form>