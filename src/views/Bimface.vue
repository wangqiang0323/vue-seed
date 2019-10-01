<template>
  <div id="view"></div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import { BimMap } from '@/plugins/BimMap'

@Component
export default class Bimface extends Vue {
  bimMap: any

  mounted() {
    this.init()
  }

  init() {
    this.bimMap = new BimMap('view', () => {}, false)
  }
}
</script>
<style lang="scss" scoped>
#view {
  height: calc(100vh - 78px);
  width: 100vw;
}
</style>