<template>
  <div class="home">
    <Three msg="Welcome to Your Vue.js + TypeScript App"/>
    <TPath msg="Welcome"></TPath>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Three from '@/components/Three.vue'; // @ is an alias to /src
import TPath from '@/components/TPath.vue';

@Component({
  components: {
    Three,
    TPath,
  },
})
export default class Home extends Vue {}
</script>
