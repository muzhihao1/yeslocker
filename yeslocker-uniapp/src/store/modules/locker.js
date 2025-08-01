/**
 * 储物柜状态管理模块
 */

import { 
  getLockerStatus, 
  getAvailableLockers, 
  storeLocker, 
  retrieveLocker,
  getOperationHistory 
} from '@/api/locker'
import { getVoucherDetail } from '@/api/voucher'

const state = {
  // 当前活跃的存储信息
  activeStorage: null,
  // 可用储物柜列表
  availableLockers: [],
  // 选中的储物柜
  selectedLocker: null,
  // 操作历史
  operationHistory: [],
  // 当前凭证信息
  currentVoucher: null,
  // 扫码结果
  scanResult: null
}

const getters = {
  // 是否有活跃存储
  hasActiveStorage: state => !!state.activeStorage,
  // 获取活跃存储信息
  activeStorage: state => state.activeStorage,
  // 获取凭证剩余天数
  voucherDaysRemaining: state => state.activeStorage?.daysRemaining || 0,
  // 获取可用储物柜数量
  availableLockersCount: state => state.availableLockers.length,
  // 获取选中的储物柜
  selectedLocker: state => state.selectedLocker,
  // 获取当前凭证
  currentVoucher: state => state.currentVoucher
}

const mutations = {
  // 设置活跃存储信息
  SET_ACTIVE_STORAGE(state, storage) {
    state.activeStorage = storage
  },
  
  // 设置可用储物柜列表
  SET_AVAILABLE_LOCKERS(state, lockers) {
    state.availableLockers = lockers
  },
  
  // 设置选中的储物柜
  SET_SELECTED_LOCKER(state, locker) {
    state.selectedLocker = locker
  },
  
  // 添加操作历史记录
  ADD_OPERATION_HISTORY(state, operation) {
    state.operationHistory.unshift(operation)
  },
  
  // 设置操作历史
  SET_OPERATION_HISTORY(state, history) {
    state.operationHistory = history
  },
  
  // 设置当前凭证
  SET_CURRENT_VOUCHER(state, voucher) {
    state.currentVoucher = voucher
  },
  
  // 设置扫码结果
  SET_SCAN_RESULT(state, result) {
    state.scanResult = result
  },
  
  // 清除选中的储物柜
  CLEAR_SELECTED_LOCKER(state) {
    state.selectedLocker = null
  },
  
  // 清除活跃存储
  CLEAR_ACTIVE_STORAGE(state) {
    state.activeStorage = null
  }
}

const actions = {
  // 获取储物柜状态
  async getLockerStatus({ commit }) {
    try {
      const res = await getLockerStatus()
      
      if (res.hasActiveStorage) {
        commit('SET_ACTIVE_STORAGE', res.activeStorage)
        
        // 更新用户模块的储物柜状态
        this.dispatch('user/updateLockerStatus', true)
      } else {
        commit('CLEAR_ACTIVE_STORAGE')
        this.dispatch('user/updateLockerStatus', false)
      }
      
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 获取可用储物柜列表
  async getAvailableLockers({ commit }, zone) {
    try {
      const res = await getAvailableLockers({ zone })
      commit('SET_AVAILABLE_LOCKERS', res.lockers || [])
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 选择储物柜
  selectLocker({ commit }, locker) {
    commit('SET_SELECTED_LOCKER', locker)
  },
  
  // 清除选中的储物柜
  clearSelectedLocker({ commit }) {
    commit('CLEAR_SELECTED_LOCKER')
  },
  
  // 存储球杆
  async storeLocker({ commit, state }, { cueStickInfo, notes }) {
    if (!state.selectedLocker) {
      throw new Error('请先选择储物柜')
    }
    
    try {
      const res = await storeLocker({
        lockerId: state.selectedLocker.id,
        cueStickInfo,
        notes
      })
      
      // 创建新的存储记录
      const newStorage = {
        operationId: res.operationId,
        lockerId: res.lockerId,
        cabinetNumber: res.cabinetNumber,
        zone: res.zone,
        storedAt: new Date().toISOString(),
        expiredAt: res.expiredAt,
        voucherCode: res.voucherCode,
        qrCodeUrl: res.qrCodeUrl,
        daysRemaining: 30
      }
      
      // 更新状态
      commit('SET_ACTIVE_STORAGE', newStorage)
      commit('SET_CURRENT_VOUCHER', res)
      commit('CLEAR_SELECTED_LOCKER')
      
      // 更新用户模块状态
      this.dispatch('user/updateLockerStatus', true)
      
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 取回球杆
  async retrieveLocker({ commit, state }, voucherCode) {
    try {
      const res = await retrieveLocker(voucherCode)
      
      // 清除活跃存储
      commit('CLEAR_ACTIVE_STORAGE')
      commit('SET_CURRENT_VOUCHER', null)
      
      // 更新用户模块状态
      this.dispatch('user/updateLockerStatus', false)
      
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 获取操作历史
  async getOperationHistory({ commit }, { page = 1, limit = 10 }) {
    try {
      const res = await getOperationHistory({ page, limit })
      
      if (page === 1) {
        commit('SET_OPERATION_HISTORY', res.list || [])
      } else {
        // 追加到现有列表
        res.list.forEach(item => {
          commit('ADD_OPERATION_HISTORY', item)
        })
      }
      
      return res
    } catch (error) {
      throw error
    }
  },
  
  // 获取凭证详情
  async getVoucherDetail({ commit }, code) {
    try {
      const voucher = await getVoucherDetail(code)
      commit('SET_CURRENT_VOUCHER', voucher)
      return voucher
    } catch (error) {
      throw error
    }
  },
  
  // 处理扫码结果
  handleScanResult({ commit }, result) {
    commit('SET_SCAN_RESULT', result)
  },
  
  // 清除扫码结果
  clearScanResult({ commit }) {
    commit('SET_SCAN_RESULT', null)
  }
}

export default {
  namespaced: true,
  state,
  getters,
  mutations,
  actions
}