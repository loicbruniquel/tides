import Vue from 'vue'
import Vuex from 'vuex'

import { user as userApi } from 'src/utils/api'

Vue.use(Vuex)

export default function () {
  const Store = new Vuex.Store({
    state: {
      user: null,
      pageTitle: null
    },

    mutations: {
      user (state, user) {
        state.user = user
      },
      pageTitle (state, title) {
        state.pageTitle = title
      }
    },

    actions: {
      async fetchUser (context) {
        if (userApi.getToken()) {
          let user = await userApi.get()
          context.commit('user', user)
        }
      }
    },

    strict: process.env.DEV
  })

  return Store
}
