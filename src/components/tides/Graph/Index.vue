<template>
  <div class="graph-container">
    <svg
      ref="svgGraph"
      height="100%"
      width="100%"
      viewBox="0 -10 100 120"
      preserveAspectRatio="none"
      class="graph">

      <GraphNight
        v-if="sunsetPercent && sunrisePercent"
        :sunset="sunsetPercent"
        :sunrise="sunrisePercent" />

      <GraphSeparators />

      <NowMarker
        v-if="minX && maxX"
        :dayStart="minX"
        :dayEnd="maxX" />

      <GraphPath
        v-if="heightData"
        :highColor="highColor"
        :lowColor="lowColor"
        :heightData="heightData" />

      <GraphExtremeDots
        v-if="extremeData"
        :extremes="extremeData"
        :highColor="highColor"
        :dotWidth="dotWith(5)"
        :dotHeight="dotHeight(5)"
        :lowColor="lowColor" />

      <ellipse v-if="mousePosition && tides"
        :cx="mousePosition"
        :cy="mouseValue"
        :rx="dotWith(8)"
        :ry="dotHeight(8)"
        stroke-width="0"
        :fill="mouseColor" />

      <rect
        @mousemove.self="mouseMove"
        @mouseleave.self="mousePosition = null"
        @touchstart.self="touchStart"
        @touchmove.stop.self="mouseMove"
        width="100"
        height="100"
        fill="transparent" />

    </svg>

    <GraphPathBadges
      class="extremes-overlay"
      v-if="extremeData"
      :highColor="highColor"
      :lowColor="lowColor"
      :extremes="extremeData" />

    <GraphInfo
      class="info-badge"
      v-if="tides && mousePosition"
      :dt="mouseDt"
      :height="mouseHeight" />

  </div>
</template>

<script>
import { getAbsoluteValue, convertedValues, yForX, getPercentValue } from 'src/utils/plot'
import { blendColor } from 'src/utils/color'

import GraphPath from './Path'
import GraphInfo from './Info'
import GraphPathBadges from './PathBadges'
import GraphExtremeDots from './ExtremeDots'
import GraphNight from './Night'
import GraphSeparators from './Separators'
import NowMarker from './NowMarker'

export default {
  name: 'TideGraph',
  props: {
    tides: { type: Object },
    highColor: { type: String, default: '#00aa55' },
    lowColor: { type: String, default: '#0055aa' },
    sunrise: { type: Number },
    sunset: { type: Number }
  },
  components: {
    GraphPath,
    GraphInfo,
    GraphPathBadges,
    GraphExtremeDots,
    GraphNight,
    GraphSeparators,
    NowMarker
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
      if (!this.tides) return null
      return this.tides.heights[0].dt
    },
    maxX () {
      if (!this.tides) return null
      return this.tides.heights[this.tides.heights.length - 1].dt
    },
    minY () {
      if (!this.tides) return null
      return this.tides.datums.find(datum => datum.name === 'HAT').height
    },
    maxY () {
      if (!this.tides) return null
      return this.tides.datums.find(datum => datum.name === 'LAT').height
    },
    svgAspectRatio () {
      return this.svgDimensions.w / this.svgDimensions.h * 1.2
    },
    mouseValue () {
      return yForX(this.heightData, this.mousePosition)
    },
    mouseHeight () {
      return getAbsoluteValue(this.mouseValue, this.minY, this.maxY)
    },
    mouseDt () {
      return getAbsoluteValue(this.mousePosition, this.minX, this.maxX)
    },
    extremesYPercents () {
      return this.extremeData.map(point => point.y)
    },
    minYPercent () {
      return Math.min(...this.extremesYPercents)
    },
    maxYPercent () {
      return Math.max(...this.extremesYPercents)
    },
    spanYPercent () {
      return this.maxYPercent - this.minYPercent
    },
    mouseColor () {
      let fromMin = (this.mouseValue - this.minYPercent)
      let ratio = fromMin / this.spanYPercent
      return blendColor(this.highColor, this.lowColor, ratio)
    },
    sunrisePercent () {
      if (!this.tides) return null
      return getPercentValue(this.sunrise, this.minX, this.maxX)
    },
    sunsetPercent () {
      if (!this.tides) return null
      return getPercentValue(this.sunset, this.minX, this.maxX)
    }
  },
  methods: {
    dotWith (radius) {
      return 100 / this.svgDimensions.w * radius
    },
    dotHeight (radius) {
      return this.dotWith(radius) * this.svgAspectRatio
    },
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
    top: 20px;
    left: 20px;
  }
}
.graph {
  background-color: #efefef;
}

.extremes-overlay {
  position: absolute;
  top: 8%;
  left: 0;
  right: 0;
  bottom: 8%;
  background-color: transparent;
  pointer-events:none;
}
</style>
