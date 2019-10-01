import * as types from '@/constants/mutation-types'
import * as api from '@/api/articles'

const state = {
  articles: []
}

const getters = {}

const actions = {
  async getArticles({commit}: any) {
    const res = await api.GetArticles()
    commit(types.SET_ARTICLES, res.data)
  }
}

const mutations = {
  [types.SET_ARTICLES](s: any, payload: any) {
    s.articles = s.articles.concat(payload)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
