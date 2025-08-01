/**
 * 认证相关 API
 */

import { post, get } from '@/utils/request'

/**
 * 微信登录
 * @param {Object} params - 登录参数
 * @param {string} params.code - 微信登录 code
 * @param {Object} params.userInfo - 用户信息
 * @returns {Promise<Object>} 登录结果
 */
export function loginByWeixin(params) {
  // 使用完整的微信登录接口路径
  return post('/wx/auth/login_by_weixin', params)
}

/**
 * 身份验证
 * @param {Object} params - 验证参数
 * @param {string} params.realName - 真实姓名
 * @param {string} params.idCard - 身份证号
 * @param {string} params.mobile - 手机号
 * @param {string} params.smsCode - 短信验证码
 * @returns {Promise<Object>} 验证结果
 */
export function verifyIdentity(params) {
  return post('/wx/auth/verify', params)
}

/**
 * 发送短信验证码
 * @param {string} mobile - 手机号
 * @returns {Promise<Object>} 发送结果
 */
export function sendSmsCode(mobile) {
  return post('/wx/auth/captcha', { mobile, type: 'verify' })
}

/**
 * 获取用户信息
 * @returns {Promise<Object>} 用户信息
 */
export function getUserInfo() {
  return get('/wx/user/info')
}

/**
 * 更新用户信息
 * @param {Object} params - 用户信息
 * @returns {Promise<Object>} 更新结果
 */
export function updateUserInfo(params) {
  return post('/wx/user/profile', params)
}

/**
 * 退出登录
 * @returns {Promise<Object>} 退出结果
 */
export function logout() {
  return post('/wx/auth/logout')
}

/**
 * 完成用户注册（包含身份验证和储物柜分配）
 * @param {Object} params - 注册参数
 * @param {string} params.realName - 真实姓名
 * @param {string} params.idCard - 身份证号
 * @param {string} params.mobile - 手机号
 * @param {string} params.smsCode - 短信验证码
 * @param {string} params.lockerId - 选择的储物柜ID
 * @param {number} params.storeId - 选择的门店ID
 * @returns {Promise<Object>} 注册结果
 */
export function completeRegistration(params) {
  return post('/wx/auth/complete-registration', params)
}