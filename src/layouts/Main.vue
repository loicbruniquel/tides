<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <header>
        <q-btn outline round color="primary" icon="home" to="/" />
      </header>
      <div v-if="user">
        <MiniUser />
      </div>
      <div v-if="!user" class="flex q-gutter-md">
        <span>Tides</span>
        <q-btn label="Login" to="/user/login" />
        <q-btn label="Create account" to="/user/register" />
      </div>
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
