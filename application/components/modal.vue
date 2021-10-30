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
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.25);
  z-index: 100;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>