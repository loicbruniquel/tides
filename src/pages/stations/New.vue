<template>
  <q-page class="">
    <h2>New station</h2>
    <StationForm v-model="station" v-if="station" @save="save" />
  </q-page>
</template>

<script>
import { stations as stationsApi } from 'src/utils/api'
import StationForm from 'components/stations/Form.vue'

export default {
  name: 'StationEdit',
  components: {
    StationForm
  },
  data () {
    return {
      station: {
        name: 'SomeWhere',
        latitude: '-4',
        longitude: '23'
      }
    }
  },
  methods: {
    async save (stationData) {
      this.$q.loading.show()
      let newStation = await stationsApi.create(stationData)
      this.$q.loading.hide()
      this.$router.push('/')
    }
  }
}
</script>
