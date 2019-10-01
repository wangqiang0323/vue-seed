import Vue from 'vue'
import Vuex from 'vuex'
import Articles from './articles'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {},
  modules: {
    Articles
  }
})
