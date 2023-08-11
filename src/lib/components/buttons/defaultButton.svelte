<script lang="ts">
    export let action: () => void;
    export let text: string;
    export let image: string;
    export let imageHeight = "24px";
</script>

<div id="wrapper">
    <button on:click={action}>
        <img width={imageHeight} src={image} alt={text} />
    </button>
</div>

<style lang="scss">
    #wrapper {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;

        button {
            background-color: transparent;
            border: none;
            cursor: pointer;
            outline: none;

            transition: all 0.2s ease-in-out;
        }

        button:hover {
            transform: scale(1.1);
        }
    }
</style>