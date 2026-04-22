<script lang="ts">
  let { children } = $props()
  import Header from "./_components/header.svelte"
</script>

{@render children()}

<Header />
