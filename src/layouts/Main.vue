<template>
  <q-layout class="main-container lHh Lpr lFf">
    <q-page-container>

      <header class="header flex items-center q-pa-md">
        <q-btn outline round color="primary" icon="home" to="/" />
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
  background-color: #efefef;
}

.header {
  background-color: white;
  h2 {
    margin: 0;
    flex: 1;
    margin-left: 20px;
    text-align: left;
  }
}
</style>
