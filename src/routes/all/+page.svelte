<script lang="ts">
  import { getTitle } from "$lib/utils/meta.js"
  import ProjectSection from "./_components/allProjectSection.svelte"

  let { data } = $props()

  const projects = $derived(data?.allProjects?.projects ?? [])
</script>

<div>
  {#each projects as project (project._id)}
    <ProjectSection {project} />
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
    gap: var(--all-projects-gap);
    margin: var(--page-spacing-top) var(--all-projects-x-margin)
      var(--y-margin-bottom);
  }
</style>
