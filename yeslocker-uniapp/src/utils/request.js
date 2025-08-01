/**
 * 请求封装工具
 * 统一处理 API 请求、错误处理、Token 管理
 */

import { setupMock } from '@/mock/api.js'
import { simpleMock } from '@/mock/simple-mock.js'
import { toast } from '@/utils/toast.js'
import { loading } from '@/utils/loading.js'

// API 基础配置
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/wx'  // 开发环境
  : 'https://api.yeslocker.com/wx'  // 生产环境

// Token 存储键名
const TOKEN_KEY = 'litemall-token'
const TOKEN_EXPIRE_KEY = 'litemall-token-expire'

// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 30000

// 最大重试次数
const MAX_RETRY_COUNT = 2

// 可重试的状态码
const RETRYABLE_STATUS_CODES = [502, 503, 504]

// 错误类型定义
const ERROR_TYPES = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  CLIENT_ERROR: 'CLIENT_ERROR',
  BUSINESS_ERROR: 'BUSINESS_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR'
}

// 错误消息映射
const ERROR_MESSAGES = {
  NETWORK_ERROR: '网络连接失败，请检查网络设置',
  TIMEOUT_ERROR: '请求超时，请稍后重试',
  401: '登录状态已过期，请重新登录',
  403: '无权限访问该资源',
  404: '请求的资源不存在',
  500: '服务器内部错误，请稍后重试',
  502: '服务器网关错误，请稍后重试',
  503: '服务器暂时不可用，请稍后重试',
  504: '服务器网关超时，请稍后重试',
  DEFAULT_SERVER: '服务器错误，请稍后重试',
  DEFAULT_CLIENT: '请求参数错误',
  DEFAULT_UNKNOWN: '未知错误，请稍后重试'
}

// 自定义错误类
class RequestError extends Error {
  constructor(message, type, code, details = {}) {
    super(message)
    this.name = 'RequestError'
    this.type = type
    this.code = code
    this.details = details
    this.timestamp = new Date().toISOString()
  }
}

// 错误日志记录
function logError(error, context = {}) {
  const errorLog = {
    timestamp: new Date().toISOString(),
    type: error.type || ERROR_TYPES.UNKNOWN_ERROR,
    code: error.code || 'UNKNOWN',
    message: error.message,
    details: error.details || {},
    context: {
      url: context.url,
      method: context.method,
      data: context.data,
      headers: context.headers
    }
  }
  
  // 开发环境输出详细错误信息
  if (process.env.NODE_ENV === 'development') {
    console.error('[Request Error]', errorLog)
  }
  
  // 生产环境可以发送到错误监控服务
  if (process.env.NODE_ENV === 'production') {
    // TODO: 发送到错误监控服务（如 Sentry）
  }
  
  // 存储最近的错误日志（用于调试）
  const errorLogs = uni.getStorageSync('request_error_logs') || []
  errorLogs.unshift(errorLog)
  // 只保留最近 20 条错误
  if (errorLogs.length > 20) {
    errorLogs.length = 20
  }
  uni.setStorageSync('request_error_logs', errorLogs)
}

// 获取存储的 Token
function getToken() {
  const token = uni.getStorageSync(TOKEN_KEY)
  const expire = uni.getStorageSync(TOKEN_EXPIRE_KEY)
  
  // 检查 Token 是否过期
  if (token && expire && new Date().getTime() < expire) {
    return token
  }
  
  // Token 过期或不存在，清除存储
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(TOKEN_EXPIRE_KEY)
  return null
}

// 保存 Token
export function saveToken(token, expire) {
  uni.setStorageSync(TOKEN_KEY, token)
  uni.setStorageSync(TOKEN_EXPIRE_KEY, expire)
}

// 清除 Token
export function clearToken() {
  uni.removeStorageSync(TOKEN_KEY)
  uni.removeStorageSync(TOKEN_EXPIRE_KEY)
}

// 判断错误类型
function getErrorType(error, statusCode) {
  if (!error || !statusCode) {
    if (error && error.errMsg) {
      if (error.errMsg.includes('request:fail')) {
        return ERROR_TYPES.NETWORK_ERROR
      }
      if (error.errMsg.includes('timeout')) {
        return ERROR_TYPES.TIMEOUT_ERROR
      }
    }
    return ERROR_TYPES.UNKNOWN_ERROR
  }
  
  if (statusCode >= 500) {
    return ERROR_TYPES.SERVER_ERROR
  }
  
  if (statusCode >= 400 && statusCode < 500) {
    return ERROR_TYPES.CLIENT_ERROR
  }
  
  return ERROR_TYPES.UNKNOWN_ERROR
}

// 获取错误消息
function getErrorMessage(error, statusCode, businessError = null) {
  // 业务错误优先使用后端返回的错误消息
  if (businessError && businessError.errmsg) {
    return businessError.errmsg
  }
  
  // 特定状态码错误消息
  if (ERROR_MESSAGES[statusCode]) {
    return ERROR_MESSAGES[statusCode]
  }
  
  // 错误类型通用消息
  const errorType = getErrorType(error, statusCode)
  if (errorType === ERROR_TYPES.NETWORK_ERROR) {
    return ERROR_MESSAGES.NETWORK_ERROR
  }
  
  if (errorType === ERROR_TYPES.TIMEOUT_ERROR) {
    return ERROR_MESSAGES.TIMEOUT_ERROR
  }
  
  if (errorType === ERROR_TYPES.SERVER_ERROR) {
    return ERROR_MESSAGES.DEFAULT_SERVER
  }
  
  if (errorType === ERROR_TYPES.CLIENT_ERROR) {
    return ERROR_MESSAGES.DEFAULT_CLIENT
  }
  
  return ERROR_MESSAGES.DEFAULT_UNKNOWN
}

// 处理错误响应
function handleErrorResponse(error, options, context) {
  const { statusCode, errno } = error
  
  // 记录错误日志
  logError(error, context)
  
  // 401 未授权，跳转登录页
  if (statusCode === 401 || errno === 401) {
    clearToken()
    
    // 避免重复跳转
    const pages = getCurrentPages()
    const currentPage = pages[pages.length - 1]
    if (currentPage && currentPage.route !== 'pages/auth/login') {
      toast.error(ERROR_MESSAGES[401], {
        duration: 2000,
        showAction: true,
        actionText: '重新登录',
        onAction: () => {
          uni.reLaunch({
            url: '/pages/auth/login'
          })
        }
      })
    }
    return
  }
  
  // 显示错误提示
  if (options.showError !== false) {
    const message = getErrorMessage(error, statusCode, error)
    
    // 403 无权限，使用警告提示
    if (statusCode === 403) {
      toast.warning(message, {
        duration: 4000,
        showClose: true
      })
    } else if (error.type === ERROR_TYPES.NETWORK_ERROR) {
      // 网络错误，显示重试选项
      toast.error(message, {
        duration: 5000,
        showAction: true,
        actionText: '重试',
        onAction: () => {
          // 触发重试逻辑
          if (context.retryCallback) {
            context.retryCallback()
          }
        }
      })
    } else {
      // 其他错误使用默认错误提示
      toast.error(message)
    }
  }
}

// 检查网络状态
function checkNetworkStatus() {
  return new Promise((resolve) => {
    uni.getNetworkType({
      success: (res) => {
        resolve(res.networkType !== 'none')
      },
      fail: () => {
        resolve(false)
      }
    })
  })
}

// 请求拦截器
function interceptRequest(options) {
  // 添加 Token
  const token = getToken()
  if (token) {
    options.header = {
      ...options.header,
      'X-Litemall-Token': token
    }
  }
  
  // 设置超时时间
  options.timeout = options.timeout || REQUEST_TIMEOUT
  
  // 显示加载提示
  if (options.showLoading !== false) {
    // 使用新的 loading 管理器
    const loadingOptions = {
      text: options.loadingText || '加载中...',
      mask: options.loadingMask !== false
    }
    
    // 如果有进度配置，使用进度加载
    if (options.showProgress) {
      options.loadingId = loading.showProgress(loadingOptions.text, 0)
    } else {
      options.loadingId = loading.show(loadingOptions)
    }
  }
  
  return options
}

// 响应拦截器
function interceptResponse(response, options, context) {
  // 隐藏加载提示
  if (options.showLoading !== false && options.loadingId) {
    loading.hide(options.loadingId)
  }
  
  const { statusCode, data } = response
  
  // 调试日志
  if (process.env.NODE_ENV === 'development') {
    console.log('[Response] 响应数据:', {
      statusCode,
      data: data,
      url: options.url,
      method: options.method
    })
  }
  
  // 请求成功
  if (statusCode === 200) {
    // 业务错误处理
    if (data.errno !== 0) {
      const error = new RequestError(
        data.errmsg || '请求失败',
        ERROR_TYPES.BUSINESS_ERROR,
        data.errno,
        { data }
      )
      
      // 处理错误响应
      handleErrorResponse({
        ...error,
        errno: data.errno
      }, options, context)
      
      return Promise.reject(error)
    }
    
    // 返回数据 - 确保返回 Promise
    return Promise.resolve(data.data)
  }
  
  // HTTP 错误
  const errorType = getErrorType(null, statusCode)
  const errorMessage = getErrorMessage(null, statusCode)
  const error = new RequestError(
    errorMessage,
    errorType,
    statusCode,
    { response }
  )
  
  // 处理错误响应
  handleErrorResponse({
    ...error,
    statusCode
  }, options, context)
  
  return Promise.reject(error)
}

// 请求重试
async function retryRequest(options, retryCount = 0) {
  try {
    return await executeRequest(options)
  } catch (error) {
    // 判断是否可重试
    const shouldRetry = retryCount < MAX_RETRY_COUNT && 
      options.retry !== false &&
      (error.type === ERROR_TYPES.NETWORK_ERROR || 
       error.type === ERROR_TYPES.TIMEOUT_ERROR ||
       RETRYABLE_STATUS_CODES.includes(error.code))
    
    if (shouldRetry) {
      // 计算重试延迟（指数退避）
      const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
      
      console.log(`[Request Retry] 第 ${retryCount + 1} 次重试，延迟 ${delay}ms`, {
        url: options.url,
        error: error.message
      })
      
      // 延迟后重试
      await new Promise(resolve => setTimeout(resolve, delay))
      return retryRequest(options, retryCount + 1)
    }
    
    throw error
  }
}

// 执行请求
function executeRequest(options) {
  return new Promise((resolve, reject) => {
    const context = {
      url: options.url,
      method: options.method,
      data: options.data,
      headers: options.header
    }
    
    uni.request({
      ...options,
      success: (response) => {
        try {
          const result = interceptResponse(response, options, context)
          // Handle both promise and non-promise returns
          if (result && typeof result.then === 'function') {
            result.then(resolve).catch(reject)
          } else {
            resolve(result)
          }
        } catch (error) {
          reject(error)
        }
      },
      fail: async (error) => {
        if (options.showLoading !== false && options.loadingId) {
          loading.hide(options.loadingId)
        }
        
        // 检查网络状态
        const hasNetwork = await checkNetworkStatus()
        
        let requestError
        if (!hasNetwork) {
          requestError = new RequestError(
            ERROR_MESSAGES.NETWORK_ERROR,
            ERROR_TYPES.NETWORK_ERROR,
            'NETWORK_ERROR',
            { error }
          )
        } else if (error.errMsg && error.errMsg.includes('timeout')) {
          requestError = new RequestError(
            ERROR_MESSAGES.TIMEOUT_ERROR,
            ERROR_TYPES.TIMEOUT_ERROR,
            'TIMEOUT',
            { error }
          )
        } else {
          requestError = new RequestError(
            error.errMsg || '请求失败',
            ERROR_TYPES.UNKNOWN_ERROR,
            'UNKNOWN',
            { error }
          )
        }
        
        // 处理错误
        handleErrorResponse(requestError, options, context)
        
        reject(requestError)
      }
    })
  })
}

// 创建请求函数
function createRequest() {
  const request = async (options) => {
    // 处理 URL
    if (!options.url.startsWith('http')) {
      options.url = BASE_URL + options.url
    }
    
    // 调试日志
    if (process.env.NODE_ENV === 'development') {
      console.log('[Request] 请求配置:', {
        url: options.url,
        method: options.method,
        data: options.data
      })
    }
    
    // 默认配置
    options = {
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      showLoading: true,
      showError: true,
      retry: true,  // 默认开启重试
      ...options
    }
    
    // 请求拦截
    options = interceptRequest(options)
    
    // 发起请求（带重试）
    return retryRequest(options)
  }
  
  // 开发环境启用 Mock
  // 临时使用简化版 Mock 进行调试
  return simpleMock(request)
  // return setupMock(request)
}

// 导出请求实例
const request = createRequest()

// 便捷方法
export const get = (url, data, options = {}) => {
  return request({
    url,
    method: 'GET',
    data,
    ...options
  })
}

export const post = (url, data, options = {}) => {
  return request({
    url,
    method: 'POST',
    data,
    ...options
  })
}

export const put = (url, data, options = {}) => {
  return request({
    url,
    method: 'PUT',
    data,
    ...options
  })
}

export const del = (url, data, options = {}) => {
  return request({
    url,
    method: 'DELETE',
    data,
    ...options
  })
}

// 文件上传
export const upload = (url, filePath, formData = {}, options = {}) => {
  const token = getToken()
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url
  
  return new Promise((resolve, reject) => {
    const context = {
      url: fullUrl,
      method: 'UPLOAD',
      data: formData,
      filePath
    }
    
    // 显示上传进度
    if (options.showLoading !== false) {
      uni.showLoading({
        title: options.loadingText || '上传中...',
        mask: true
      })
    }
    
    const uploadTask = uni.uploadFile({
      url: fullUrl,
      filePath,
      name: 'file',
      formData,
      header: {
        'X-Litemall-Token': token,
        ...options.header
      },
      timeout: options.timeout || REQUEST_TIMEOUT,
      success: (response) => {
        if (options.showLoading !== false) {
          uni.hideLoading()
        }
        
        try {
          if (response.statusCode === 200) {
            const data = JSON.parse(response.data)
            if (data.errno === 0) {
              resolve(data.data)
            } else {
              // 业务错误
              const error = new RequestError(
                data.errmsg || '上传失败',
                ERROR_TYPES.BUSINESS_ERROR,
                data.errno,
                { data }
              )
              
              handleErrorResponse({
                ...error,
                errno: data.errno
              }, options, context)
              
              reject(error)
            }
          } else {
            // HTTP 错误
            const error = new RequestError(
              getErrorMessage(null, response.statusCode),
              getErrorType(null, response.statusCode),
              response.statusCode,
              { response }
            )
            
            handleErrorResponse({
              ...error,
              statusCode: response.statusCode
            }, options, context)
            
            reject(error)
          }
        } catch (parseError) {
          const error = new RequestError(
            '响应解析失败',
            ERROR_TYPES.UNKNOWN_ERROR,
            'PARSE_ERROR',
            { parseError, response }
          )
          
          logError(error, context)
          reject(error)
        }
      },
      fail: async (error) => {
        if (options.showLoading !== false && options.loadingId) {
          loading.hide(options.loadingId)
        }
        
        // 检查网络状态
        const hasNetwork = await checkNetworkStatus()
        
        let uploadError
        if (!hasNetwork) {
          uploadError = new RequestError(
            ERROR_MESSAGES.NETWORK_ERROR,
            ERROR_TYPES.NETWORK_ERROR,
            'NETWORK_ERROR',
            { error }
          )
        } else if (error.errMsg && error.errMsg.includes('timeout')) {
          uploadError = new RequestError(
            ERROR_MESSAGES.TIMEOUT_ERROR,
            ERROR_TYPES.TIMEOUT_ERROR,
            'TIMEOUT',
            { error }
          )
        } else {
          uploadError = new RequestError(
            error.errMsg || '上传失败',
            ERROR_TYPES.UNKNOWN_ERROR,
            'UNKNOWN',
            { error }
          )
        }
        
        handleErrorResponse(uploadError, options, context)
        reject(uploadError)
      }
    })
    
    // 监听上传进度
    if (options.onProgress) {
      uploadTask.onProgressUpdate((res) => {
        options.onProgress(res)
      })
    }
  })
}

// 导出错误类型常量，供外部使用
export { ERROR_TYPES, RequestError }

// 获取最近的错误日志
export function getRecentErrors(count = 10) {
  const errors = uni.getStorageSync('request_error_logs') || []
  return errors.slice(0, count)
}

// 清除错误日志
export function clearErrorLogs() {
  uni.removeStorageSync('request_error_logs')
}

// 手动处理错误（用于自定义错误处理场景）
export function handleError(error, options = {}) {
  if (error instanceof RequestError) {
    handleErrorResponse(error, options, {})
  } else {
    // 将普通错误转换为 RequestError
    const requestError = new RequestError(
      error.message || '未知错误',
      ERROR_TYPES.UNKNOWN_ERROR,
      'UNKNOWN',
      { originalError: error }
    )
    handleErrorResponse(requestError, options, {})
  }
}

export default request