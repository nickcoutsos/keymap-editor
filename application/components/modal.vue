<script>
export default {
  name: 'Modal',
  props: []
}
</script>

<template>
  <teleport to="body">
    <div class="wrapper">
      <slot />
    </div>
  </teleport>
</template>

<style scoped>
.wrapper {
  position: absolute;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.75);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>