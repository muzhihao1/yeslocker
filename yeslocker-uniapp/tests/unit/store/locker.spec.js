import lockerModule from '@/store/modules/locker'

describe('Locker Store Module', () => {
  let state
  
  beforeEach(() => {
    // Reset state before each test
    state = {
      lockers: [],
      availableLockers: [],
      selectedLocker: null,
      activeStorage: null,
      storageHistory: [],
      lockerStats: {
        total: 0,
        available: 0,
        occupied: 0,
        maintenance: 0
      }
    }
    
    // Clear mocks
    jest.clearAllMocks()
  })
  
  describe('State', () => {
    it('should have correct initial state', () => {
      const initialState = lockerModule.state()
      
      expect(initialState).toMatchObject({
        lockers: [],
        availableLockers: [],
        selectedLocker: null,
        activeStorage: null,
        storageHistory: [],
        lockerStats: {
          total: 0,
          available: 0,
          occupied: 0,
          maintenance: 0
        }
      })
    })
  })
  
  describe('Getters', () => {
    it('availableCount should return count of available lockers', () => {
      state.availableLockers = [
        { id: 'A01', status: 'available' },
        { id: 'A02', status: 'available' },
        { id: 'B01', status: 'available' }
      ]
      
      expect(lockerModule.getters.availableCount(state)).toBe(3)
    })
    
    it('hasActiveStorage should check for active storage', () => {
      expect(lockerModule.getters.hasActiveStorage(state)).toBe(false)
      
      state.activeStorage = {
        id: '123',
        lockerId: 'A01',
        status: 'active'
      }
      
      expect(lockerModule.getters.hasActiveStorage(state)).toBe(true)
    })
    
    it('getLockerById should return specific locker', () => {
      state.lockers = [
        { id: 'A01', number: 'A01' },
        { id: 'A02', number: 'A02' },
        { id: 'B01', number: 'B01' }
      ]
      
      const getLockerById = lockerModule.getters.getLockerById(state)
      
      expect(getLockerById('A02')).toEqual({ id: 'A02', number: 'A02' })
      expect(getLockerById('C01')).toBe(undefined)
    })
    
    it('lockersBySize should group lockers by size', () => {
      state.lockers = [
        { id: 'A01', size: 'small' },
        { id: 'A02', size: 'medium' },
        { id: 'B01', size: 'small' },
        { id: 'B02', size: 'large' }
      ]
      
      const grouped = lockerModule.getters.lockersBySize(state)
      
      expect(grouped.small).toHaveLength(2)
      expect(grouped.medium).toHaveLength(1)
      expect(grouped.large).toHaveLength(1)
    })
    
    it('activeStorageVoucher should return voucher info', () => {
      expect(lockerModule.getters.activeStorageVoucher(state)).toBe(null)
      
      state.activeStorage = {
        voucher: {
          code: 'YS123',
          digitalCode: '123456'
        }
      }
      
      expect(lockerModule.getters.activeStorageVoucher(state)).toEqual({
        code: 'YS123',
        digitalCode: '123456'
      })
    })
  })
  
  describe('Mutations', () => {
    it('SET_LOCKERS should update all lockers', () => {
      const lockers = [
        { id: 'A01', number: 'A01', status: 'available' },
        { id: 'A02', number: 'A02', status: 'occupied' }
      ]
      
      lockerModule.mutations.SET_LOCKERS(state, lockers)
      
      expect(state.lockers).toEqual(lockers)
    })
    
    it('SET_AVAILABLE_LOCKERS should update available lockers', () => {
      const availableLockers = [
        { id: 'A01', number: 'A01' },
        { id: 'B01', number: 'B01' }
      ]
      
      lockerModule.mutations.SET_AVAILABLE_LOCKERS(state, availableLockers)
      
      expect(state.availableLockers).toEqual(availableLockers)
    })
    
    it('SET_SELECTED_LOCKER should update selected locker', () => {
      const locker = { id: 'A01', number: 'A01' }
      
      lockerModule.mutations.SET_SELECTED_LOCKER(state, locker)
      
      expect(state.selectedLocker).toEqual(locker)
    })
    
    it('SET_ACTIVE_STORAGE should update active storage', () => {
      const storage = {
        id: '123',
        lockerId: 'A01',
        voucherCode: 'YS123'
      }
      
      lockerModule.mutations.SET_ACTIVE_STORAGE(state, storage)
      
      expect(state.activeStorage).toEqual(storage)
    })
    
    it('ADD_TO_HISTORY should add storage record to history', () => {
      const record = {
        id: '123',
        lockerId: 'A01',
        storageTime: '2024-01-20 12:00:00'
      }
      
      lockerModule.mutations.ADD_TO_HISTORY(state, record)
      
      expect(state.storageHistory).toContain(record)
      expect(state.storageHistory).toHaveLength(1)
    })
    
    it('UPDATE_LOCKER_STATUS should update specific locker status', () => {
      state.lockers = [
        { id: 'A01', status: 'available' },
        { id: 'A02', status: 'available' }
      ]
      
      lockerModule.mutations.UPDATE_LOCKER_STATUS(state, {
        lockerId: 'A01',
        status: 'occupied'
      })
      
      expect(state.lockers[0].status).toBe('occupied')
      expect(state.lockers[1].status).toBe('available')
    })
    
    it('SET_LOCKER_STATS should update statistics', () => {
      const stats = {
        total: 100,
        available: 60,
        occupied: 35,
        maintenance: 5
      }
      
      lockerModule.mutations.SET_LOCKER_STATS(state, stats)
      
      expect(state.lockerStats).toEqual(stats)
    })
    
    it('CLEAR_SELECTED_LOCKER should clear selection', () => {
      state.selectedLocker = { id: 'A01' }
      
      lockerModule.mutations.CLEAR_SELECTED_LOCKER(state)
      
      expect(state.selectedLocker).toBe(null)
    })
  })
  
  describe('Actions', () => {
    let commit
    let dispatch
    let rootState
    
    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
      rootState = {
        user: {
          token: 'test-token',
          userInfo: { id: '12345' }
        }
      }
    })
    
    it('fetchLockers should load all lockers', async () => {
      const mockLockers = [
        { id: 'A01', number: 'A01', status: 'available' },
        { id: 'A02', number: 'A02', status: 'occupied' }
      ]
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: mockLockers
        }
      })
      
      await lockerModule.actions.fetchLockers({ commit, state })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/lockers'),
        method: 'GET'
      })
      
      expect(commit).toHaveBeenCalledWith('SET_LOCKERS', mockLockers)
    })
    
    it('fetchAvailableLockers should load only available lockers', async () => {
      const mockAvailable = [
        { id: 'A01', number: 'A01', status: 'available' },
        { id: 'B01', number: 'B01', status: 'available' }
      ]
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockAvailable
        }
      })
      
      await lockerModule.actions.fetchAvailableLockers({ commit, state })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/lockers/available'),
        method: 'GET'
      })
      
      expect(commit).toHaveBeenCalledWith('SET_AVAILABLE_LOCKERS', mockAvailable)
    })
    
    it('selectLocker should set selected locker', async () => {
      const locker = { id: 'A01', number: 'A01' }
      
      await lockerModule.actions.selectLocker({ commit }, locker)
      
      expect(commit).toHaveBeenCalledWith('SET_SELECTED_LOCKER', locker)
    })
    
    it('createStorageRecord should create new storage', async () => {
      const storageData = {
        lockerId: 'A01',
        userId: '12345'
      }
      
      const mockResponse = {
        id: 'storage-123',
        lockerId: 'A01',
        userId: '12345',
        voucherCode: 'YS2024012012345',
        digitalCode: '123456',
        qrCodeUrl: '/qr/123.png',
        storageTime: '2024-01-20 12:00:00'
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockResponse
        }
      })
      
      const result = await lockerModule.actions.createStorageRecord(
        { commit, dispatch, rootState },
        storageData
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/storage/create'),
        method: 'POST',
        data: storageData
      })
      
      expect(commit).toHaveBeenCalledWith('SET_ACTIVE_STORAGE', mockResponse)
      expect(commit).toHaveBeenCalledWith('UPDATE_LOCKER_STATUS', {
        lockerId: 'A01',
        status: 'occupied'
      })
      expect(commit).toHaveBeenCalledWith('ADD_TO_HISTORY', mockResponse)
      
      expect(result).toEqual(mockResponse.voucher)
    })
    
    it('validateVoucher should validate voucher code', async () => {
      const voucherCode = 'YS2024012012345'
      
      const mockStorage = {
        id: 'storage-123',
        lockerId: 'A01',
        lockerNumber: 'A01',
        storageTime: '2024-01-20 12:00:00',
        userName: '张三'
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockStorage
        }
      })
      
      const result = await lockerModule.actions.validateVoucher(
        { commit },
        voucherCode
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/voucher/validate'),
        method: 'POST',
        data: { code: voucherCode }
      })
      
      expect(result).toEqual(mockStorage)
    })
    
    it('calculateRetrievalFee should get fee calculation', async () => {
      const storageId = 'storage-123'
      
      const mockFeeInfo = {
        totalFee: 50,
        storageDays: 5,
        dailyRate: 10,
        overtimeFee: 0
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockFeeInfo
        }
      })
      
      const result = await lockerModule.actions.calculateRetrievalFee(
        { state },
        storageId
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining(`/api/storage/${storageId}/calculate-fee`),
        method: 'GET'
      })
      
      expect(result).toEqual(mockFeeInfo)
    })
    
    it('processRetrieval should complete retrieval', async () => {
      const retrievalData = {
        storageId: 'storage-123',
        paymentInfo: {
          method: 'wechat',
          transactionId: 'tx-123'
        }
      }
      
      const mockResult = {
        success: true,
        unlockCode: '8888',
        retrievalTime: '2024-01-25 15:00:00'
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockResult
        }
      })
      
      const result = await lockerModule.actions.processRetrieval(
        { commit, dispatch },
        retrievalData
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/storage/retrieve'),
        method: 'POST',
        data: retrievalData
      })
      
      expect(commit).toHaveBeenCalledWith('SET_ACTIVE_STORAGE', null)
      expect(dispatch).toHaveBeenCalledWith('fetchAvailableLockers')
      
      expect(result).toEqual(mockResult)
    })
    
    it('fetchStorageHistory should load user history', async () => {
      const mockHistory = [
        {
          id: 'storage-1',
          lockerId: 'A01',
          storageTime: '2024-01-15 10:00:00',
          retrievalTime: '2024-01-16 11:00:00'
        },
        {
          id: 'storage-2',
          lockerId: 'B02',
          storageTime: '2024-01-20 14:00:00',
          retrievalTime: null
        }
      ]
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockHistory
        }
      })
      
      await lockerModule.actions.fetchStorageHistory({ commit, rootState })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/user/storage-history'),
        method: 'GET'
      })
      
      expect(commit).toHaveBeenCalledWith('SET_STORAGE_HISTORY', mockHistory)
    })
    
    it('updateLockerStats should fetch and update stats', async () => {
      const mockStats = {
        total: 100,
        available: 65,
        occupied: 30,
        maintenance: 5
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: mockStats
        }
      })
      
      await lockerModule.actions.updateLockerStats({ commit })
      
      expect(commit).toHaveBeenCalledWith('SET_LOCKER_STATS', mockStats)
    })
    
    it('clearActiveStorage should clear active storage', async () => {
      await lockerModule.actions.clearActiveStorage({ commit })
      
      expect(commit).toHaveBeenCalledWith('SET_ACTIVE_STORAGE', null)
    })
    
    it('should handle error when creating storage fails', async () => {
      uni.request.mockRejectedValueOnce(new Error('Network error'))
      
      await expect(
        lockerModule.actions.createStorageRecord(
          { commit, dispatch, rootState },
          { lockerId: 'A01' }
        )
      ).rejects.toThrow('Network error')
      
      expect(commit).not.toHaveBeenCalled()
    })
  })
  
  describe('Complex scenarios', () => {
    it('should handle complete storage flow', async () => {
      const { state, commit, dispatch } = createStore()
      
      // 1. Fetch available lockers
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: [
            { id: 'A01', number: 'A01', status: 'available' }
          ]
        }
      })
      
      await lockerModule.actions.fetchAvailableLockers({ commit, state })
      
      // 2. Select a locker
      await lockerModule.actions.selectLocker(
        { commit },
        state.availableLockers[0]
      )
      
      // 3. Create storage
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: {
            id: 'storage-123',
            lockerId: 'A01',
            voucherCode: 'YS123',
            voucher: {
              code: 'YS123',
              digitalCode: '123456'
            }
          }
        }
      })
      
      const rootState = { user: { userInfo: { id: '12345' } } }
      await lockerModule.actions.createStorageRecord(
        { commit, dispatch, rootState },
        { lockerId: 'A01', userId: '12345' }
      )
      
      // Verify state
      expect(state.selectedLocker).toEqual({ id: 'A01', number: 'A01', status: 'available' })
      expect(state.activeStorage).toBeTruthy()
      expect(state.storageHistory).toHaveLength(1)
    })
  })
})

// Helper function to create a mock store context
function createStore() {
  const state = lockerModule.state()
  const commit = (type, payload) => {
    if (lockerModule.mutations[type]) {
      lockerModule.mutations[type](state, payload)
    }
  }
  const dispatch = jest.fn()
  
  return { state, commit, dispatch }
}