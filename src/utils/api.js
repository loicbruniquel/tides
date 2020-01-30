import axios from 'axios'
import { LocalStorage } from 'quasar'

const STORAGE_KEY_TOKEN = 'api_token'

const apiClient = axios.create({
  baseURL: 'http://localhost:1337',
  timeout: 1000
})

let token = LocalStorage.getItem(STORAGE_KEY_TOKEN)
if (token) {
  axios.defaults.headers.common = {
    'Authorization': 'Bearer ' + token
  }
}

export let user = {
  setToken (token) {
    LocalStorage.set(STORAGE_KEY_TOKEN, token)
    if (token) {
      axios.defaults.headers.common = {
        'Authorization': 'Bearer ' + token
      }
    } else {
      axios.defaults.headers.common = {}
    }
  },

  getToken () {
    return LocalStorage.getItem(STORAGE_KEY_TOKEN)
  },

  async get () {
    return (await apiClient.get('/users/me')).data
  },

  async login (email, password) {
    let resp = await apiClient.post('/auth/local', {
      identifier: email,
      password
    })
    this.setToken(resp.data.jwt)
    return resp.data
  },

  async register (email, password) {

  }
}

export let stations = {
  async get (stationId) {
    return (await apiClient.get(`stations/${stationId}`)).data
  },

  async getList () {
    return (await apiClient.get('stations')).data
  },

  async create (data) {
    return (await apiClient.post(`stations`, data)).data
  },

  async update (stationId, data) {
    return (await apiClient.put(`stations/${stationId}`, data)).data
  }
}
