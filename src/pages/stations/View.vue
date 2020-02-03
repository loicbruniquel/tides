<template>
  <q-page class="station" v-if="station">
    <div class="loading-container" v-if="isLoading">
      <q-spinner
        color="primary"
        size="3em"
      />
    </div>
    <div v-else>
      <TideGraph v-if="tidesData" :tides="tidesData" @mouseHeight="mouseHeightChanged" />
    </div>

    <q-btn :label="day" @click="showDatepicker = true" />

    <q-dialog v-model="showDatepicker">
      <q-card>
        <q-card-section>
        <q-date v-model="day" />
        </q-card-section>
      </q-card>
    </q-dialog>
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
      isLoading: true,
      station: null,
      day: '2020/01/31',
      tidesData: null,
      showDatepicker: false
    }
  },
  methods: {
    async refreshTidesData () {
      this.isLoading = true
      let date = this.day.replace(/\//g, '-')
      this.tidesData = await tidesApi.getData(this.$route.params.stationId, date)
      this.isLoading = false
    },
    mouseHeightChanged (value) {
      console.log(value)
    }
  },
  watch: {
    day () {
      this.refreshTidesData()
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
