<template>
  <q-layout class="main-container lHh Lpr lFf">
    <q-page-container>

      <header class="header flex items-center q-pa-md">
        <q-btn outline round color="primary" icon="home" to="/" />
        <q-space />
        <MiniUser />
      </header>

      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
import { mapState } from 'vuex'

import MiniUser from 'components/user/Mini'

export default {
  name: 'MainLayout',
  components: {
    MiniUser
  },
  data () {
    return {
    }
  },
  computed: {
    ...mapState(['user'])
  },
  async mounted () {
    this.isLoading = true
    await this.$store.dispatch('fetchUser')
    this.isLoading = false
  }
}
</script>

<style lang="scss" scoped>
.main-container {
  background-color: #efefef;
}

.header {
  background-color: white;
}
</style>
