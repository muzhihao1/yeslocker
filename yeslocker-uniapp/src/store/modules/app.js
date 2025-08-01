/**
 * 应用状态管理模块
 */

const state = {
  // 系统信息
  systemInfo: {},
  // 网络状态
  networkType: 'wifi',
  // 是否在线
  isOnline: true,
  // 加载状态
  loading: false,
  // 加载文本
  loadingText: '加载中...',
  // 全局配置
  config: {
    voucherValidDays: 30,
    cleanAlertDays: 90,
    maxStorePerUser: 1,
    imageCountLimit: 9,
    imageSizeLimit: 5 // MB
  }
}

const getters = {
  // 是否是 iOS 系统
  isIOS: state => state.systemInfo.platform === 'ios',
  // 是否是 Android 系统
  isAndroid: state => state.systemInfo.platform === 'android',
  // 状态栏高度
  statusBarHeight: state => state.systemInfo.statusBarHeight || 0,
  // 导航栏高度（包含状态栏）
  navBarHeight: state => {
    const statusBarHeight = state.systemInfo.statusBarHeight || 0
    // 标题栏高度：iOS 44，Android 48
    const titleBarHeight = state.systemInfo.platform === 'ios' ? 44 : 48
    return statusBarHeight + titleBarHeight
  },
  // 是否在线
  isOnline: state => state.isOnline,
  // 全局配置
  config: state => state.config
}

const mutations = {
  // 设置系统信息
  SET_SYSTEM_INFO(state, info) {
    state.systemInfo = info
  },
  
  // 设置网络类型
  SET_NETWORK_TYPE(state, type) {
    state.networkType = type
    state.isOnline = type !== 'none'
  },
  
  // 设置加载状态
  SET_LOADING(state, { loading, text }) {
    state.loading = loading
    if (text) {
      state.loadingText = text
    }
  },
  
  // 更新配置
  UPDATE_CONFIG(state, config) {
    state.config = { ...state.config, ...config }
  }
}

const actions = {
  // 初始化应用
  async initApp({ commit, dispatch }) {
    // 获取系统信息
    const systemInfo = uni.getSystemInfoSync()
    commit('SET_SYSTEM_INFO', systemInfo)
    
    // 获取网络状态
    uni.getNetworkType({
      success: (res) => {
        commit('SET_NETWORK_TYPE', res.networkType)
      }
    })
    
    // 监听网络状态变化
    uni.onNetworkStatusChange((res) => {
      commit('SET_NETWORK_TYPE', res.networkType)
      
      if (!res.isConnected) {
        uni.showToast({
          title: '网络连接已断开',
          icon: 'none'
        })
      }
    })
    
    // 恢复用户信息
    await dispatch('user/restoreUserInfo', null, { root: true })
    
    // 如果已登录，获取储物柜状态
    if (this.getters['user/hasLogin']) {
      try {
        await dispatch('locker/getLockerStatus', null, { root: true })
      } catch (error) {
        console.error('获取储物柜状态失败', error)
      }
    }
  },
  
  // 显示加载
  showLoading({ commit }, text = '加载中...') {
    commit('SET_LOADING', { loading: true, text })
    uni.showLoading({
      title: text,
      mask: true
    })
  },
  
  // 隐藏加载
  hideLoading({ commit }) {
    commit('SET_LOADING', { loading: false })
    uni.hideLoading()
  },
  
  // 检查更新
  async checkUpdate() {
    const updateManager = uni.getUpdateManager()
    
    updateManager.onCheckForUpdate((res) => {
      // 请求完新版本信息的回调
      console.log('是否有新版本：', res.hasUpdate)
    })
    
    updateManager.onUpdateReady(() => {
      uni.showModal({
        title: '更新提示',
        content: '新版本已经准备好，是否重启应用？',
        success: (res) => {
          if (res.confirm) {
            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
            updateManager.applyUpdate()
          }
        }
      })
    })
    
    updateManager.onUpdateFailed(() => {
      // 新版本下载失败
      console.error('新版本下载失败')
    })
  },
  
  // 更新配置
  updateConfig({ commit }, config) {
    commit('UPDATE_CONFIG', config)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}