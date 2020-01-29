<template>
  <q-page class="user login">
    <h1>Login to your account</h1>
    <q-form @submit="login" class="q-gutter-md" >
      <q-input v-model="email" label="Email" />
      <q-input v-model="password" type="password" label="Password" />
      <q-input v-model="passwordConfirmation" type="password" label="Password confirmation" />
      <q-btn label="Login" type="submit" color="primary"/>
    </q-form>

  </q-page>
</template>

<script>
export default {
  name: 'UserLogin'
}
</script>
