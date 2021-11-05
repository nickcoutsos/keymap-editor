<script>
export default {
  name: 'Modal',
  props: []
}
</script>

<template>
  <teleport to="body">
    <div class="wrapper">
      <div class="content">
        <slot />
      </div>
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

  display: flex;
  justify-content: center;
  align-items: center;
}
.content {
  display: block;
}
</style>