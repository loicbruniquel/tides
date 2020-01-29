<template>
  <q-list bordered separator>
    <q-item v-for="station in stations" :key="station.id" clickable v-ripple @click="open(station)">
      <q-item-section>
        <q-item-label>{{station.name}}</q-item-label>
        <q-item-label caption>{{station.latitude}}, {{station.longitude}}</q-item-label>
      </q-item-section>
      <q-item-section top side>
        <div class="text-grey-8 q-gutter-xs">
          <q-btn class="gt-xs" size="12px" flat dense round icon="edit" @click.stop="edit(station)" />
        </div>
      </q-item-section>
    </q-item>
  </q-list>
</template>

<script>
import { stations as stationsApi } from 'src/utils/api'

export default {
  name: 'StationList',
  data () {
    return {
      stations: []
    }
  },
  methods: {
    open (station) {
      this.$router.push(`/stations/${station.id}`)
    },
    edit (station) {
      this.$router.push(`/stations/${station.id}/edit`)
    }
  },
  async mounted () {
    this.stations = await stationsApi.getList()
  }
}
</script>

<style>

</style>
