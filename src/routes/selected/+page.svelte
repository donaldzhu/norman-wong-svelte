<script lang="ts">
  import { getTitle } from "$lib/utils/meta.js"
  import SelectedProjectSection from "./_components/selectedProjectSection.svelte"

  let { data } = $props()

  const projects = $derived(data?.selectedWorks?.projects ?? [])
</script>

<div>
  {#each projects as project (project._id)}
    <SelectedProjectSection {project} />
  {/each}
</div>

<svelte:head>
  <title>{getTitle("All Projects")}</title>
</svelte:head>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    display: flex;
    flex-direction: column;
    gap: var(--selected-works-gap);
    margin: var(--page-spacing-top) var(--selected-works-x-margin)
      var(--y-margin-bottom);
  }
</style>
