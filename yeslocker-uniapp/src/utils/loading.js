/**
 * 全局加载状态管理器
 * 统一管理应用中的加载状态
 */

// 加载类型
export const LOADING_TYPES = {
  SPINNER: 'spinner',
  PROGRESS: 'progress',
  STEPS: 'steps',
  CUSTOM: 'custom'
}

// 默认配置
const DEFAULT_OPTIONS = {
  type: LOADING_TYPES.SPINNER,
  text: '加载中...',
  subText: '',
  mask: true
}

class LoadingManager {
  constructor() {
    this.loadingStack = []
    this.loadingComponent = null
    this.currentLoading = null
  }
  
  /**
   * 设置加载组件实例
   */
  setLoadingComponent(component) {
    this.loadingComponent = component
  }
  
  /**
   * 显示加载
   */
  show(options = {}) {
    const loadingConfig = {
      ...DEFAULT_OPTIONS,
      ...options,
      id: Date.now()
    }
    
    // 添加到堆栈
    this.loadingStack.push(loadingConfig)
    
    // 显示加载
    this.showLoading(loadingConfig)
    
    return loadingConfig.id
  }
  
  /**
   * 显示进度加载
   */
  showProgress(text = '处理中...', initialProgress = 0) {
    return this.show({
      type: LOADING_TYPES.PROGRESS,
      text,
      progress: initialProgress
    })
  }
  
  /**
   * 更新进度
   */
  updateProgress(id, progress, text) {
    const loading = this.loadingStack.find(l => l.id === id)
    if (loading) {
      loading.progress = progress
      if (text) {
        loading.text = text
      }
      
      if (this.loadingComponent && this.currentLoading && this.currentLoading.id === id) {
        this.loadingComponent.updateProgress(progress, text)
      }
    }
  }
  
  /**
   * 显示步骤加载
   */
  showSteps(steps, currentStep = 0, text) {
    return this.show({
      type: LOADING_TYPES.STEPS,
      steps,
      currentStep,
      text: text || `正在${steps[currentStep]}...`
    })
  }
  
  /**
   * 更新步骤
   */
  updateStep(id, currentStep, text) {
    const loading = this.loadingStack.find(l => l.id === id)
    if (loading && loading.type === LOADING_TYPES.STEPS) {
      loading.currentStep = currentStep
      if (text) {
        loading.text = text
      } else if (loading.steps[currentStep]) {
        loading.text = `正在${loading.steps[currentStep]}...`
      }
      
      if (this.loadingComponent && this.currentLoading && this.currentLoading.id === id) {
        this.loadingComponent.updateStep(currentStep, loading.text)
      }
    }
  }
  
  /**
   * 隐藏加载
   */
  hide(id) {
    if (!id) {
      // 隐藏最后一个
      if (this.loadingStack.length > 0) {
        const loading = this.loadingStack.pop()
        if (this.loadingStack.length === 0) {
          this.hideLoading()
        } else {
          // 显示上一个加载
          this.showLoading(this.loadingStack[this.loadingStack.length - 1])
        }
      }
    } else {
      // 隐藏指定ID的加载
      const index = this.loadingStack.findIndex(l => l.id === id)
      if (index !== -1) {
        this.loadingStack.splice(index, 1)
        
        if (this.currentLoading && this.currentLoading.id === id) {
          if (this.loadingStack.length > 0) {
            // 显示堆栈中的最后一个
            this.showLoading(this.loadingStack[this.loadingStack.length - 1])
          } else {
            this.hideLoading()
          }
        }
      }
    }
  }
  
  /**
   * 隐藏所有加载
   */
  hideAll() {
    this.loadingStack = []
    this.hideLoading()
  }
  
  /**
   * 显示加载
   */
  showLoading(config) {
    this.currentLoading = config
    
    // 使用 uni.showLoading 作为后备
    if (!this.loadingComponent) {
      this.showUniLoading(config)
      return
    }
    
    // 使用自定义加载组件
    this.loadingComponent.show(config)
  }
  
  /**
   * 隐藏加载
   */
  hideLoading() {
    if (this.loadingComponent) {
      this.loadingComponent.hide()
    } else {
      uni.hideLoading()
    }
    
    this.currentLoading = null
  }
  
  /**
   * 使用 uni.showLoading 显示加载（后备方案）
   */
  showUniLoading(config) {
    uni.showLoading({
      title: config.text,
      mask: config.mask !== false
    })
  }
  
  /**
   * 执行异步操作并显示加载
   */
  async run(asyncFn, options = {}) {
    const id = this.show(options)
    
    try {
      const result = await asyncFn()
      this.hide(id)
      return result
    } catch (error) {
      this.hide(id)
      throw error
    }
  }
  
  /**
   * 执行带进度的异步操作
   */
  async runWithProgress(asyncFn, text = '处理中...') {
    const id = this.showProgress(text, 0)
    
    try {
      // 传入进度更新函数
      const result = await asyncFn((progress, progressText) => {
        this.updateProgress(id, progress, progressText)
      })
      
      // 完成
      this.updateProgress(id, 100, '完成')
      
      setTimeout(() => {
        this.hide(id)
      }, 500)
      
      return result
    } catch (error) {
      this.hide(id)
      throw error
    }
  }
  
  /**
   * 执行带步骤的异步操作
   */
  async runWithSteps(steps, asyncFn) {
    const id = this.showSteps(steps.map(s => s.label), 0)
    
    try {
      // 传入步骤更新函数
      const result = await asyncFn((stepIndex) => {
        this.updateStep(id, stepIndex)
      })
      
      // 完成
      this.updateStep(id, steps.length - 1)
      
      setTimeout(() => {
        this.hide(id)
      }, 500)
      
      return result
    } catch (error) {
      this.hide(id)
      throw error
    }
  }
}

// 创建单例
const loadingManager = new LoadingManager()

// 导出便捷方法
export const loading = {
  show: (options) => loadingManager.show(options),
  showProgress: (text, progress) => loadingManager.showProgress(text, progress),
  showSteps: (steps, currentStep, text) => loadingManager.showSteps(steps, currentStep, text),
  updateProgress: (id, progress, text) => loadingManager.updateProgress(id, progress, text),
  updateStep: (id, step, text) => loadingManager.updateStep(id, step, text),
  hide: (id) => loadingManager.hide(id),
  hideAll: () => loadingManager.hideAll(),
  run: (asyncFn, options) => loadingManager.run(asyncFn, options),
  runWithProgress: (asyncFn, text) => loadingManager.runWithProgress(asyncFn, text),
  runWithSteps: (steps, asyncFn) => loadingManager.runWithSteps(steps, asyncFn),
  setComponent: (component) => loadingManager.setLoadingComponent(component)
}

// 导出管理器实例
export default loadingManager