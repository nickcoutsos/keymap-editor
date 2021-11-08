<script>
export default {
  name: 'DialogBox',
  emits: ['dismiss'],
  props: {
    dismissText: {
      type: String,
      default: 'Ok'
    }
  }
}
</script>

<template>
  <div class="dialog">
    <slot />
    <p v-if="dismissText">
      <button
        class="dismiss"
        @click="$emit('dismiss')"
        v-text="dismissText"
      />
    </p>
  </div>
</template>

<style scoped>
.dialog {
  background-color: white;
  padding: 20px 40px;
  margin: 40px;
  max-width: 500px;
  box-shadow: 0px 10px 25px rgba(0, 0, 0, 0.4);
}

.dismiss {
  display: block;
  margin: 0 auto;
}
</style>
