<script lang="ts">
	import { Song } from "$lib/scripts/types";
    import { existingInstruments as existingInstrumentsWriteable, newSong, songs, projectID, projects, players, instruments, userInfo } from "$lib/scripts/stores";
	import { importSong } from "$lib/scripts/util";
	import { combineInstruments, createNewProject, createPlayer, deleteInstrument, deletePlayer, deleteProject, deleteSong, openProject, saveSong, signInWithGoogle } from "$lib/scripts/databaseControl";

    let selectedInstrument: string = "new";

    function createSong(name: string) {
        const song = new Song(name);
        newSong.set(song);
        $instruments = song.instruments;
    }

    async function addInstrument(e: Event) {
        e.preventDefault();

        const form = e.target;
        if (!form) return;

        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());

        if (!$newSong) return
        if (!data.instrument) return alert('Instrument is required');
        else $instruments = await $newSong.addInstrument(data.instrument.toString());

        form.reset();
    }
</script>

<div>
    <button on:click={signInWithGoogle}>Sign in with Google</button>
    {#if $userInfo.id && $projectID}
        <button on:click={() => {
            openProject("");
        }}>Close project</button>
    {/if}
    <br>
    <br>
    {#if !$projectID && $projects && $userInfo.id}
        <ul>
            {#each $projects as project}
                <li>
                    {project.name}
                    <button on:click={() => {
                        openProject(project.uid);
                    }}>Open</button>
                    <button on:click={() => {
                        deleteProject(project.uid, $projects);
                    }}>Delete</button>
                </li>
            {/each}
        </ul>
        <br>
        <br>
        <button on:click={async () => {
            const name = prompt("Project name") || "";
            createNewProject(name, $projects);
        }}>Create new</button>
    {:else if $userInfo.id}
        {#if $newSong}
            <h1>{$newSong.name}</h1>
            <button on:click={() => {
                console.log($instruments)
            }}>Run</button>
            <form on:submit={addInstrument}>
                <h2>Instruments</h2>
                {#each $instruments as instrument}
                    <p>{instrument.name} - {instrument.count}x
                        <select bind:value={instrument.playerID}>
                            <option value="">none</option>
                            {#each $players as i}
                                <option value={i.uid}>{i.name}</option>
                            {/each}
                        </select>
                    </p>
                    <button type="button" on:click={(e) => {
                        e.preventDefault();
                        if (instrument.count <= 1) {
                            $instruments = $instruments.filter((i) => i.name !== instrument.name);
                            if ($newSong) $newSong.instruments = $instruments;
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
                    {#each $existingInstrumentsWriteable as instrument}
                        <option value={instrument.mainName}>{instrument.mainName}</option>
                    {/each}
                </select>
                {#if selectedInstrument === "new"}
                    <input type="text" name="instrument" id="instrument" placeholder="Instrument" />
                {/if}
                <button type="submit" >Add</button>
            </form>
            <button on:click={() => {
                saveSong($newSong);
                newSong.set(null);
            }}>Save</button>
        {:else}
            <h1>Songs</h1>
            <div id="songList">
                {#each $songs as song}
                    <input type="checkbox" value={song.uid}>{song.name}
                    <button on:click={() => {
                        newSong.set(importSong(song));
                        $instruments = song.instruments;
                    }}>Edit</button>
                    <button on:click={() => {
                        deleteSong(song.uid);
                    }}>Delete</button>
                    <br>
                {/each}
            </div>
            <br>
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
                <br>
                <button type="submit">Create</button>
            </form>
            <h1>Instruments</h1>
            <div id="instrumentList">
                {#each $existingInstrumentsWriteable as instrument}
                    <p>
                        <input type="checkbox" name="instrument" id="instrument" value={instrument.uid} />
                        {instrument.mainName}
                        <button on:click={() => {
                            deleteInstrument(instrument.uid);
                        }}>Delete</button>
                    </p>
                {/each}
            </div>
            <button on:click={() => {
                const mainName = prompt("Main name");
                if (!mainName) return;

                const checkboxes = document.querySelectorAll('#instrumentList input[type="checkbox"]:checked');
                const ids = Array.from(checkboxes).map((checkbox) => checkbox.value);
                const names = ids.map((id) => $existingInstrumentsWriteable.find((i) => i.uid === id)?.mainName || "");
                const otherNames = ids.map((id) => $existingInstrumentsWriteable.find((i) => i.uid === id)?.names || []).flat();

                ids.forEach(id => {
                    $existingInstrumentsWriteable = $existingInstrumentsWriteable.filter((i) => i.uid !== id)
                });

                const _names = Array.from(new Set([...names, ...otherNames, mainName]));

                combineInstruments(mainName, _names);

                checkboxes.forEach((checkbox) => {
                    checkbox.checked = false;
                });
            }}>Combine</button>
            <h1>Players</h1>
            <div id="playerList">
                {#each $players as player}
                    <input type="checkbox" value={player.uid}>
                    {player.name}
                    <button on:click={() => {
                        deletePlayer(player.uid);
                    }}>Delete</button>
                    <br>
                {/each}
            </div>
            <br>
            <form on:submit={(e) => {
                e.preventDefault();

                const form = e.target;
                if (!form) return;

                const formData = new FormData(form);
                const data = Object.fromEntries(formData.entries());

                if (!data.name) return alert('Name is required');
                else createPlayer(data.name.toString());
            }}>
                <input type="text" name="name" id="name" placeholder="Name" />
                <br>
                <button type="submit">Create</button>
            </form>

            <h1>Concert plan</h1>
            

            <button on:click={() => {
                const songCheckboxes = document.querySelectorAll('#songList input[type="checkbox"]:checked');
                const songIds = Array.from(songCheckboxes).map((checkbox) => checkbox.value);
                const selectedSongs = songIds.map((id) => $songs.find((i) => i.uid === id));

                const playerCheckboxes = document.querySelectorAll('#playerList input[type="checkbox"]:checked');
                const playerIds = Array.from(playerCheckboxes).map((checkbox) => checkbox.value);
                const playersSelected = playerIds.map((id) => $players.find((i) => i.uid === id));

                console.log(playerIds);
                const usedInstruments = new Set();
                selectedSongs.forEach(song => {
                    song?.instruments.forEach(instrument => {
                        if (playerIds.includes(instrument.playerID)) usedInstruments.add(instrument.name);
                    });
                })

                console.log(usedInstruments);
            }}>Plan</button>
        {/if}
    {/if}
</div>

<style lang="scss">

</style>