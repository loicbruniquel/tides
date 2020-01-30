<template>
  <div class="mini-user">
    <div class="email">{{user.email}}</div>
    <q-btn label="Logout" @click="$store.commit('logout')" />
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'MiniUser',
  data () {
    return {
      isLoading: false
    }
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>
