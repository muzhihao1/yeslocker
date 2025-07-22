/**
 * 凭证相关 API
 */

import { get, post } from '@/utils/request'

/**
 * 获取凭证详情
 * @param {string} code - 凭证码
 * @returns {Promise<Object>} 凭证详情
 */
export function getVoucherDetail(code) {
  return get(`/voucher/${code}`)
}

/**
 * 验证凭证有效性
 * @param {string} code - 凭证码
 * @returns {Promise<Object>} 验证结果
 */
export function validateVoucher(code) {
  return post('/voucher/validate', { code })
}

/**
 * 获取我的凭证列表
 * @param {Object} params - 查询参数
 * @param {string} params.status - 状态筛选 (active/used/expired)
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @returns {Promise<Object>} 凭证列表
 */
export function getMyVouchers(params = {}) {
  return get('/voucher/list', {
    status: params.status,
    page: params.page || 1,
    limit: params.limit || 10
  })
}

/**
 * 扫描凭证二维码
 * @param {string} qrData - 扫描到的二维码数据
 * @returns {Promise<Object>} 凭证信息
 */
export function scanVoucherQR(qrData) {
  return post('/voucher/scan', { qrData })
}

/**
 * 分享凭证
 * @param {string} code - 凭证码
 * @returns {Promise<Object>} 分享信息
 */
export function shareVoucher(code) {
  return post('/voucher/share', { code })
}

/**
 * 刷新凭证二维码
 * @param {string} code - 凭证码
 * @returns {Promise<Object>} 新的二维码URL
 */
export function refreshVoucherQR(code) {
  return post('/voucher/refresh-qr', { code })
}