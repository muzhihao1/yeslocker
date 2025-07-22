/**
 * 请求封装工具
 * 统一处理 API 请求、错误处理、Token 管理
 */

import { setupMock } from '@/mock/api.js'

// API 基础配置
const BASE_URL = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:8080/wx'  // 开发环境
  : 'https://api.yeslocker.com/wx'  // 生产环境

// Token 存储键名
const TOKEN_KEY = 'litemall-token'
const TOKEN_EXPIRE_KEY = 'litemall-token-expire'

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
  
  // 显示加载提示
  if (options.showLoading !== false) {
    uni.showLoading({
      title: options.loadingText || '加载中...',
      mask: true
    })
  }
  
  return options
}

// 响应拦截器
function interceptResponse(response, options) {
  // 隐藏加载提示
  if (options.showLoading !== false) {
    uni.hideLoading()
  }
  
  const { statusCode, data } = response
  
  // 请求成功
  if (statusCode === 200) {
    // 业务错误处理
    if (data.errno !== 0) {
      // 未登录，跳转登录页
      if (data.errno === 401) {
        clearToken()
        uni.showModal({
          title: '提示',
          content: '请先登录',
          showCancel: false,
          success: () => {
            uni.navigateTo({
              url: '/pages/auth/login'
            })
          }
        })
        return Promise.reject(new Error(data.errmsg || '未登录'))
      }
      
      // 其他业务错误
      if (options.showError !== false) {
        uni.showToast({
          title: data.errmsg || '请求失败',
          icon: 'none',
          duration: 2000
        })
      }
      
      return Promise.reject(new Error(data.errmsg || '请求失败'))
    }
    
    // 返回数据
    return data.data
  }
  
  // HTTP 错误
  const errorMsg = `请求失败: ${statusCode}`
  if (options.showError !== false) {
    uni.showToast({
      title: errorMsg,
      icon: 'none',
      duration: 2000
    })
  }
  
  return Promise.reject(new Error(errorMsg))
}

// 创建请求函数
function createRequest() {
  const request = (options) => {
    // 处理 URL
    if (!options.url.startsWith('http')) {
      options.url = BASE_URL + options.url
    }
    
    // 默认配置
    options = {
      method: 'GET',
      header: {
        'Content-Type': 'application/json'
      },
      showLoading: true,
      showError: true,
      ...options
    }
    
    // 请求拦截
    options = interceptRequest(options)
    
    // 发起请求
    return new Promise((resolve, reject) => {
      uni.request({
        ...options,
        success: (response) => {
          interceptResponse(response, options)
            .then(resolve)
            .catch(reject)
        },
        fail: (error) => {
          if (options.showLoading !== false) {
            uni.hideLoading()
          }
          
          if (options.showError !== false) {
            uni.showToast({
              title: '网络异常',
              icon: 'none',
              duration: 2000
            })
          }
          
          reject(error)
        }
      })
    })
  }
  
  // 开发环境启用 Mock
  return setupMock(request)
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
  
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: url.startsWith('http') ? url : BASE_URL + url,
      filePath,
      name: 'file',
      formData,
      header: {
        'X-Litemall-Token': token,
        ...options.header
      },
      success: (response) => {
        if (response.statusCode === 200) {
          const data = JSON.parse(response.data)
          if (data.errno === 0) {
            resolve(data.data)
          } else {
            reject(new Error(data.errmsg || '上传失败'))
          }
        } else {
          reject(new Error(`上传失败: ${response.statusCode}`))
        }
      },
      fail: reject
    })
  })
}

export default request