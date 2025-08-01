/**
 * 门店相关 API
 */

import { post, get } from '@/utils/request'

/**
 * 获取门店列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 状态筛选（active/inactive/maintenance）
 * @returns {Promise<Object>} 门店列表
 */
export function getStoreList(params = {}) {
  return get('/store/list', params)
}

/**
 * 获取门店详情
 * @param {number} storeId - 门店ID
 * @returns {Promise<Object>} 门店详情
 */
export function getStoreDetail(storeId) {
  return get(`/store/${storeId}`)
}

/**
 * 根据定位获取附近门店
 * @param {Object} params - 查询参数
 * @param {number} params.latitude - 纬度
 * @param {number} params.longitude - 经度
 * @param {number} params.radius - 搜索半径（公里）
 * @returns {Promise<Object>} 附近门店列表
 */
export function getNearbyStores(params) {
  return get('/store/nearby', params)
}

/**
 * 获取门店营业状态
 * @param {number} storeId - 门店ID
 * @returns {Promise<Object>} 营业状态信息
 */
export function getStoreStatus(storeId) {
  return get(`/store/${storeId}/status`)
}