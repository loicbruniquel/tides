<template>
  <q-page class="">
    <h1>Station</h1>
    <pre>{{station}}</pre>
  </q-page>
</template>

<script>
import { stations as stationsApi } from 'src/utils/api'

export default {
  name: 'StationView',
  components: {
  },
  data () {
    return {
      station: null
    }
  },
  async mounted () {
    this.station = await stationsApi.get(this.$route.params.stationId)
  }
}
</script>
