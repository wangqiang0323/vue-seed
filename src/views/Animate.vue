<template>
  <div class="animatePage">
    <van-button @click="long" :loading="loading">{{!isLong ? 'short': 'long'}}</van-button>
    <van-button @click="goRight">goRight</van-button>
    <van-button @click="goLeft">goLeft</van-button>
    <van-button @click="rotateX">rotate</van-button>
    <van-button @click="resetR">resetR</van-button>
    <div class="animate" ref="divM"></div>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'

@Component
export default class AnimatePage extends Vue {
  isLong = false
  isRight = false
  isRotate = false
  loading = false
  $refs!: { divM: HTMLFormElement }
  /**
   * move
   */
  public long() {
    this.isLong = !this.isLong
    this.loading = true
    setTimeout(() => {
      this.loading = false
    }, 2000)
    this.$refs.divM.style.width = this.isLong ? '100px' : '300px'
  }
  public short() {
    this.$refs.divM.style.width = '100px'
  }
  /**
   * goRight
   */
  public goRight() {
    this.$refs.divM.style.left = '100%'
  }
  public goLeft() {
    this.$refs.divM.style.left = '0%'
  }

  /**
   * rotateX
   */
  public rotateX() {
    console.log(this.$refs.divM.style.transform)
    this.$refs.divM.style.transform = 'rotate(270deg)'
  }
  public resetR() {
    console.log(this.$refs.divM.style.transform)
    this.$refs.divM.style.transform = 'rotate(0deg)'
  }
}
</script>
<style lang="scss" scoped>
.animatePage {
  position: relative;
}
.animate {
  position: relative;
  left: 0;
  width: 100px;
  height: 100px;
  border: 1px solid red;
  transition: 2s all ease-in-out;
}
</style>