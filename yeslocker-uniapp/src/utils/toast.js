/**
 * 全局 Toast 管理器
 * 提供统一的消息提示接口
 */

// Toast 类型
export const TOAST_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  DEFAULT: 'default'
}

// Toast 位置
export const TOAST_POSITIONS = {
  TOP: 'top',
  CENTER: 'center',
  BOTTOM: 'bottom'
}

// 默认配置
const DEFAULT_OPTIONS = {
  type: TOAST_TYPES.DEFAULT,
  position: TOAST_POSITIONS.TOP,
  duration: 3000,
  showIcon: true,
  showClose: false,
  showAction: false,
  actionText: '查看'
}

class ToastManager {
  constructor() {
    this.queue = []
    this.currentToast = null
    this.toastComponent = null
  }
  
  /**
   * 设置 Toast 组件实例
   */
  setToastComponent(component) {
    this.toastComponent = component
  }
  
  /**
   * 显示 Toast
   */
  show(message, options = {}) {
    const toastConfig = {
      ...DEFAULT_OPTIONS,
      ...options,
      message,
      id: Date.now()
    }
    
    // 如果有正在显示的 Toast，加入队列
    if (this.currentToast) {
      this.queue.push(toastConfig)
      return toastConfig.id
    }
    
    // 显示 Toast
    this.showToast(toastConfig)
    return toastConfig.id
  }
  
  /**
   * 显示成功提示
   */
  success(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.SUCCESS,
      showIcon: true
    })
  }
  
  /**
   * 显示错误提示
   */
  error(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.ERROR,
      showIcon: true,
      duration: 4000 // 错误提示显示时间更长
    })
  }
  
  /**
   * 显示警告提示
   */
  warning(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.WARNING,
      showIcon: true
    })
  }
  
  /**
   * 显示信息提示
   */
  info(message, options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.INFO,
      showIcon: true
    })
  }
  
  /**
   * 显示加载提示
   */
  loading(message = '加载中...', options = {}) {
    return this.show(message, {
      ...options,
      type: TOAST_TYPES.DEFAULT,
      duration: 0, // 不自动关闭
      showIcon: false,
      showClose: false
    })
  }
  
  /**
   * 关闭 Toast
   */
  close(id) {
    if (this.currentToast && (!id || this.currentToast.id === id)) {
      this.hideToast()
    } else {
      // 从队列中移除
      this.queue = this.queue.filter(toast => toast.id !== id)
    }
  }
  
  /**
   * 关闭所有 Toast
   */
  closeAll() {
    this.queue = []
    if (this.currentToast) {
      this.hideToast()
    }
  }
  
  /**
   * 显示 Toast
   */
  showToast(config) {
    this.currentToast = config
    
    // 使用 uni.showToast 作为后备
    if (!this.toastComponent) {
      this.showUniToast(config)
      return
    }
    
    // 使用自定义 Toast 组件
    this.toastComponent.show(config)
    
    // 自动关闭
    if (config.duration > 0) {
      setTimeout(() => {
        if (this.currentToast && this.currentToast.id === config.id) {
          this.hideToast()
        }
      }, config.duration)
    }
  }
  
  /**
   * 隐藏 Toast
   */
  hideToast() {
    if (this.toastComponent) {
      this.toastComponent.hide()
    } else {
      uni.hideToast()
    }
    
    this.currentToast = null
    
    // 显示队列中的下一个 Toast
    if (this.queue.length > 0) {
      const nextToast = this.queue.shift()
      setTimeout(() => {
        this.showToast(nextToast)
      }, 300) // 延迟显示，避免闪烁
    }
  }
  
  /**
   * 使用 uni.showToast 显示提示（后备方案）
   */
  showUniToast(config) {
    const iconMap = {
      success: 'success',
      error: 'error',
      warning: 'none',
      info: 'none',
      default: 'none'
    }
    
    uni.showToast({
      title: config.message,
      icon: iconMap[config.type] || 'none',
      duration: config.duration || 3000,
      mask: config.mask || false
    })
    
    // 处理自动关闭
    if (config.duration > 0) {
      setTimeout(() => {
        if (this.currentToast && this.currentToast.id === config.id) {
          this.currentToast = null
          this.showNextInQueue()
        }
      }, config.duration)
    }
  }
  
  /**
   * 显示队列中的下一个
   */
  showNextInQueue() {
    if (this.queue.length > 0) {
      const nextToast = this.queue.shift()
      setTimeout(() => {
        this.showToast(nextToast)
      }, 300)
    }
  }
}

// 创建单例
const toastManager = new ToastManager()

// 导出便捷方法
export const toast = {
  show: (message, options) => toastManager.show(message, options),
  success: (message, options) => toastManager.success(message, options),
  error: (message, options) => toastManager.error(message, options),
  warning: (message, options) => toastManager.warning(message, options),
  info: (message, options) => toastManager.info(message, options),
  loading: (message, options) => toastManager.loading(message, options),
  close: (id) => toastManager.close(id),
  closeAll: () => toastManager.closeAll(),
  setComponent: (component) => toastManager.setToastComponent(component)
}

// 导出管理器实例
export default toastManager