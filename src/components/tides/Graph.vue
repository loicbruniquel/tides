<template>
  <div class="graph-container">

    <svg
      ref="svgGraph"
      height="100%"
      width="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="graph">
      <path :d="svgPath" fill="transparent" stroke="red" stroke-width="3" vector-effect="non-scaling-stroke" />
      <ellipse
        v-for="point in extremeData"
        :key="`${point.x}-${[point.y]}`"
        :cx="getPercentValue(point.x, minX, maxX)"
        :cy="getPercentValue(point.y, minY, maxY)"
        :rx="dotRadius"
        :ry="dotHeight"
        stroke-width="0" fill="blue" />
    </svg>
  </div>
</template>

<script>
import { svgPath, getPercentValue } from 'src/utils/plot'

export default {
  name: 'TideGraph',
  props: {
    tides: { type: Object, required: true }
  },
  data () {
    return {
      svgDimensions: { x: 0, y: 0 }
    }
  },
  computed: {
    svgPath () {
      return svgPath(this.heightData, this.minX, this.maxX, this.minY, this.maxY)
    },
    heightData () {
      return this.tides.heights.map(height => {
        return { x: height.dt, y: height.height }
      })
    },
    extremeData () {
      return this.tides.extremes.map(extreme => {
        return { x: extreme.dt, y: extreme.height }
      })
    },
    minX () {
      return this.heightData[0].x
    },
    maxX () {
      return this.heightData[this.heightData.length - 1].x
    },
    minY () {
      return this.tides.datums.find(datum => datum.name === 'HAT').height
    },
    maxY () {
      return this.tides.datums.find(datum => datum.name === 'LAT').height
    },
    dotRadius () {
      return 100 / this.svgDimensions.w * 10
    },
    dotHeight () {
      return this.dotRadius * this.svgAspectRatio
    },
    svgAspectRatio () {
      return this.svgDimensions.w / this.svgDimensions.h
    }
  },
  methods: {
    getPercentValue,
    handleResize (event) {
      this.svgDimensions = { w: this.$refs.svgGraph.clientWidth, h: this.$refs.svgGraph.clientHeight }
      console.log(this.aspectRatio)
    }
  },
  mounted () {
    this.handleResize()
  },
  created: function () {
    window.addEventListener('resize', this.handleResize)
  },
  beforeDestroy: function () {
    window.removeEventListener('resize', this.handleResize)
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
