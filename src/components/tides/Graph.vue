<template>
  <div class="graph-container">

    <svg
      height="100%"
      width="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="graph">
      <path :d="svgPath" fill="transparent" stroke="red" stroke-width="3" vector-effect="non-scaling-stroke" />
    </svg>
    <pre>{{minHeight}} || {{maxHeight}}</pre>
    <pre>{{heightData}}</pre>
  </div>
</template>

<script>
import { svgPath } from 'src/utils/plot.js'

export default {
  name: 'TideGraph',
  props: {
    tides: { type: Object, required: true }
  },
  computed: {
    svgPath () {
      return svgPath(this.heightData, this.minHeight, this.maxHeight)
    },
    heightData () {
      return this.tides.heights.map(height => {
        return { x: height.dt, y: height.height }
      })
    },
    minHeight () {
      return this.tides.datums.find(datum => datum.name === 'LAT').height
    },
    maxHeight () {
      return this.tides.datums.find(datum => datum.name === 'HAT').height
    }
  }
}
</script>

<style>
#canvas-container {
  width: 100%;
  height: 400px;
  background-color: white;
}
.graph-container {
  width: 100%;
  height: 600px;
}
.graph {
background-color: white;
}
</style>
