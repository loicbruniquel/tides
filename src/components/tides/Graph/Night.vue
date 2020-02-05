<template>
  <g class="night">
    <defs>
      <linearGradient id="sunrise" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="nightColor" />
        <stop offset="100%" :stop-color="dayColor" />
      </linearGradient>
      <linearGradient id="sunset" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" :stop-color="dayColor" />
        <stop offset="100%" :stop-color="nightColor" />
      </linearGradient>
    </defs>

    <rect
      x="0"
      y="-10"
      width="100"
      height="120"
      :fill="dayColor" />

    <rect
      x="0"
      y="-10"
      :width="sunrise"
      height="120"
      :fill="nightColor" />

    <rect
      :x="sunrise-fadeWidth/2"
      y="-10"
      :width="fadeWidth"
      height="120"
      fill="url(#sunrise)" />

    <rect
      :x="sunset"
      y="-10"
      :width="100-sunset"
      height="120"
      :fill="nightColor" />

    <rect
      :x="sunset-fadeWidth/2"
      y="-10"
      :width="fadeWidth"
      height="120"
      fill="url(#sunset)" />

  </g>
</template>

<script>
export default {
  name: 'GraphNight',
  props: {
    sunrise: { type: Number, required: true },
    sunset: { type: Number, required: true },
    fadeWidth: { type: Number, default: 6 },
    nightColor: { type: String, default: '#d5d5d9' },
    dayColor: { type: String, default: '#f2f1f2' }
  }
}
</script>
