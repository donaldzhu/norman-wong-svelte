<script lang="ts">
  import "../app.css"
  import Header from "./_components/header/header.svelte"
  import Info from "./_components/header/info.svelte"

  let { children, data } = $props()
  let infoIsVisible = $state(false)
</script>

{#if data?.header}
  <Header {data} bind:infoIsVisible />
{/if}

{#if data?.info && infoIsVisible}
  <Info data={data.info} />
{/if}

{@render children()}

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;
</style>
