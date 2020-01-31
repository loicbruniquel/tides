<template>
  <q-page class="">
    <h2>Station</h2>
    <TideGraph v-if="tidesData" :tides="tidesData" />
  </q-page>
</template>

<script>
import { stations as stationsApi, tides as tidesApi } from 'src/utils/api'

import TideGraph from 'components/tides/Graph'

export default {
  name: 'StationView',
  components: {
    TideGraph
  },
  data () {
    return {
      station: null,
      day: '2020-01-31',
      tidesData: null
    }
  },
  methods: {
    async refreshTidesData () {
      this.tidesData = await tidesApi.getData(this.$route.params.stationId, this.day)
    }
  },
  async mounted () {
    this.refreshTidesData()
    this.station = await stationsApi.get(this.$route.params.stationId)
  }
}
</script>
