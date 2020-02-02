<template>
  <div v-if="user" class="logged-in flex items-center q-gutter-md">
    <div class="email">{{user.email}}</div>
    <q-btn label="Logout" @click="$store.commit('logout')" />
  </div>
  <div v-else class="mini-user logged-out flex q-gutter-md">
    <q-btn label="Login" to="/user/login" />
    <q-btn label="Create account" to="/user/register" />
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

<style lang="scss" scoped>

</style>
