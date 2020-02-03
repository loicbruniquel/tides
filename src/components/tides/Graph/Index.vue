<template>
  <div class="graph-container">

    <svg
      ref="svgGraph"
      height="100%"
      width="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      class="graph">

      <rect
        y="50"
        width="100"
        height="0.2"
        fill="gray" />

      <GraphPath v-if="heightData" :heightData="heightData" />

      <g v-if="extremeData">
        <ellipse
          v-for="point in extremeData"
          :key="`${point.x}-${[point.y]}`"
          :cx="point.x"
          :cy="point.y"
          :rx="dotRadius"
          :ry="dotHeight"
          stroke-width="0"
          fill="blue" />
      </g>

      <ellipse v-if="mousePosition && tides"
        :cx="mousePosition"
        :cy="mouseValue"
        :rx="dotRadius"
        :ry="dotHeight"
        stroke-width="0"
        fill="green" />

      <rect
        @mousemove.self="mouseMove"
        @mouseleave.self="mousePosition = null"
        @touchstart.self="touchStart"
        @touchmove.stop.self="mouseMove"
        width="100"
        height="100"
        fill="transparent" />

    </svg>

    <GraphExtremes class="extremes-overlay" v-if="extremeData" :extremes="extremeData" />

    <GraphInfo class="info-badge" v-if="tides && mousePosition" :dt="mouseDt" :height="mouseHeight" />

  </div>
</template>

<script>
import { getAbsoluteValue, convertedValues, yForX } from 'src/utils/plot'

import GraphPath from './Path'
import GraphInfo from './Info'
import GraphExtremes from './Extremes'

export default {
  name: 'TideGraph',
  props: {
    tides: { type: Object }
  },
  components: {
    GraphPath,
    GraphInfo,
    GraphExtremes
  },
  data () {
    return {
      svgDimensions: { x: 0, y: 0 },
      mousePosition: null
    }
  },
  computed: {
    heightData () {
      if (!this.tides) return null
      return this.convertedPoints(this.tides.heights.map(height => {
        return { x: height.dt, y: height.height }
      }))
    },
    extremeData () {
      if (!this.tides) return null
      return this.convertedPoints(this.tides.extremes.map(extreme => {
        return { ...extreme, x: extreme.dt, y: extreme.height, type: extreme.type }
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
      return 100 / this.svgDimensions.w * 5
    },
    dotHeight () {
      return this.dotRadius * this.svgAspectRatio
    },
    svgAspectRatio () {
      return this.svgDimensions.w / this.svgDimensions.h
    },
    mouseValue () {
      return yForX(this.heightData, this.mousePosition)
    },
    mouseHeight () {
      return getAbsoluteValue(this.mouseValue, this.minY, this.maxY)
    },
    mouseDt () {
      return getAbsoluteValue(this.mousePosition, this.minX, this.maxX)
    }
  },
  methods: {
    handleResize (event) {
      this.svgDimensions = { w: this.$refs.svgGraph.clientWidth, h: this.$refs.svgGraph.clientHeight }
    },
    mouseMove (event) {
      if (!event.touches && !event.layerX) return

      let clientX = event.clientX
      if (!clientX) {
        clientX = event.touches[0].clientX
      }

      let rect = event.target.getBoundingClientRect()
      let xPos = clientX - rect.left
      this.mousePosition = xPos / rect.width * 100
    },
    convertedPoints (points) {
      return convertedValues(points, this.minX, this.maxX, this.minY, this.maxY)
    },
    touchStart (event) {
      if (navigator.userAgent.match(/Android/i)) {
        event.preventDefault()
      }
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

<style lang="scss" scoped>
.graph-container {
  width: 100%;
  height: 400px;
  position: relative;
  .info-badge {
    position: absolute;
    top: 0px;
    left: 20px;
  }
}
.graph {
  background-color: #efefef;
}

.extremes-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: transparent;
  pointer-events:none;
}
</style>
