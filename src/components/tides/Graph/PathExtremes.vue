<template>
  <div class="extremes">
    <Extreme
      v-for="extreme in extremes"
      :highColor="highColor"
      :lowColor="lowColor"
      :extreme="extreme"
      :key="extreme.dt" />
  </div>
</template>

<script>
import Extreme from './Extreme'

export default {
  name: 'GraphPathExtremes',
  components: {
    Extreme
  },
  props: {
    extremes: { type: Array, required: true },
    highColor: { type: String, required: true },
    lowColor: { type: String, required: true }
  }
}
</script>
