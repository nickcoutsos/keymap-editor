<script>
export default {
  name: 'Spinner',
  props: ['text']
}
</script>

<template>
  <div class="spinner">
    <i class="fa fa-spinner" />
    <slot />
  </div>
</template>

<style scoped>
.spinner {
  display: inline-block;
  text-align: center;
}
i.fa {
  display: inline-block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
</style>