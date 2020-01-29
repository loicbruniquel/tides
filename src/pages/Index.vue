<template>
  <q-page class="">
     <q-btn label="Add station" to="/stations/new" />
    <StationList />
  </q-page>
</template>

<script>
import StationList from 'components/stations/List.vue'

export default {
  name: 'PageIndex',
  components: {
    StationList
  }
}
</script>
