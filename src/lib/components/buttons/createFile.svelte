<script lang="ts">
    export let action: () => void;
    export let text: string;
    export let imageHeight = "32px";
</script>

<div id="wrapper">
    <button on:click={action}>
        <img height={imageHeight} src="/icons/newFile.svg" alt={text} />
    </button>
</div>

<style lang="scss">
    #wrapper {
        display: flex;
        justify-content: center;
        align-items: center;

        width: 32px;
        box-shadow: 0 0 0.5rem #00000020;
        border-radius: 0.5rem;
        padding: 0.25rem;

        transition: all 0.2s ease-in-out;
        cursor: pointer;
    }

    #wrapper:hover {
        transform: scale(1.1);
    }

    button {
        display: flex;
        background-color: transparent;
        border: none;
        cursor: pointer;
    }
</style>