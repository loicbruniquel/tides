<template>
  <q-page class="user login">
    <h1>Login to your account</h1>
    <q-form @submit="login" class="q-gutter-md" >
      <q-input v-model="email" label="Email" />
      <q-input v-model="password" type="password" label="Password" />
      <q-btn label="Login" type="submit" color="primary"/>
    </q-form>
  </q-page>
</template>

<script>
import { user as userApi } from 'src/utils/api'

export default {
  name: 'UserLogin',
  data () {
    return {
      email: 'loicbr@gmail.com',
      password: 'sponge'
    }
  },
  methods: {
    async login () {
      userApi.setToken(null)
      let resp = await userApi.login(this.email, this.password)
      this.$store.commit('user', resp.data.user)
      this.$router.push('/')
    }
  }
}
</script>
