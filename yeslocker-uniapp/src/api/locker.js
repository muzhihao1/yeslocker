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

// 旧的取回球杆方法已移除 - 现在使用新的请求流程
// 请使用 confirmKeyReturn() 方法进行取回确认

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
 * @param {number} params.size - 每页数量
 * @param {string} params.type - 操作类型筛选（可选：store/retrieve）
 * @param {string} params.status - 状态筛选（可选：active/completed/expired）
 * @returns {Promise<Object>} 操作历史列表
 */
export function getOperationHistory(params = {}) {
  return get('/wx/locker/history', {
    page: params.page || 1,
    size: params.size || 10,
    type: params.type,
    status: params.status
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

// ========== 新流程（申请制）API ==========

/**
 * 获取用户的储物柜信息
 * @returns {Promise<Object>} 用户的专属储物柜信息
 */
export function getMyLocker() {
  return get('/locker/my-locker')
}

/**
 * 创建存储请求（新流程）
 * @param {Object} params - 请求参数
 * @param {number} params.lockerId - 储物柜ID
 * @param {number} params.storeId - 店铺ID（默认为1）
 * @param {string} params.notes - 备注信息
 * @returns {Promise<Object>} 创建结果，包含凭证信息
 */
export function createStorageRequest(params) {
  return post('/locker/request/create', {
    lockerId: params.lockerId,
    storeId: params.storeId || 1,
    notes: params.notes || ''
  })
}

/**
 * 查询申请记录
 * @param {Object} params - 查询参数
 * @param {string} params.type - 申请类型筛选（可选）
 * @param {string} params.status - 状态筛选（可选）
 * @returns {Promise<Object>} 申请记录列表
 */
export function getRequestList(params = {}) {
  return get('/storage/requests', params)
}

/**
 * 查询申请详情
 * @param {number} requestId - 申请ID
 * @returns {Promise<Object>} 申请详情
 */
export function getRequestDetail(requestId) {
  return get(`/storage/request/${requestId}`)
}

/**
 * 确认钥匙归还
 * @param {number} requestId - 申请ID
 * @returns {Promise<Object>} 确认结果
 */
export function confirmKeyReturn(requestId) {
  return post('/storage/confirm-key-return', { requestId })
}

/**
 * 获取用户的活跃申请
 * @returns {Promise<Object>} 活跃申请信息
 */
export function getActiveRequest() {
  return get('/storage/active-request')
}

/**
 * 取消申请
 * @param {number} requestId - 申请ID
 * @returns {Promise<Object>} 操作结果
 */
export function cancelRequest(requestId) {
  return post('/storage/cancel', { requestId })
}

/**
 * 选择并分配储物柜给用户（注册时使用）
 * @param {string} lockerId - 储物柜ID
 * @returns {Promise<Object>} 分配结果
 */
export function assignLocker(lockerId) {
  return post('/locker/assign', { lockerId })
}