/**
 * 用户状态管理模块
 */

import { loginByWeixin, getUserInfo, logout } from '@/api/auth'
import { saveToken, clearToken } from '@/utils/request'

const state = {
  userInfo: null,
  hasLogin: false,
  identityVerified: false,
  hasActiveLocker: false
}

const getters = {
  // 获取用户信息
  userInfo: state => state.userInfo,
  // 是否已登录
  hasLogin: state => state.hasLogin,
  // 是否已进行身份验证
  identityVerified: state => state.identityVerified,
  // 是否有活跃的储物柜
  hasActiveLocker: state => state.hasActiveLocker,
  // 获取用户昵称
  nickname: state => state.userInfo?.nickname || '未登录'
}

const mutations = {
  // 设置用户信息
  SET_USER_INFO(state, userInfo) {
    state.userInfo = userInfo
    state.hasLogin = !!userInfo
    state.identityVerified = userInfo?.identityVerified || false
    state.hasActiveLocker = userInfo?.hasActiveLocker || false
  },
  
  // 清除用户信息
  CLEAR_USER_INFO(state) {
    state.userInfo = null
    state.hasLogin = false
    state.identityVerified = false
    state.hasActiveLocker = false
  },
  
  // 更新身份验证状态
  UPDATE_IDENTITY_STATUS(state, verified) {
    state.identityVerified = verified
    if (state.userInfo) {
      state.userInfo.identityVerified = verified
    }
  },
  
  // 更新储物柜状态
  UPDATE_LOCKER_STATUS(state, hasLocker) {
    state.hasActiveLocker = hasLocker
    if (state.userInfo) {
      state.userInfo.hasActiveLocker = hasLocker
    }
  }
}

const actions = {
  // 微信登录
  async loginByWeixin({ commit }, { code, userInfo }) {
    try {
      const res = await loginByWeixin({ code, userInfo })
      
      // 保存 Token
      saveToken(res.token, res.tokenExpire)
      
      // 保存用户信息
      commit('SET_USER_INFO', res.userInfo)
      
      // 存储到本地
      uni.setStorageSync('userInfo', res.userInfo)
      
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 获取用户信息
  async getUserInfo({ commit }) {
    try {
      const userInfo = await getUserInfo()
      commit('SET_USER_INFO', userInfo)
      
      // 更新本地存储
      uni.setStorageSync('userInfo', userInfo)
      
      return userInfo
    } catch (error) {
      throw error
    }
  },
  
  // 退出登录
  async logout({ commit }) {
    try {
      await logout()
    } catch (error) {
      // 忽略退出接口错误
    } finally {
      // 清除 Token
      clearToken()
      
      // 清除用户信息
      commit('CLEAR_USER_INFO')
      
      // 清除本地存储
      uni.removeStorageSync('userInfo')
    }
  },
  
  // 从本地存储恢复用户信息
  async restoreUserInfo({ commit }) {
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      commit('SET_USER_INFO', userInfo)
      
      // 尝试刷新用户信息
      try {
        await this.dispatch('user/getUserInfo')
      } catch (error) {
        // Token 可能已过期，清除登录状态
        await this.dispatch('user/logout')
      }
    }
  },
  
  // 更新身份验证状态
  updateIdentityStatus({ commit }, verified) {
    commit('UPDATE_IDENTITY_STATUS', verified)
    
    // 更新本地存储
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      userInfo.identityVerified = verified
      uni.setStorageSync('userInfo', userInfo)
    }
  },
  
  // 更新储物柜状态
  updateLockerStatus({ commit }, hasLocker) {
    commit('UPDATE_LOCKER_STATUS', hasLocker)
    
    // 更新本地存储
    const userInfo = uni.getStorageSync('userInfo')
    if (userInfo) {
      userInfo.hasActiveLocker = hasLocker
      uni.setStorageSync('userInfo', userInfo)
    }
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}