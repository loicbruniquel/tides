<template>
  <q-page class="station" v-if="station">
    <TideGraph v-if="tidesData" :tides="tidesData" @mouseHeight="mouseHeightChanged" />
  </q-page>
</template>

<script>
import { stations as stationsApi, tides as tidesApi } from 'src/utils/api'

import TideGraph from 'components/tides/Graph/Index'

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
    },
    mouseHeightChanged (value) {
      console.log(value)
    }
  },
  async mounted () {
    this.$store.commit('pageTitle', null)
    this.refreshTidesData()
    this.station = await stationsApi.get(this.$route.params.stationId)
    this.$store.commit('pageTitle', this.station.name)
  }
}
</script>

<style lang="scss" scoped>
.station {
  padding: 0;
}
</style>
