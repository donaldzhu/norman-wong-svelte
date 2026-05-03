<script lang="ts">
  let { data } = $props()
  console.log(data.selectedWorks)
  const media = $derived(data.selectedWorks?.media)
</script>

<div>
  {#each media as item}
    <span>{item.image.asset}</span>
  {/each}
</div>
