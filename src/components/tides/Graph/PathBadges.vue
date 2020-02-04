<template>
  <div class="extremes">
    <ExtremeBadge
      v-for="extreme in extremes"
      :highColor="highColor"
      :lowColor="lowColor"
      :extreme="extreme"
      :key="extreme.dt" />
  </div>
</template>

<script>
import ExtremeBadge from './ExtremeBadge'

export default {
  name: 'GraphPathBadges',
  components: {
    ExtremeBadge
  },
  props: {
    extremes: { type: Array, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true }
  }
}
</script>
