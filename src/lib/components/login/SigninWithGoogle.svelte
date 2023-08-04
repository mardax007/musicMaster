<script lang="ts">
    function handleClick() {
        console.log("Sign in with Google clicked");
    }
</script>

<button class="btn btn-primary" on:click={handleClick}>
  <img alt="Google logo" src="https://img.icons8.com/color/48/000000/google-logo.png" />
  <span>Sign in with Google</span>
</button>

<style lang="scss">
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        border: none;
        padding: 0.5rem 1rem;
        font-size: 1rem;
        cursor: pointer;
        transition: all 0.2s ease-in-out;
        
        &:hover {
            transform: scale(1.05);
        }
        
        &:active {
            transform: scale(0.95);
        }
        
        img {
            width: 1.5rem;
            height: 1.5rem;
            margin-right: 0.5rem;
        }
    }
    .btn-primary {
        background-color: #4285f4;
        color: #fff;
    }
</style>