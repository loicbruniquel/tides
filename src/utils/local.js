const STORAGE_KEY_STATIONS = 'serialized_stations'

import { LocalStorage } from 'quasar'

let generateRandomString = function (length) {
  var result = ''
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  var charactersLength = characters.length
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export default {
  get (stationId) {
    let list = this.getList()
    return list.find(station => station.id === stationId)
  },

  getList () {
    return LocalStorage.getItem(STORAGE_KEY_STATIONS)
  },

  create (data) {
    data.id = generateRandomString(8)
    let list = this.getList() || []
    list.push(data)
    return data
  },

  update (stationId, data) {
    let updatedList = this.getList().map(station => {
      return (station.id === stationId) ? data : station
    })
    LocalStorage.set(STORAGE_KEY_STATIONS, updatedList)
    return data
  }
}
