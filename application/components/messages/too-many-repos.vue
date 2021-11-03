<template>
  <modal>
    <div class="dialog">
      <h2>Hold up a second!</h2>
      <p>The Keymap Editor app has been installed for more than one GitHub repository.</p>
      <p>
        I'm still working on things, including the ability to pick a specific
        repo, but in the meantime you should go back to your <a :href="getInstallationUrl()">app configuration</a>
        and select a single repository containing your keyboard's zmk-config.
      </p>
    </div>
  </modal>
</template>

<script>
import Modal from '../modal.vue'
import * as github from '../../github'

export default {
  name: 'TooManyRepos',
  components: { Modal },
  methods: {
    getInstallationUrl() {
      return `https://github.com/settings/installations/${github.installation.id}`
    }
  }
}
</script>

<style scoped>
.dialog {
  background-color: white;
  padding: 40px;
  margin: 40px;
  max-width: 500px;
}
</style>