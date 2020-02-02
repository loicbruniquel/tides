<template>
  <div class="graph-container">

    <svg
      ref="svgGraph"
      height="100%"
      width="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="graph">

      <path
        :d="svgPath(heightData)"
        fill="transparent"
        stroke="red"
        stroke-width="3"
        vector-effect="non-scaling-stroke" />

      <ellipse
        v-for="point in extremeData"
        :key="`${point.x}-${[point.y]}`"
        :cx="point.x"
        :cy="point.y"
        :rx="dotRadius"
        :ry="dotHeight"
        stroke-width="0"
        fill="blue" />

      <ellipse
        :cx="mousePosition"
        :cy="mouseValue.y"
        :rx="dotRadius"
        :ry="dotHeight"
        stroke-width="0"
        fill="green" />

      <rect
        @mousemove.self="mouseMouse"
        @mouseleave.self="mousePosition = null"
        width="100"
        height="100"
        fill="transparent" />

    </svg>

  </div>
</template>

<script>
import { svgPath, getPercentValue, convertedValues, yForX } from 'src/utils/plot'

export default {
  name: 'TideGraph',
  props: {
    tides: { type: Object, required: true }
  },
  data () {
    return {
      svgDimensions: { x: 0, y: 0 },
      mousePosition: null
    }
  },
  computed: {
    heightData () {
      return this.convertedPoints(this.tides.heights.map(height => {
        return { x: height.dt, y: height.height }
      }))
    },
    extremeData () {
      return this.convertedPoints(this.tides.extremes.map(extreme => {
        return { x: extreme.dt, y: extreme.height }
      }))
    },
    minX () {
      return this.tides.heights[0].dt
    },
    maxX () {
      return this.tides.heights[this.tides.heights.length - 1].dt
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
    },
    mouseValue () {
      return yForX(this.heightData, this.mousePosition)
    }
  },
  methods: {
    svgPath,
    getPercentValue,
    handleResize (event) {
      this.svgDimensions = { w: this.$refs.svgGraph.clientWidth, h: this.$refs.svgGraph.clientHeight }
    },
    mouseMouse (event) {
      let rect = event.target.getBoundingClientRect()
      let xPos = event.clientX - rect.left
      this.mousePosition = xPos / rect.width * 100
    },
    convertedPoints (points) {
      return convertedValues(points, this.minX, this.maxX, this.minY, this.maxY)
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
  background-color: #efefef;
}
</style>
