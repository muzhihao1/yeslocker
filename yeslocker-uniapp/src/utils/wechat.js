/**
 * 微信小程序专用工具函数
 * 包含登录、扫码、授权等功能
 */

/**
 * 微信登录
 * @returns {Promise<Object>} 返回用户信息和 token
 */
export async function wechatLogin() {
  try {
    // 开发环境特殊处理
    // #ifdef MP-WEIXIN
    const systemInfo = uni.getSystemInfoSync()
    if (process.env.NODE_ENV === 'development' && systemInfo.platform === 'devtools') {
      console.log('[wechatLogin] 开发者工具环境，使用简化登录流程')
      
      // 开发者工具中跳过 getUserProfile
      const mockUserInfo = {
        nickName: '测试用户',
        avatarUrl: '/static/default-avatar.png',
        gender: 1,
        country: '中国',
        province: '北京',
        city: '北京',
        language: 'zh_CN'
      }
      
      // 获取登录凭证
      const loginRes = await uni.login({
        provider: 'weixin'
      })
      
      if (!loginRes.code) {
        throw new Error('获取登录凭证失败')
      }
      
      // 调用后端接口进行登录
      const baseUrl = process.env.VUE_APP_BASE_API || 'http://localhost:8080'
      const [error, response] = await uni.request({
        url: `${baseUrl}/wx/auth/login_by_weixin`,
        method: 'POST',
        data: {
          code: loginRes.code,
          userInfo: mockUserInfo
        }
      })
      
      if (error) {
        throw error
      }
      
      const { data } = response
      
      if (data.errno !== 0) {
        throw new Error(data.errmsg || '登录失败')
      }
      
      // 保存登录信息
      const loginData = data.data
      uni.setStorageSync('token', loginData.token)
      uni.setStorageSync('userInfo', loginData.userInfo)
      
      return loginData
    }
    // #endif
    
    // 真机环境或非开发者工具
    // 重要：getUserProfile必须在用户点击事件的同步流程中调用
    // 所以需要先获取用户信息，再获取登录凭证
    
    // 1. 先获取用户信息（必须在点击事件的同步流程中）
    const userInfoRes = await uni.getUserProfile({
      desc: '用于完善用户资料',
      lang: 'zh_CN'
    })
    
    // 2. 用户同意授权后，获取登录凭证
    const loginRes = await uni.login({
      provider: 'weixin'
    })
    
    if (!loginRes.code) {
      throw new Error('获取登录凭证失败')
    }
    
    // 3. 调用后端接口进行登录
    const baseUrl = process.env.VUE_APP_BASE_API || 'http://localhost:8080'
    const [error, response] = await uni.request({
      url: `${baseUrl}/wx/auth/login_by_weixin`,
      method: 'POST',
      data: {
        code: loginRes.code,
        userInfo: userInfoRes.userInfo,
        encryptedData: userInfoRes.encryptedData,
        iv: userInfoRes.iv,
        rawData: userInfoRes.rawData,
        signature: userInfoRes.signature
      }
    })
    
    if (error) {
      throw error
    }
    
    const { data } = response
    
    if (data.errno !== 0) {
      throw new Error(data.errmsg || '登录失败')
    }
    
    // 4. 保存登录信息
    const loginData = data.data
    uni.setStorageSync('token', loginData.token)
    uni.setStorageSync('userInfo', loginData.userInfo)
    
    return loginData
  } catch (error) {
    console.error('微信登录失败:', error)
    throw error
  }
}

/**
 * 扫描二维码
 * @param {Object} options 扫码选项
 * @param {boolean} options.onlyFromCamera 是否只能从相机扫码
 * @param {Array} options.scanType 扫码类型
 * @returns {Promise<string>} 返回扫码结果
 */
export async function scanQRCode(options = {}) {
  try {
    // 检查相机权限
    const authRes = await uni.authorize({
      scope: 'scope.camera'
    }).catch(() => null)
    
    if (!authRes) {
      // 用户拒绝授权，引导到设置页
      const modalRes = await uni.showModal({
        title: '提示',
        content: '需要相机权限才能扫码，请在设置中开启',
        confirmText: '去设置',
        cancelText: '取消'
      })
      
      if (modalRes.confirm) {
        const settingRes = await uni.openSetting()
        if (!settingRes.authSetting['scope.camera']) {
          throw new Error('未获得相机权限')
        }
      } else {
        throw new Error('用户取消授权')
      }
    }
    
    // 调用扫码
    const scanRes = await uni.scanCode({
      onlyFromCamera: options.onlyFromCamera !== false,
      scanType: options.scanType || ['qrCode']
    })
    
    if (!scanRes.result) {
      throw new Error('扫码失败')
    }
    
    return scanRes.result
  } catch (error) {
    console.error('扫码失败:', error)
    throw error
  }
}

/**
 * 获取用户手机号
 * @param {string} code 手机号获取凭证（通过 button 的 getPhoneNumber 事件获取）
 * @returns {Promise<string>} 返回手机号
 */
export async function getPhoneNumber(code) {
  try {
    if (!code) {
      throw new Error('获取手机号凭证失败')
    }
    
    // 开发环境特殊处理
    // #ifdef MP-WEIXIN
    const systemInfo = uni.getSystemInfoSync()
    if (process.env.NODE_ENV === 'development' && systemInfo.platform === 'devtools') {
      console.log('[getPhoneNumber] 开发者工具环境，使用模拟数据')
      
      // 模拟不同的手机号
      if (code.includes('138')) {
        return '13800138000'
      } else if (code.includes('139')) {
        return '13900139000'
      } else if (code.includes('137')) {
        return '13700137000'
      } else {
        return '13600136000'
      }
    }
    // #endif
    
    // 调用后端接口解密手机号
    const baseUrl = process.env.VUE_APP_BASE_API || 'http://localhost:8080'
    const [error, response] = await uni.request({
      url: `${baseUrl}/wx/auth/phone`,
      method: 'POST',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      data: {
        code
      }
    })
    
    if (error) {
      throw error
    }
    
    const { data } = response
    
    if (data.errno !== 0) {
      throw new Error(data.errmsg || '获取手机号失败')
    }
    
    return data.data.phoneNumber
  } catch (error) {
    console.error('获取手机号失败:', error)
    throw error
  }
}

/**
 * 订阅消息
 * @param {Array<string>} tmplIds 模板ID列表
 * @returns {Promise<Object>} 返回订阅结果
 */
export async function subscribeMessage(tmplIds) {
  try {
    // #ifdef MP-WEIXIN
    const res = await uni.requestSubscribeMessage({
      tmplIds
    })
    
    // 检查订阅结果
    const acceptedIds = []
    const rejectedIds = []
    
    tmplIds.forEach(id => {
      if (res[id] === 'accept') {
        acceptedIds.push(id)
      } else {
        rejectedIds.push(id)
      }
    })
    
    return {
      accepted: acceptedIds,
      rejected: rejectedIds,
      allAccepted: rejectedIds.length === 0
    }
    // #endif
    
    // #ifndef MP-WEIXIN
    console.warn('订阅消息仅在微信小程序中可用')
    return {
      accepted: [],
      rejected: tmplIds,
      allAccepted: false
    }
    // #endif
  } catch (error) {
    console.error('订阅消息失败:', error)
    throw error
  }
}

/**
 * 选择位置
 * @returns {Promise<Object>} 返回位置信息
 */
export async function chooseLocation() {
  try {
    // 检查位置权限
    const authRes = await uni.authorize({
      scope: 'scope.userLocation'
    }).catch(() => null)
    
    if (!authRes) {
      // 用户拒绝授权，引导到设置页
      const modalRes = await uni.showModal({
        title: '提示',
        content: '需要位置权限才能选择地址，请在设置中开启',
        confirmText: '去设置',
        cancelText: '取消'
      })
      
      if (modalRes.confirm) {
        const settingRes = await uni.openSetting()
        if (!settingRes.authSetting['scope.userLocation']) {
          throw new Error('未获得位置权限')
        }
      } else {
        throw new Error('用户取消授权')
      }
    }
    
    // 选择位置
    const location = await uni.chooseLocation()
    
    return {
      name: location.name,
      address: location.address,
      latitude: location.latitude,
      longitude: location.longitude
    }
  } catch (error) {
    console.error('选择位置失败:', error)
    throw error
  }
}

/**
 * 解析扫码结果
 * @param {string} result 扫码结果
 * @returns {Object} 解析后的数据
 */
export function parseScanResult(result) {
  try {
    // 尝试解析为 JSON
    if (result.startsWith('{') && result.endsWith('}')) {
      return JSON.parse(result)
    }
    
    // 尝试解析 URL 参数
    if (result.includes('?')) {
      const url = new URL(result.includes('://') ? result : `http://example.com${result}`)
      const params = {}
      url.searchParams.forEach((value, key) => {
        params[key] = value
      })
      return params
    }
    
    // 尝试解析为储物柜编号（格式：LOCKER:A01）
    if (result.startsWith('LOCKER:')) {
      return {
        type: 'locker',
        lockerNumber: result.substring(7)
      }
    }
    
    // 尝试解析为凭证码（格式：VOUCHER:XXXX-XXXX-XXXX）
    if (result.startsWith('VOUCHER:')) {
      return {
        type: 'voucher',
        voucherCode: result.substring(8)
      }
    }
    
    // 默认当作凭证码
    return {
      type: 'voucher',
      voucherCode: result
    }
  } catch (error) {
    console.error('解析扫码结果失败:', error)
    // 返回原始结果
    return {
      type: 'unknown',
      raw: result
    }
  }
}

/**
 * 检查是否在微信环境
 * @returns {boolean}
 */
export function isWechat() {
  // #ifdef MP-WEIXIN
  return true
  // #endif
  
  // #ifndef MP-WEIXIN
  return false
  // #endif
}

/**
 * 获取系统信息
 * @returns {Object} 系统信息
 */
export function getSystemInfo() {
  const info = uni.getSystemInfoSync()
  
  return {
    platform: info.platform,
    version: info.version,
    sdkVersion: info.SDKVersion,
    screenWidth: info.screenWidth,
    screenHeight: info.screenHeight,
    windowWidth: info.windowWidth,
    windowHeight: info.windowHeight,
    statusBarHeight: info.statusBarHeight,
    safeArea: info.safeArea,
    isIphoneX: info.model && (info.model.includes('iPhone X') || info.model.includes('iPhone 11') || info.model.includes('iPhone 12') || info.model.includes('iPhone 13') || info.model.includes('iPhone 14'))
  }
}

/**
 * 检查更新
 */
export function checkUpdate() {
  // #ifdef MP-WEIXIN
  const updateManager = uni.getUpdateManager()
  
  updateManager.onCheckForUpdate(function (res) {
    // 请求完新版本信息的回调
    console.log('是否有新版本:', res.hasUpdate)
  })
  
  updateManager.onUpdateReady(function () {
    uni.showModal({
      title: '更新提示',
      content: '新版本已经准备好，是否重启应用？',
      success(res) {
        if (res.confirm) {
          // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
          updateManager.applyUpdate()
        }
      }
    })
  })
  
  updateManager.onUpdateFailed(function () {
    // 新版本下载失败
    uni.showModal({
      title: '更新提示',
      content: '新版本下载失败，请检查网络后重试',
      showCancel: false
    })
  })
  // #endif
}

/**
 * 分享配置
 * @param {Object} options 分享选项
 * @returns {Object} 分享配置对象
 */
export function getShareConfig(options = {}) {
  const defaultConfig = {
    title: '耶氏台球杆存取 - 专业的球杆储物服务',
    path: '/pages/home/index',
    imageUrl: '/static/share-image.png'
  }
  
  return {
    ...defaultConfig,
    ...options
  }
}

/**
 * 生成场景值
 * @param {Object} params 参数对象
 * @returns {string} 场景值字符串
 */
export function generateScene(params) {
  // 将参数对象转换为场景值字符串
  // 格式：key1=value1&key2=value2
  return Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&')
}

/**
 * 解析场景值
 * @param {string} scene 场景值字符串
 * @returns {Object} 参数对象
 */
export function parseScene(scene) {
  if (!scene) return {}
  
  const params = {}
  scene.split('&').forEach(item => {
    const [key, value] = item.split('=')
    if (key) {
      params[key] = decodeURIComponent(value || '')
    }
  })
  
  return params
}

export default {
  wechatLogin,
  scanQRCode,
  getPhoneNumber,
  subscribeMessage,
  chooseLocation,
  parseScanResult,
  isWechat,
  getSystemInfo,
  checkUpdate,
  getShareConfig,
  generateScene,
  parseScene
}