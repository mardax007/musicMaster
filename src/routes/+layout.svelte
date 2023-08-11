<script lang="ts">
	import { user } from "$lib/scripts/stores";
    import { auth } from "$lib/scripts/authentication";
	import { onAuthStateChanged } from "firebase/auth";
	import { onMount } from "svelte";
    import "$lib/scripts/databaseControl"
	import { addColab } from "$lib/scripts/projectManager";
	import { createNewSong } from "$lib/scripts/songManager";

    const authRedirect = ["/login", "/"]

    let currentPopup = "";
    let popupDate: {type: string, projectId: string};

    onMount(() => {
        onAuthStateChanged(auth, async (authState) => {
            if (authState) {
                if (authRedirect.includes(window.location.pathname)) window.location.href = '/home';
                user.set(authState);
            } else {
                if (window.location.pathname != "/login") window.location.href = '/login';
            }
        })

        addEventListener("popup", (e) => {
            popupDate = e.detail;
            currentPopup = popupDate.type;
        })
    })
</script>

{#if currentPopup}
    <div id="popupParent" style="z-index: {currentPopup ? 100 : -100}; opacity: {currentPopup ? 1 : 0}">
        <div class="popup">
            <button id="closeButton" on:click={() => {
                currentPopup = "";
            }}>
                <img src="/icons/close.svg" alt="Close" />
            </button>
            {#if currentPopup == "addColab"}
                <form on:submit={async (e) => {
                    currentPopup = "";
                    e.preventDefault();

                    const email = e.target[0].value;
                    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

                    if (!email || !emailIsValid) {
                        alert("Please enter an valid email");
                        return;
                    }

                    await addColab(email, popupDate.projectId, "hello");
                    currentPopup = "";
                }}>
                    <h1>Add collaborator</h1>
                    <input list="suggestedAccounts" type="text" placeholder="Email" />
                    <button type="submit">Invite</button>
                </form>
            {:else if currentPopup == "createSong"}
                <form on:submit={async (e) => {
                    e.preventDefault();

                    const formData = new FormData(e.target);
                    const songName = formData.get('songName')?.toString();

                    if (!songName) {
                        alert('Please enter a song name');
                        return;
                    }
                    await createNewSong(popupDate.projectId, songName);
                    currentPopup = "";
                }}>
                    <h1>Create a new song</h1>
                    <input name="songName" type="text" placeholder="Song name" />
                    <button type="submit">Create</button>
                </form>
            {/if}
        </div>
    </div>
{/if}

<slot />

<style lang="scss">
    #popupParent {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;

        display: flex;
        justify-content: center;
        align-items: center;

        background-color: rgba(0, 0, 0, 0.5);
        transition: opacity 0.5s ease-in-out;
    }

    .popup {
        position: relative;
        width: 50vw;
        background-color: white;
        border-radius: 1rem;
        padding: 0.65rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        max-width: fit-content;
    }

    #closeButton {
        display: flex;
        position: absolute;
        top: 0.6rem;
        right: 0.5rem;
        background-color: transparent;
        border: none;
        cursor: pointer;

        img {
            width: 1rem;
            height: 1rem;
        }
    }

    form {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    input {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid black;
    }

    button {
        padding: 0.5rem;
        border-radius: 0.5rem;
        border: 1px solid black;
        background-color: white;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
    }

    button:hover {
        background-color: black;
        color: white;
    }

    h1 {
        font-size: 1.5rem;
        margin: 0;
        padding-right: 1.7rem;
    }
</style>