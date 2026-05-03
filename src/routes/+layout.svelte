<script lang="ts">
  import "../app.css"
  import Header from "./_components/header.svelte"
  import Info from "./_components/info.svelte"

  let { children, data } = $props()

  let infoIsVisible = $state(false)
</script>

{@render children()}

{#if data?.header}
  <Header data={data.header} bind:infoIsVisible />
{/if}

{#if data?.info && infoIsVisible}
  <Info data={data.info} />
{/if}
