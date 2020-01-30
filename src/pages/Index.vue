<template>
  <q-page class="">
    <h2>Stations</h2>
    <q-btn outline round color="primary" icon="add" to="/stations/new" />
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
