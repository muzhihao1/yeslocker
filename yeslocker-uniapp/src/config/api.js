/**
 * API配置文件
 * 统一管理所有环境的API地址
 */

// 判断当前环境
const isDev = process.env.NODE_ENV === 'development'

// 获取环境变量中的API地址，如果没有则使用默认值
const getBaseURL = () => {
  // 优先使用环境变量
  if (process.env.VUE_APP_BASE_API) {
    return process.env.VUE_APP_BASE_API
  }
  
  // #ifdef H5
  // H5平台可以使用相对路径
  if (isDev) {
    return 'http://localhost:8080'
  }
  // #endif
  
  // #ifdef MP-WEIXIN
  // 微信小程序必须使用完整的URL
  if (isDev) {
    // 开发环境 - 请替换为您的本地后端地址
    // 如果使用内网穿透，例如：return 'https://xxx.ngrok.io'
    // 如果使用局域网IP，例如：return 'http://192.168.1.100:8080'
    return 'http://localhost:8080'
  }
  // #endif
  
  // 生产环境 - 必须是HTTPS协议，且域名已在微信小程序后台配置
  return 'https://api.yeslocker.com'
}

// API基础地址配置
const config = {
  baseURL: getBaseURL()
}

// API路径配置
const apiPaths = {
  // 认证相关
  wxLogin: '/wx/auth/login_by_weixin',  // 微信登录专用接口
  wxLogout: '/wx/auth/logout',
  wxInfo: '/wx/auth/info',
  
  // 用户相关
  userProfile: '/wx/user/profile',
  userUpdate: '/wx/user/update',
  userBindPhone: '/wx/user/bindPhone',
  
  // 存储相关
  storageStore: '/wx/storage/store',
  storageRetrieve: '/wx/storage/retrieve',
  storageVoucher: '/wx/storage/voucher',
  storageHistory: '/wx/storage/history',
  
  // 储物柜相关
  lockerList: '/wx/locker/list',
  lockerStatus: '/wx/locker/status',
  
  // 申请制流程API
  lockerMyLocker: '/wx/locker/my-locker',  // 获取用户的储物柜信息
  lockerRequestCreate: '/wx/locker/request/create',  // 创建存取申请
  lockerRequestList: '/wx/locker/request/list',  // 查询申请记录
  lockerRequestDetail: '/wx/locker/request/detail',  // 查询申请详情
  lockerRequestConfirmReturn: '/wx/locker/request/confirm-return',  // 确认钥匙归还
  
  // 其他
  uploadImage: '/wx/common/upload',
  qrcodeScan: '/wx/common/qrcode/scan',
}

// 导出配置
export default {
  baseURL: config.baseURL,
  api: apiPaths
}

/**
 * 获取完整的API URL
 * @param {string} apiName - API名称
 * @returns {string} 完整的API URL
 */
export function getApiUrl(apiName) {
  const apiPath = apiPaths[apiName]
  if (!apiPath) {
    console.error(`API "${apiName}" not found in config`)
    return ''
  }
  return config.baseURL + apiPath
}

/**
 * 使用说明：
 * 
 * 1. 开发环境配置：
 *    - 修改 development.baseURL 为您的本地后端地址
 *    - 在微信开发者工具中勾选"不校验合法域名"选项
 * 
 * 2. 生产环境配置：
 *    - 修改 production.baseURL 为您的线上API地址
 *    - 确保域名已在微信小程序后台添加到"request合法域名"
 *    - 必须使用HTTPS协议
 *    - 不能使用IP地址或带端口的域名（除80/443外）
 * 
 * 3. 使用方式：
 *    import apiConfig from '@/config/api'
 *    const loginUrl = apiConfig.baseURL + apiConfig.api.wxLogin
 */