<script lang="ts">
  import ProjectSection from "./_components/allProjectSection.svelte"

  let { data } = $props()

  const projects = $derived(data?.allProjects?.projects ?? [])
</script>

<div>
  {#each projects as project (project._id)}
    <ProjectSection {project} />
  {/each}
</div>

<style lang="scss">
  @use "$lib/styles/_entry.scss" as *;

  div {
    display: flex;
    flex-direction: column;
    gap: var(--all-projects-gap);
    margin: var(--page-spacing-top) var(--x-margin) var(--y-margin-top);
  }
</style>
