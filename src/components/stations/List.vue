<template>
  <div class="stations-list-wrapper">
    <q-list bordered separator class="stations-list">
      <q-item class="station-item" v-for="station in stations" :key="station.id" clickable v-ripple @click="open(station)">
        <q-item-section>
          <q-item-label class="station-name">{{station.name}}</q-item-label>
          <q-item-label caption>{{station.latitude}}, {{station.longitude}}</q-item-label>
        </q-item-section>
        <q-item-section top side>
          <div class="text-grey-8 q-gutter-xs">
            <q-btn class="gt-xs" size="12px" flat dense round icon="edit" @click.stop="edit(station)" />
          </div>
        </q-item-section>
      </q-item>
    </q-list>
  </div>
</template>

<script>
import { user, stations as stationsApi } from 'src/utils/api'
import stationsLocal from 'src/utils/local'

export default {
  name: 'StationList',
  data () {
    return {
      stations: []
    }
  },
  methods: {
    open (station) {
      this.$router.push(`/stations/${station.id}/tides`)
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

<style lang="scss" scoped>
.stations-list-wrapper {
  padding: 0 20px;
}

.stations-list {
  max-width: 890px;
  margin: 0 auto;
  background-color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0px 3px 8px rgba(0, 0, 0, 0.15);
  .station-item {
    padding: 16px;
    .station-name {
      font-weight: bold;
      font-size: 1.4em;
    }
  }
}
</style>
