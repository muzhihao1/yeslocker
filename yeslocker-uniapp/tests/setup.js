/**
 * Jest 测试环境配置
 */

// Mock uni-app 全局 API
global.uni = {
  // 存储相关
  getStorageSync: jest.fn((key) => {
    const storage = {
      userInfo: { userId: '12345', name: '测试用户', phone: '13800138000' },
      token: 'test-token-123',
      appSettings: { enableNotification: true }
    }
    return storage[key] || null
  }),
  setStorageSync: jest.fn(),
  removeStorageSync: jest.fn(),
  clearStorageSync: jest.fn(),
  getStorageInfo: jest.fn(() => Promise.resolve({ keys: [], currentSize: 1024, limitSize: 10240 })),
  
  // 路由相关
  navigateTo: jest.fn(),
  redirectTo: jest.fn(),
  reLaunch: jest.fn(),
  switchTab: jest.fn(),
  navigateBack: jest.fn(),
  
  // UI 相关
  showToast: jest.fn(),
  showLoading: jest.fn(),
  hideLoading: jest.fn(),
  showModal: jest.fn(() => Promise.resolve({ confirm: true, cancel: false })),
  showActionSheet: jest.fn(() => Promise.resolve({ tapIndex: 0 })),
  
  // 网络请求
  request: jest.fn(() => Promise.resolve({
    statusCode: 200,
    data: { code: 0, message: 'success', data: {} }
  })),
  
  // 文件相关
  chooseImage: jest.fn(() => Promise.resolve({
    tempFilePaths: ['/tmp/test.jpg'],
    tempFiles: [{ path: '/tmp/test.jpg', size: 1024 }]
  })),
  uploadFile: jest.fn(() => Promise.resolve({
    statusCode: 200,
    data: JSON.stringify({ url: 'https://example.com/test.jpg' })
  })),
  
  // 系统信息
  getSystemInfoSync: jest.fn(() => ({
    brand: 'test',
    model: 'test-model',
    system: 'iOS 14.0',
    platform: 'ios',
    screenWidth: 375,
    screenHeight: 667,
    windowWidth: 375,
    windowHeight: 600,
    statusBarHeight: 20,
    pixelRatio: 2
  })),
  
  // 位置相关
  getLocation: jest.fn(() => Promise.resolve({
    latitude: 39.9042,
    longitude: 116.4074,
    speed: 0,
    accuracy: 65
  })),
  
  // 扫码
  scanCode: jest.fn(() => Promise.resolve({
    result: 'YE2025072300001',
    scanType: 'QR_CODE',
    charSet: 'utf-8'
  })),
  
  // Canvas
  createCanvasContext: jest.fn(() => ({
    setFillStyle: jest.fn(),
    setStrokeStyle: jest.fn(),
    setLineWidth: jest.fn(),
    setFontSize: jest.fn(),
    setTextAlign: jest.fn(),
    fillRect: jest.fn(),
    strokeRect: jest.fn(),
    fillText: jest.fn(),
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    arc: jest.fn(),
    closePath: jest.fn(),
    fill: jest.fn(),
    stroke: jest.fn(),
    draw: jest.fn(),
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    rotate: jest.fn()
  })),
  
  // 登录
  login: jest.fn(() => Promise.resolve({ code: 'test-login-code' })),
  
  // 支付
  requestPayment: jest.fn(() => Promise.resolve({ errMsg: 'requestPayment:ok' })),
  
  // 下载
  downloadFile: jest.fn(() => Promise.resolve({
    statusCode: 200,
    tempFilePath: '/tmp/download.file'
  })),
  
  // 保存文件
  saveFile: jest.fn(() => Promise.resolve({
    savedFilePath: '/saved/file.ext'
  })),
  
  // 打开文档
  openDocument: jest.fn(),
  
  // 分享
  share: jest.fn(),
  showShareMenu: jest.fn(),
  
  // 订阅消息
  requestSubscribeMessage: jest.fn(() => Promise.resolve({
    errMsg: 'requestSubscribeMessage:ok'
  }))
}

// Mock Vue
global.Vue = {
  config: {
    productionTip: false,
    devtools: false
  }
}

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn()
}