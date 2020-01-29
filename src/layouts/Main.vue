<template>
  <q-layout view="lHh Lpr lFf">
    <q-page-container>
      <div v-if="user">
        {{user.email}}
        <q-btn label="Logout" @click="$store.commit('logout')" />
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
export default {
  name: 'MainLayout',
  data () {
    return {
    }
  },
  computed: {
    ...mapState(['user'])
  }
}
</script>
