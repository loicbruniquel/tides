<template>
  <q-layout class="main-container lHh Lpr lFf">
    <q-page-container>

      <header class="header flex items-center">
        <q-btn outline round color="primary" icon="home" to="/" v-if="$route.name !== 'home'" class="home-button" />
        <h2 class="page-title">{{$store.state.pageTitle}}</h2>
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
  background-color: #eee;
}

.home-button {
  margin-right: 20px;
}

.header {
  padding: 10px 20px;
  h2 {
    margin: 0;
    flex: 1;
    text-align: left;
  }
}
</style>
