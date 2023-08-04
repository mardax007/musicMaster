<script lang="ts">
	import { user } from "$lib/scripts/stores";
    import { auth } from "$lib/scripts/authentication";
	import { onAuthStateChanged } from "firebase/auth";
	import { onMount } from "svelte";
    import "$lib/scripts/databaseControl"

    onMount(() => {
        onAuthStateChanged(auth, async (authState) => {
            if (authState) {
                console.log('User is signed in', authState);

                if (window.location.pathname == "/login") window.location.href = '/home';
                user.set(authState);
            } else {
                console.log('User is signed out');
                if (window.location.pathname != "/login") window.location.href = '/login';
            }
        })
    })
</script>

<slot />