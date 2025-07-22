/**
 * 商品/二手市场相关 API
 */

import { get, post } from '@/utils/request'

/**
 * 获取商品列表
 * @param {Object} params - 查询参数
 * @param {number} params.categoryId - 分类ID
 * @param {string} params.keyword - 搜索关键词
 * @param {string} params.sort - 排序方式 (price_asc/price_desc/time/sales)
 * @param {number} params.page - 页码
 * @param {number} params.limit - 每页数量
 * @param {boolean} params.isHot - 热门商品
 * @param {boolean} params.isNew - 新品
 * @returns {Promise<Object>} 商品列表
 */
export function getGoodsList(params = {}) {
  return get('/goods/list', {
    categoryId: params.categoryId,
    keyword: params.keyword,
    sort: params.sort || 'time',
    page: params.page || 1,
    limit: params.limit || 10,
    isHot: params.isHot,
    isNew: params.isNew
  })
}

/**
 * 获取商品详情
 * @param {number} id - 商品ID
 * @returns {Promise<Object>} 商品详情
 */
export function getGoodsDetail(id) {
  return get('/goods/detail', { id })
}

/**
 * 获取商品分类
 * @returns {Promise<Array>} 分类列表
 */
export function getCategories() {
  return get('/catalog/index')
}

/**
 * 获取二手球杆列表（我的）
 * @param {Object} params - 查询参数
 * @returns {Promise<Object>} 我的二手球杆列表
 */
export function getMyCueSticks(params = {}) {
  return get('/goods/my-cuesticks', {
    page: params.page || 1,
    limit: params.limit || 10
  })
}

/**
 * 发布二手球杆
 * @param {Object} params - 球杆信息
 * @param {number} params.cueStickId - 球杆ID
 * @param {string} params.title - 标题
 * @param {string} params.description - 描述
 * @param {number} params.price - 价格
 * @param {Array} params.images - 图片列表
 * @returns {Promise<Object>} 发布结果
 */
export function publishCueStick(params) {
  return post('/goods/publish-cuestick', params)
}

/**
 * 下架二手球杆
 * @param {number} goodsId - 商品ID
 * @returns {Promise<Object>} 下架结果
 */
export function unpublishGoods(goodsId) {
  return post('/goods/unpublish', { goodsId })
}

/**
 * 收藏商品
 * @param {number} goodsId - 商品ID
 * @returns {Promise<Object>} 收藏结果
 */
export function collectGoods(goodsId) {
  return post('/collect/add', { 
    type: 0,  // 0 表示商品
    valueId: goodsId 
  })
}

/**
 * 取消收藏
 * @param {number} goodsId - 商品ID
 * @returns {Promise<Object>} 取消结果
 */
export function uncollectGoods(goodsId) {
  return post('/collect/delete', { 
    type: 0,
    valueId: goodsId 
  })
}

/**
 * 获取收藏列表
 * @param {Object} params - 分页参数
 * @returns {Promise<Object>} 收藏列表
 */
export function getCollectList(params = {}) {
  return get('/collect/list', {
    type: 0,
    page: params.page || 1,
    limit: params.limit || 10
  })
}

/**
 * 获取浏览历史
 * @param {Object} params - 分页参数
 * @returns {Promise<Object>} 浏览历史
 */
export function getFootprintList(params = {}) {
  return get('/footprint/list', {
    page: params.page || 1,
    limit: params.limit || 10
  })
}