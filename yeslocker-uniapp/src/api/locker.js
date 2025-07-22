/**
 * 储物柜相关 API
 */

import { post, get } from '@/utils/request'

/**
 * 存储球杆
 * @param {Object} params - 存储参数
 * @param {number} params.lockerId - 储物柜ID
 * @param {Object} params.cueStickInfo - 球杆信息
 * @param {string} params.notes - 备注
 * @returns {Promise<Object>} 存储结果，包含凭证信息
 */
export function storeLocker(params) {
  return post('/locker/store', params)
}

/**
 * 取回球杆
 * @param {string} voucherCode - 凭证码
 * @returns {Promise<Object>} 取回结果
 */
export function retrieveLocker(voucherCode) {
  return post('/locker/retrieve', { voucherCode })
}

/**
 * 获取储物柜状态
 * @returns {Promise<Object>} 当前用户的储物柜使用状态
 */
export function getLockerStatus() {
  return get('/locker/status')
}

/**
 * 获取可用储物柜列表
 * @param {Object} params - 查询参数
 * @param {string} params.zone - 区域筛选
 * @returns {Promise<Object>} 可用储物柜列表
 */
export function getAvailableLockers(params = {}) {
  return get('/locker/available', params)
}

/**
 * 获取操作历史
 * @param {Object} params - 分页参数
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise<Object>} 操作历史列表
 */
export function getOperationHistory(params = {}) {
  return get('/locker/history', {
    page: params.page || 1,
    limit: params.limit || 10
  })
}

/**
 * 扫描储物柜二维码
 * @param {string} code - 扫描到的二维码内容
 * @returns {Promise<Object>} 储物柜信息
 */
export function scanLockerCode(code) {
  return post('/locker/scan', { code })
}

/**
 * 获取储物柜详情
 * @param {number} lockerId - 储物柜ID
 * @returns {Promise<Object>} 储物柜详情
 */
export function getLockerDetail(lockerId) {
  return get(`/locker/${lockerId}`)
}