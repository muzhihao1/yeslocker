/**
 * 广告相关 API
 */

import { get, post } from '@/utils/request'

/**
 * 获取广告列表
 * @param {number} position - 广告位置 (1:首页 2:操作页 3:凭证底部 4:二手市场)
 * @returns {Promise<Array>} 广告列表
 */
export function getAdList(position) {
  return get('/ad/list', { position })
}

/**
 * 记录广告点击（暂时不需要跟踪，保留接口兼容性）
 * @param {number} adId - 广告ID
 * @returns {Promise<Object>} 记录结果
 */
export function recordAdClick(adId) {
  return post('/ad/click', { adId })
}

/**
 * 记录广告展示（暂时不需要跟踪，保留接口兼容性）
 * @param {Array<number>} adIds - 广告ID列表
 * @returns {Promise<Object>} 记录结果
 */
export function recordAdImpressions(adIds) {
  return post('/ad/impressions', { adIds })
}