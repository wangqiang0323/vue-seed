<template>
  <div>
    <van-button @click="getArticles">Articles</van-button>
    <van-list v-model="loading" :finished="finished" finished-text="没有更多了" @load="onLoad">
      <van-cell v-for="item in articles" :key="item.createTime" :title="item.title" />
    </van-list>
  </div>
</template>
<script lang="ts">
import Vue from 'vue'
import { mapActions, mapState } from 'vuex'

export default Vue.extend({
  data() {
    return {
      loading: false,
      finished: false
    }
  },
  computed: {
    ...mapState('Articles', ['articles'])
  },
  methods: {
    ...mapActions('Articles', ['getArticles']),
    async onLoad() {
      const res = await this.getArticles()
      this.loading = false
      this.finished = this.articles.length > 40
    }
  },
})
</script>