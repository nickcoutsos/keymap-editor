<template>
  <div>
    <selector
      v-model="source"
      label="Source"
      :id="source"
      :choices="sourceChoices"
    />
    <github-picker v-if="source == 'github'" />
  </div>
</template>

<script>
import compact from 'lodash/compact'

import * as config from '../config'
import GithubPicker from './github-picker.vue'
import Selector from './selector.vue'

export default {
  name: 'KeyboardPicker',
  components: { GithubPicker, Selector },
  data() {
    return {
      source: (
        this.sourceChoices.length === 1
          ? this.sourceChoices[0]
          : null
      )
    }
  },
  computed: {
    sourceChoices() {
      const local = { id: 'local', name: 'Local' }
      const github = { id: 'github', name: 'GitHub' }

      return compact([
        config.enableLocal ? local : null,
        config.enableGitHub ? github: null
      ])
    }
  }
}
</script>
