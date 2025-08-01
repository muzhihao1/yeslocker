import userModule from '@/store/modules/user'

describe('User Store Module', () => {
  let state
  
  beforeEach(() => {
    // Reset state before each test
    state = {
      userInfo: null,
      token: null,
      isLoggedIn: false,
      loginTime: null,
      permissions: [],
      settings: {
        notifications: true,
        theme: 'light',
        language: 'zh-CN'
      }
    }
    
    // Clear mocks
    jest.clearAllMocks()
  })
  
  describe('State', () => {
    it('should have correct initial state', () => {
      const initialState = userModule.state()
      
      expect(initialState).toMatchObject({
        userInfo: null,
        token: null,
        isLoggedIn: false,
        loginTime: null,
        permissions: [],
        settings: expect.objectContaining({
          notifications: true,
          theme: 'light',
          language: 'zh-CN'
        })
      })
    })
  })
  
  describe('Getters', () => {
    it('isLoggedIn should return login status', () => {
      expect(userModule.getters.isLoggedIn(state)).toBe(false)
      
      state.isLoggedIn = true
      state.token = 'test-token'
      expect(userModule.getters.isLoggedIn(state)).toBe(true)
    })
    
    it('userName should return user name or default', () => {
      expect(userModule.getters.userName(state)).toBe('未登录用户')
      
      state.userInfo = { name: '张三' }
      expect(userModule.getters.userName(state)).toBe('张三')
    })
    
    it('userId should return user ID', () => {
      expect(userModule.getters.userId(state)).toBe(null)
      
      state.userInfo = { id: '12345' }
      expect(userModule.getters.userId(state)).toBe('12345')
    })
    
    it('isVerified should return verification status', () => {
      expect(userModule.getters.isVerified(state)).toBe(false)
      
      state.userInfo = { verified: false }
      expect(userModule.getters.isVerified(state)).toBe(false)
      
      state.userInfo = { verified: true }
      expect(userModule.getters.isVerified(state)).toBe(true)
    })
    
    it('hasPermission should check permissions', () => {
      const hasPermission = userModule.getters.hasPermission(state)
      
      expect(hasPermission('admin')).toBe(false)
      
      state.permissions = ['user', 'storage.create', 'storage.retrieve']
      
      expect(hasPermission('storage.create')).toBe(true)
      expect(hasPermission('admin')).toBe(false)
    })
    
    it('sessionDuration should calculate session time', () => {
      expect(userModule.getters.sessionDuration(state)).toBe(0)
      
      const now = Date.now()
      const oneHourAgo = now - 3600000
      state.loginTime = oneHourAgo
      
      const duration = userModule.getters.sessionDuration(state)
      expect(duration).toBeGreaterThan(3590000) // Close to 1 hour
      expect(duration).toBeLessThan(3610000)
    })
  })
  
  describe('Mutations', () => {
    it('SET_USER_INFO should update user info', () => {
      const userInfo = {
        id: '12345',
        name: '张三',
        phone: '13800138000',
        verified: true
      }
      
      userModule.mutations.SET_USER_INFO(state, userInfo)
      
      expect(state.userInfo).toEqual(userInfo)
    })
    
    it('SET_TOKEN should update token', () => {
      userModule.mutations.SET_TOKEN(state, 'new-token-123')
      
      expect(state.token).toBe('new-token-123')
    })
    
    it('SET_LOGIN_STATUS should update login status and time', () => {
      const beforeTime = Date.now()
      
      userModule.mutations.SET_LOGIN_STATUS(state, true)
      
      expect(state.isLoggedIn).toBe(true)
      expect(state.loginTime).toBeGreaterThanOrEqual(beforeTime)
      expect(state.loginTime).toBeLessThanOrEqual(Date.now())
      
      userModule.mutations.SET_LOGIN_STATUS(state, false)
      
      expect(state.isLoggedIn).toBe(false)
      expect(state.loginTime).toBe(null)
    })
    
    it('SET_PERMISSIONS should update permissions', () => {
      const permissions = ['user', 'storage.create', 'storage.retrieve']
      
      userModule.mutations.SET_PERMISSIONS(state, permissions)
      
      expect(state.permissions).toEqual(permissions)
    })
    
    it('UPDATE_SETTINGS should merge settings', () => {
      userModule.mutations.UPDATE_SETTINGS(state, {
        theme: 'dark',
        fontSize: 'large'
      })
      
      expect(state.settings).toMatchObject({
        notifications: true,
        theme: 'dark',
        language: 'zh-CN',
        fontSize: 'large'
      })
    })
    
    it('CLEAR_USER should reset all user data', () => {
      state.userInfo = { id: '123', name: 'Test' }
      state.token = 'test-token'
      state.isLoggedIn = true
      state.loginTime = Date.now()
      state.permissions = ['user']
      
      userModule.mutations.CLEAR_USER(state)
      
      expect(state.userInfo).toBe(null)
      expect(state.token).toBe(null)
      expect(state.isLoggedIn).toBe(false)
      expect(state.loginTime).toBe(null)
      expect(state.permissions).toEqual([])
    })
  })
  
  describe('Actions', () => {
    let commit
    let dispatch
    let rootState
    
    beforeEach(() => {
      commit = jest.fn()
      dispatch = jest.fn()
      rootState = {}
    })
    
    it('login should authenticate user successfully', async () => {
      const credentials = {
        code: 'wx-auth-code-123'
      }
      
      const mockResponse = {
        token: 'jwt-token-123',
        userInfo: {
          id: '12345',
          name: '张三',
          phone: '13800138000',
          openid: 'wx-openid-123'
        },
        permissions: ['user', 'storage.create']
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: mockResponse
        }
      })
      
      const result = await userModule.actions.login(
        { commit, dispatch, state, rootState },
        credentials
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/wechat-login'),
        method: 'POST',
        data: credentials
      })
      
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', 'jwt-token-123')
      expect(commit).toHaveBeenCalledWith('SET_USER_INFO', mockResponse.userInfo)
      expect(commit).toHaveBeenCalledWith('SET_PERMISSIONS', mockResponse.permissions)
      expect(commit).toHaveBeenCalledWith('SET_LOGIN_STATUS', true)
      
      expect(uni.setStorageSync).toHaveBeenCalledWith('token', 'jwt-token-123')
      expect(uni.setStorageSync).toHaveBeenCalledWith('userInfo', mockResponse.userInfo)
      
      expect(result).toEqual(mockResponse)
    })
    
    it('login should handle authentication failure', async () => {
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 1001,
          message: '登录失败'
        }
      })
      
      await expect(
        userModule.actions.login(
          { commit, dispatch, state, rootState },
          { code: 'invalid-code' }
        )
      ).rejects.toThrow('登录失败')
      
      expect(commit).not.toHaveBeenCalled()
    })
    
    it('logout should clear user data', async () => {
      await userModule.actions.logout({ commit, dispatch, state })
      
      expect(commit).toHaveBeenCalledWith('CLEAR_USER')
      expect(uni.removeStorageSync).toHaveBeenCalledWith('token')
      expect(uni.removeStorageSync).toHaveBeenCalledWith('userInfo')
      expect(uni.reLaunch).toHaveBeenCalledWith({
        url: '/pages/home/index'
      })
    })
    
    it('updateUserInfo should update user information', async () => {
      const updates = {
        name: '李四',
        phone: '13900139000'
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: {
            id: '12345',
            name: '李四',
            phone: '13900139000',
            verified: true
          }
        }
      })
      
      state.userInfo = { id: '12345' }
      
      const result = await userModule.actions.updateUserInfo(
        { commit, state },
        updates
      )
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/user/update'),
        method: 'PUT',
        data: updates
      })
      
      expect(commit).toHaveBeenCalledWith('SET_USER_INFO', expect.objectContaining({
        name: '李四',
        phone: '13900139000'
      }))
      
      expect(uni.setStorageSync).toHaveBeenCalledWith('userInfo', expect.any(Object))
    })
    
    it('verifyIdentity should update verification status', async () => {
      const verificationData = {
        idCardFront: 'base64-front',
        idCardBack: 'base64-back',
        realName: '张三',
        idNumber: '110101199001011234'
      }
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: { verified: true }
        }
      })
      
      state.userInfo = { id: '12345', verified: false }
      
      await userModule.actions.verifyIdentity(
        { commit, state },
        verificationData
      )
      
      expect(commit).toHaveBeenCalledWith('SET_USER_INFO', expect.objectContaining({
        verified: true
      }))
    })
    
    it('refreshToken should get new token', async () => {
      state.token = 'old-token'
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: {
            token: 'new-token-456'
          }
        }
      })
      
      await userModule.actions.refreshToken({ commit, state })
      
      expect(uni.request).toHaveBeenCalledWith({
        url: expect.stringContaining('/api/auth/refresh'),
        method: 'POST'
      })
      
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', 'new-token-456')
      expect(uni.setStorageSync).toHaveBeenCalledWith('token', 'new-token-456')
    })
    
    it('loadUserFromStorage should restore user session', async () => {
      uni.getStorageSync.mockImplementation((key) => {
        if (key === 'token') return 'stored-token'
        if (key === 'userInfo') return { id: '123', name: 'Test User' }
        return null
      })
      
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          message: 'success',
          data: {
            valid: true,
            userInfo: {
              id: '123',
              name: 'Test User',
              verified: true
            },
            permissions: ['user']
          }
        }
      })
      
      await userModule.actions.loadUserFromStorage({ commit, dispatch })
      
      expect(commit).toHaveBeenCalledWith('SET_TOKEN', 'stored-token')
      expect(commit).toHaveBeenCalledWith('SET_USER_INFO', expect.any(Object))
      expect(commit).toHaveBeenCalledWith('SET_LOGIN_STATUS', true)
    })
    
    it('updateSettings should save settings', async () => {
      const newSettings = {
        theme: 'dark',
        notifications: false
      }
      
      await userModule.actions.updateSettings({ commit, state }, newSettings)
      
      expect(commit).toHaveBeenCalledWith('UPDATE_SETTINGS', newSettings)
      expect(uni.setStorageSync).toHaveBeenCalledWith(
        'userSettings',
        expect.objectContaining(newSettings)
      )
    })
    
    it('checkSession should validate session', async () => {
      state.token = 'valid-token'
      state.loginTime = Date.now() - 1000 // 1 second ago
      
      const isValid = await userModule.actions.checkSession({ state, dispatch })
      
      expect(isValid).toBe(true)
    })
    
    it('checkSession should handle expired session', async () => {
      state.token = 'expired-token'
      state.loginTime = Date.now() - 8 * 24 * 60 * 60 * 1000 // 8 days ago
      
      const isValid = await userModule.actions.checkSession({ state, dispatch })
      
      expect(isValid).toBe(false)
      expect(dispatch).toHaveBeenCalledWith('logout')
    })
  })
  
  describe('Integration scenarios', () => {
    it('should handle complete login flow', async () => {
      const { state, commit, dispatch } = createStore()
      
      // Mock WeChat login
      uni.login.mockResolvedValueOnce({ code: 'wx-code-123' })
      
      // Mock API response
      uni.request.mockResolvedValueOnce({
        statusCode: 200,
        data: {
          code: 0,
          data: {
            token: 'jwt-123',
            userInfo: { id: '123', name: 'Test' },
            permissions: ['user']
          }
        }
      })
      
      // Perform login
      await userModule.actions.wechatLogin({ commit, dispatch, state })
      
      // Verify state updates
      expect(state.isLoggedIn).toBe(true)
      expect(state.token).toBe('jwt-123')
      expect(state.userInfo).toMatchObject({ id: '123', name: 'Test' })
    })
  })
})

// Helper function to create a mock store context
function createStore() {
  const state = userModule.state()
  const commit = (type, payload) => {
    if (userModule.mutations[type]) {
      userModule.mutations[type](state, payload)
    }
  }
  const dispatch = jest.fn()
  
  return { state, commit, dispatch }
}