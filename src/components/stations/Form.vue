<template>
  <div class="form-container">

    <StationMap
      class="map"
      :coordinate="this.mapCoordinates"
      @move="mapMove" />

    <q-form @submit="save" class="station-form flex items-center" >
      <q-input
        outlined
        class="station-field name"
        v-model="editingStation.name"
        label="Name" />

      <q-input
        outlined
        class="station-field coord"
        v-model="editingStation.latitude"
        label="Latitude"
        @blur="updateMap" />

      <q-input
        outlined
        class="station-field coord"
        v-model="editingStation.longitude"
        label="Longitude"
        @blur="updateMap" />

      <q-space />

      <q-btn class="cancel" label="Cancel" to="/" />

      <q-btn class="save" label="Save station" type="submit" color="primary"/>

    </q-form>

  </div>

</template>

<script>
import StationMap from './map/Map'

export default {
  name: 'StationForm',
  components: {
    StationMap
  },
  props: {
    value: { type: Object, required: false }
  },
  data () {
    return {
      editingStation: JSON.parse(JSON.stringify(this.value)),
      mapCoordinates: {
        lat: this.value.latitude,
        lng: this.value.longitude
      }
    }
  },
  methods: {
    updateMap () {
      this.mapCoordinates = {
        lat: this.editingStation.latitude,
        lng: this.editingStation.longitude
      }
    },
    mapMove (coordinates) {
      this.editingStation.latitude = coordinates.lat.toFixed(2)
      this.editingStation.longitude = coordinates.lng.toFixed(2)
    },
    save () {
      this.$emit('save', this.editingStation)
    }
  }
}
</script>

<style lang="scss" scoped>
.form-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.station-form {
  border-radius: 10px;
  background-color: white;
  position: absolute;
  top: 20px;
  left: 20px;
  right: 20px;
  padding: 10px;
  .save {
    margin-left: 10px;
    margin-right: 10px;
  }
  .station-field {
    margin-right: 10px;
    &.name {
      width: 300px;
    }
    &.coord {
      width: 80px;
    }
  }
}

.map {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>
