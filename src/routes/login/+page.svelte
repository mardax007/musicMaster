<script lang="ts">
	import SigninWithGoogle from "$lib/components/login/SigninWithGoogle.svelte";
	import { signinWithEmailAndPass, signupWithEmailAndPass } from "$lib/scripts/authentication";

    async function handleSignin(e) {
        e.preventDefault();
        
        const form = Object.fromEntries(new FormData(e.target).entries());

        await signinWithEmailAndPass(form.email.toString(), form.password.toString())
    }

    async function handleSignup(e) {
        e.preventDefault();
        
        const form = Object.fromEntries(new FormData(e.target).entries());

        await signupWithEmailAndPass(form.email.toString(), form.password.toString())
    }
</script>

<div id="wrapper">
    <h1>Login</h1>
    <SigninWithGoogle />
    <div class="seperator">
        <span>or</span>
    </div>
    <form on:submit={handleSignin}>
        <input name="email" type="text" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Login</button>
    </form>
    <p>Not yet signed up?</p>
    <h2>Signup</h2>
    <form on:submit={handleSignup}>
        <input name="email" type="text" placeholder="Email" />
        <input name="password" type="password" placeholder="Password" />
        <button type="submit">Signup</button>
    </form>
</div>

<style lang="scss">
    #wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        max-width: fit-content;
        margin: 0 auto;
    }

    .seperator {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin: 1rem 0;
    }

    .seperator span {
        background-color: #fff;
        padding: 0 1rem;
    }

    form {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100%;
    }

    input {
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
    }

    button {
        width: 100%;
        padding: 0.5rem;
        margin: 0.5rem 0;
        border: 1px solid #ccc;
        border-radius: 0.5rem;
        background-color: #fff;
        cursor: pointer;
    }
</style>