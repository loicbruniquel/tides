<template>
  <q-page class="station" v-if="station">
    <div class="tides-wrapper">
      <TideGraph
        :sunrise="sunrise"
        :sunset="sunset"
        :tides="tidesData" />

      <div class="loading-container flex flex-center" v-if="isLoading">
        <q-spinner
          color="primary"
          size="3em" />
      </div>
    </div>

    <DateControl v-model="date" />

  </q-page>
</template>

<script>
import { stations as stationsApi, tides as tidesApi } from 'src/utils/api'
import { date } from 'quasar'
import suncalc from 'suncalc'

import TideGraph from 'components/tides/Graph/Index'
import DateControl from 'components/DateControl'

export default {
  name: 'StationView',
  components: {
    TideGraph,
    DateControl
  },
  data () {
    return {
      isLoading: true,
      station: null,
      date: new Date(),
      tidesData: null
    }
  },
  computed: {
    middleOfDayDate () {
      let start = date.startOfDate(this.date, 'day')
      let middle = date.addToDate(start, { hours: 12 })
      return middle
    },
    sunData () {
      if (this.station) {
        return suncalc.getTimes(this.middleOfDayDate, this.station.latitude, this.station.longitude)
      }
      return null
    },
    sunrise () {
      if (this.sunData) {
        return this.sunData.sunrise.getTime() / 1000
      }
      return null
    },
    sunset () {
      if (this.sunData) {
        return this.sunData.sunset.getTime() / 1000
      }
      return null
    }

  },
  methods: {
    async refreshTidesData () {
      this.isLoading = true
      let day = date.formatDate(this.date, 'YYYY-MM-DD')
      this.tidesData = await tidesApi.getData(this.$route.params.stationId, day)
      this.isLoading = false
    }
  },
  watch: {
    date () {
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
.tides-wrapper {
  position: relative;
  margin-bottom: 20px;
  background-color: #efefef;
  // padding: 30px 0;
  overflow: hidden;
}
.loading-container {
  background-color: rgba(255, 255, 255, 0.7);
  position: absolute;
  left: 0;
  top: 0;
  right:0;
  bottom: 0;
}
</style>
