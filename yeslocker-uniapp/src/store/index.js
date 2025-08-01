/**
 * Vuex 状态管理
 */

import Vue from 'vue'
import Vuex from 'vuex'
import user from './modules/user'
import locker from './modules/locker'
import app from './modules/app'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: {
    user,
    locker,
    app
  },
  
  // 严格模式，开发环境开启
  strict: process.env.NODE_ENV !== 'production'
})

export default store