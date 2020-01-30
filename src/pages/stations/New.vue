<template>
  <div class="">
    <StationForm v-model="station" v-if="station" @save="save" />
  </div>
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
        name: null,
        latitude: 33.92,
        longitude: -7.42
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
