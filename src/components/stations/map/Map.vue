<template>
  <div class="map-container">
    <MglMap
      class="map"
      :zoom="3"
      :accessToken="accessToken"
      :mapStyle="mapStyle"
      :center="coordinate"
      @move="move">
    </MglMap>
    <div class="dot">&nbsp;</div>
  </div>
</template>

<script>
import Mapbox from 'mapbox-gl'

import { MglMap, MglNavigationControl, MglGeolocateControl } from 'vue-mapbox'

export default {
  name: 'StationMap',
  components: {
    MglMap,
    MglNavigationControl,
    MglGeolocateControl
  },
  props: {
    coordinate: { type: Object }
  },
  data () {
    return {
      accessToken: 'pk.eyJ1IjoibG9pY2JydW5pcXVlbCIsImEiOiJIU2NHSzA4In0.yRHIzVTrD85u-H3nfutjsQ',
      mapStyle: 'mapbox://styles/loicbruniquel/ck60t59y101y71irvrd6nhwp1'
    }
  },
  methods: {
    move (event) {
      this.$emit('move', event.map.getCenter())
    }
  },
  created () {
    // We need to set mapbox-gl library here in order to use it in template
    this.mapbox = Mapbox
  }
}
</script>

<style lang="scss" scoped>
.map {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
.dot {
  width: 10px;
  height: 10px;
  border-radius: 5px;
  border: 2px solid red;
  position: absolute;
  top: 50%;
  left:50%;
  transform: translateX(-50%);
  transform: translateY(-50%);
}
</style>
