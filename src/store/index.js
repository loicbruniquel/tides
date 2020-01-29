import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    state: {
      user: null
    },

    mutations: {
      user (state, user) {
        state.user = user
      }
    },

    strict: process.env.DEV
  })

  return Store
}
