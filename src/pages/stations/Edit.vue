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
      station: null
    }
  },
  methods: {
    async save (stationData) {
      this.$q.loading.show()
      await stationsApi.update(this.$route.params.stationId, stationData)
      this.$q.loading.hide()
      this.$router.push('/')
    }
  },
  async mounted () {
    this.station = await stationsApi.get(this.$route.params.stationId)
  }
}
</script>
