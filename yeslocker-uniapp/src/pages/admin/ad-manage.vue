<template>
  <view class="ad-manage-page">
    <!-- Header -->
    <view class="page-header">
      <text class="page-title">广告管理</text>
      <button class="add-btn" @click="showAddModal">
        <text class="btn-icon">+</text>
        <text class="btn-text">新建广告</text>
      </button>
    </view>
    
    <!-- Filter Tabs -->
    <view class="filter-tabs">
      <view 
        v-for="tab in tabs" 
        :key="tab.value"
        class="tab-item"
        :class="{ active: currentTab === tab.value }"
        @click="switchTab(tab.value)"
      >
        <text class="tab-text">{{ tab.label }}</text>
      </view>
    </view>
    
    <!-- Ad List -->
    <view class="ad-list" v-if="filteredAds.length > 0">
      <view 
        v-for="ad in filteredAds" 
        :key="ad.id"
        class="ad-card"
      >
        <!-- Ad Preview -->
        <view class="ad-preview">
          <image 
            :src="ad.imageUrl" 
            mode="aspectFill"
            class="preview-image"
          />
          <view class="ad-type-tag">{{ getAdTypeName(ad.type) }}</view>
        </view>
        
        <!-- Ad Info -->
        <view class="ad-info">
          <text class="ad-title">{{ ad.title }}</text>
          <text class="ad-position">位置：{{ getPositionName(ad.position) }}</text>
          <view class="ad-stats">
            <text class="stat-item">曝光：{{ ad.exposures || 0 }}</text>
            <text class="stat-item">点击：{{ ad.clicks || 0 }}</text>
            <text class="stat-item">CTR：{{ calculateCTR(ad) }}%</text>
          </view>
          <view class="ad-schedule">
            <text class="schedule-text">{{ formatSchedule(ad) }}</text>
          </view>
        </view>
        
        <!-- Actions -->
        <view class="ad-actions">
          <switch 
            :checked="ad.enabled" 
            @change="toggleAdStatus(ad)"
            color="#1890ff"
          />
          <view class="action-buttons">
            <button class="action-btn edit" @click="editAd(ad)">
              <text class="btn-icon">✏️</text>
            </button>
            <button class="action-btn delete" @click="deleteAd(ad)">
              <text class="btn-icon">🗑️</text>
            </button>
          </view>
        </view>
      </view>
    </view>
    
    <!-- Empty State -->
    <view class="empty-state" v-else>
      <image src="/static/empty-ads.png" mode="aspectFit" class="empty-image" />
      <text class="empty-text">暂无{{ currentTabText }}广告</text>
      <button class="empty-btn" @click="showAddModal">创建第一个广告</button>
    </view>
    
    <!-- Add/Edit Modal -->
    <view class="modal-mask" v-if="showModal" @click="hideModal">
      <view class="modal-content" @click.stop>
        <view class="modal-header">
          <text class="modal-title">{{ isEdit ? '编辑广告' : '新建广告' }}</text>
          <text class="modal-close" @click="hideModal">×</text>
        </view>
        
        <scroll-view scroll-y class="modal-body">
          <!-- Basic Info -->
          <view class="form-section">
            <text class="section-title">基本信息</text>
            <view class="form-item">
              <text class="form-label">广告标题</text>
              <input 
                v-model="formData.title"
                placeholder="请输入广告标题"
                class="form-input"
              />
            </view>
            <view class="form-item">
              <text class="form-label">广告描述</text>
              <textarea 
                v-model="formData.description"
                placeholder="请输入广告描述（选填）"
                class="form-textarea"
              />
            </view>
          </view>
          
          <!-- Ad Type -->
          <view class="form-section">
            <text class="section-title">广告类型</text>
            <view class="type-grid">
              <view 
                v-for="type in adTypes" 
                :key="type.value"
                class="type-item"
                :class="{ active: formData.type === type.value }"
                @click="selectAdType(type.value)"
              >
                <text class="type-icon">{{ type.icon }}</text>
                <text class="type-name">{{ type.label }}</text>
              </view>
            </view>
          </view>
          
          <!-- Ad Position -->
          <view class="form-section">
            <text class="section-title">投放位置</text>
            <view class="position-list">
              <label 
                v-for="pos in positions" 
                :key="pos.value"
                class="position-item"
              >
                <checkbox 
                  :value="pos.value"
                  :checked="formData.positions.includes(pos.value)"
                  @change="togglePosition(pos.value)"
                  color="#1890ff"
                />
                <text class="position-label">{{ pos.label }}</text>
              </label>
            </view>
          </view>
          
          <!-- Upload Image -->
          <view class="form-section">
            <text class="section-title">广告图片</text>
            <view class="upload-area" @click="chooseImage">
              <image 
                v-if="formData.imageUrl"
                :src="formData.imageUrl"
                mode="aspectFill"
                class="upload-preview"
              />
              <view v-else class="upload-placeholder">
                <text class="upload-icon">📷</text>
                <text class="upload-text">点击上传图片</text>
                <text class="upload-hint">建议尺寸：750x400</text>
              </view>
            </view>
          </view>
          
          <!-- Link Settings -->
          <view class="form-section">
            <text class="section-title">跳转设置</text>
            <view class="form-item">
              <text class="form-label">跳转类型</text>
              <picker 
                :value="linkTypeIndex"
                :range="linkTypes"
                range-key="label"
                @change="onLinkTypeChange"
              >
                <view class="picker-value">
                  {{ linkTypes[linkTypeIndex].label }}
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
            <view class="form-item" v-if="formData.linkType !== 'none'">
              <text class="form-label">跳转链接</text>
              <input 
                v-model="formData.linkUrl"
                :placeholder="getLinkPlaceholder()"
                class="form-input"
              />
            </view>
          </view>
          
          <!-- Schedule Settings -->
          <view class="form-section">
            <text class="section-title">投放时间</text>
            <view class="form-item">
              <text class="form-label">开始时间</text>
              <picker 
                mode="date"
                :value="formData.startDate"
                @change="onStartDateChange"
              >
                <view class="picker-value">
                  {{ formData.startDate || '立即开始' }}
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
            <view class="form-item">
              <text class="form-label">结束时间</text>
              <picker 
                mode="date"
                :value="formData.endDate"
                @change="onEndDateChange"
              >
                <view class="picker-value">
                  {{ formData.endDate || '长期有效' }}
                  <text class="picker-arrow">›</text>
                </view>
              </picker>
            </view>
          </view>
          
          <!-- Priority -->
          <view class="form-section">
            <text class="section-title">优先级</text>
            <slider 
              :value="formData.priority"
              @change="onPriorityChange"
              min="1"
              max="10"
              show-value
              activeColor="#1890ff"
            />
            <text class="priority-hint">数值越大，展示优先级越高</text>
          </view>
        </scroll-view>
        
        <view class="modal-footer">
          <button class="modal-btn cancel" @click="hideModal">取消</button>
          <button class="modal-btn confirm" @click="saveAd">
            {{ isEdit ? '保存修改' : '创建广告' }}
          </button>
        </view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  name: 'AdManagePage',
  data() {
    return {
      tabs: [
        { label: '全部', value: 'all' },
        { label: '投放中', value: 'active' },
        { label: '已暂停', value: 'paused' },
        { label: '已结束', value: 'ended' }
      ],
      currentTab: 'all',
      ads: [],
      showModal: false,
      isEdit: false,
      formData: {
        id: '',
        title: '',
        description: '',
        type: 'banner',
        positions: [],
        imageUrl: '',
        linkType: 'none',
        linkUrl: '',
        startDate: '',
        endDate: '',
        priority: 5,
        enabled: true
      },
      adTypes: [
        { label: '横幅', value: 'banner', icon: '🖼️' },
        { label: '轮播', value: 'carousel', icon: '🎠' },
        { label: '弹窗', value: 'popup', icon: '📢' },
        { label: '内嵌', value: 'inline', icon: '📋' },
        { label: '浮动', value: 'float', icon: '🎈' }
      ],
      positions: [
        { label: '首页轮播', value: 'home_banner' },
        { label: '首页弹窗', value: 'home_popup' },
        { label: '历史列表', value: 'history_inline' },
        { label: '存储页底部', value: 'storage_bottom' },
        { label: '个人中心浮动', value: 'profile_float' }
      ],
      linkTypes: [
        { label: '不跳转', value: 'none' },
        { label: '内部页面', value: 'page' },
        { label: 'H5页面', value: 'webview' },
        { label: '其他小程序', value: 'miniprogram' },
        { label: '外部链接', value: 'external' }
      ]
    }
  },
  computed: {
    filteredAds() {
      if (this.currentTab === 'all') {
        return this.ads
      } else if (this.currentTab === 'active') {
        return this.ads.filter(ad => ad.enabled && this.isActive(ad))
      } else if (this.currentTab === 'paused') {
        return this.ads.filter(ad => !ad.enabled)
      } else {
        return this.ads.filter(ad => this.isEnded(ad))
      }
    },
    currentTabText() {
      const tab = this.tabs.find(t => t.value === this.currentTab)
      return tab ? tab.label : ''
    },
    linkTypeIndex() {
      return this.linkTypes.findIndex(t => t.value === this.formData.linkType)
    }
  },
  onLoad() {
    this.loadAds()
  },
  methods: {
    async loadAds() {
      // TODO: 从服务器加载广告列表
      // 模拟数据
      this.ads = [
        {
          id: '1',
          title: '新用户专享优惠',
          type: 'carousel',
          positions: ['home_banner'],
          imageUrl: '/static/ad-banner-1.jpg',
          linkType: 'page',
          linkUrl: '/pages/marketplace/index',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          priority: 8,
          enabled: true,
          exposures: 1234,
          clicks: 56
        },
        {
          id: '2',
          title: '会员储物柜限时特惠',
          type: 'popup',
          positions: ['home_popup'],
          imageUrl: '/static/ad-banner-2.jpg',
          linkType: 'page',
          linkUrl: '/pages/user/membership',
          priority: 6,
          enabled: false,
          exposures: 890,
          clicks: 23
        }
      ]
    },
    
    switchTab(value) {
      this.currentTab = value
    },
    
    showAddModal() {
      this.isEdit = false
      this.resetForm()
      this.showModal = true
    },
    
    hideModal() {
      this.showModal = false
    },
    
    resetForm() {
      this.formData = {
        id: '',
        title: '',
        description: '',
        type: 'banner',
        positions: [],
        imageUrl: '',
        linkType: 'none',
        linkUrl: '',
        startDate: '',
        endDate: '',
        priority: 5,
        enabled: true
      }
    },
    
    editAd(ad) {
      this.isEdit = true
      this.formData = { ...ad }
      this.showModal = true
    },
    
    async deleteAd(ad) {
      uni.showModal({
        title: '确认删除',
        content: `确定要删除广告"${ad.title}"吗？`,
        success: async (res) => {
          if (res.confirm) {
            uni.showLoading({
              title: '删除中...'
            })
            
            try {
              // TODO: 调用删除API
              await new Promise(resolve => setTimeout(resolve, 1000))
              
              // 从列表中移除
              const index = this.ads.findIndex(item => item.id === ad.id)
              if (index > -1) {
                this.ads.splice(index, 1)
              }
              
              uni.hideLoading()
              uni.showToast({
                title: '删除成功',
                icon: 'success'
              })
            } catch (error) {
              uni.hideLoading()
              uni.showToast({
                title: '删除失败',
                icon: 'none'
              })
            }
          }
        }
      })
    },
    
    toggleAdStatus(ad) {
      ad.enabled = !ad.enabled
      
      // TODO: 调用API更新状态
      uni.showToast({
        title: ad.enabled ? '已启用' : '已暂停',
        icon: 'none'
      })
    },
    
    selectAdType(type) {
      this.formData.type = type
    },
    
    togglePosition(position) {
      const index = this.formData.positions.indexOf(position)
      if (index > -1) {
        this.formData.positions.splice(index, 1)
      } else {
        this.formData.positions.push(position)
      }
    },
    
    async chooseImage() {
      uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0]
          
          // TODO: 上传图片到服务器
          // 暂时使用本地路径
          this.formData.imageUrl = tempFilePath
        }
      })
    },
    
    onLinkTypeChange(e) {
      this.formData.linkType = this.linkTypes[e.detail.value].value
      
      // 清空链接
      if (this.formData.linkType === 'none') {
        this.formData.linkUrl = ''
      }
    },
    
    getLinkPlaceholder() {
      const placeholders = {
        page: '请输入页面路径，如 /pages/user/index',
        webview: '请输入H5链接，如 https://example.com',
        miniprogram: '请输入小程序AppID',
        external: '请输入外部链接'
      }
      return placeholders[this.formData.linkType] || '请输入链接'
    },
    
    onStartDateChange(e) {
      this.formData.startDate = e.detail.value
    },
    
    onEndDateChange(e) {
      this.formData.endDate = e.detail.value
    },
    
    onPriorityChange(e) {
      this.formData.priority = e.detail.value
    },
    
    async saveAd() {
      // 验证表单
      if (!this.formData.title) {
        uni.showToast({
          title: '请输入广告标题',
          icon: 'none'
        })
        return
      }
      
      if (this.formData.positions.length === 0) {
        uni.showToast({
          title: '请选择投放位置',
          icon: 'none'
        })
        return
      }
      
      if (!this.formData.imageUrl) {
        uni.showToast({
          title: '请上传广告图片',
          icon: 'none'
        })
        return
      }
      
      uni.showLoading({
        title: '保存中...'
      })
      
      try {
        // TODO: 调用保存API
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        if (this.isEdit) {
          // 更新列表中的数据
          const index = this.ads.findIndex(item => item.id === this.formData.id)
          if (index > -1) {
            this.ads[index] = { ...this.formData }
          }
        } else {
          // 添加到列表
          this.ads.unshift({
            ...this.formData,
            id: Date.now().toString(),
            exposures: 0,
            clicks: 0
          })
        }
        
        uni.hideLoading()
        uni.showToast({
          title: this.isEdit ? '修改成功' : '创建成功',
          icon: 'success'
        })
        
        this.hideModal()
      } catch (error) {
        uni.hideLoading()
        uni.showToast({
          title: '保存失败',
          icon: 'none'
        })
      }
    },
    
    getAdTypeName(type) {
      const typeObj = this.adTypes.find(t => t.value === type)
      return typeObj ? typeObj.label : type
    },
    
    getPositionName(position) {
      if (Array.isArray(position)) {
        return position.map(p => {
          const pos = this.positions.find(item => item.value === p)
          return pos ? pos.label : p
        }).join('、')
      }
      
      const pos = this.positions.find(p => p.value === position)
      return pos ? pos.label : position
    },
    
    calculateCTR(ad) {
      if (!ad.exposures || ad.exposures === 0) return '0.00'
      return ((ad.clicks / ad.exposures) * 100).toFixed(2)
    },
    
    formatSchedule(ad) {
      const now = new Date()
      const start = ad.startDate ? new Date(ad.startDate) : null
      const end = ad.endDate ? new Date(ad.endDate) : null
      
      if (!start && !end) {
        return '长期有效'
      } else if (start && !end) {
        return `${ad.startDate} 开始`
      } else if (!start && end) {
        return `至 ${ad.endDate}`
      } else {
        if (now < start) {
          return `待投放（${ad.startDate} 开始）`
        } else if (now > end) {
          return `已结束（${ad.endDate}）`
        } else {
          return `${ad.startDate} 至 ${ad.endDate}`
        }
      }
    },
    
    isActive(ad) {
      if (!ad.enabled) return false
      
      const now = new Date()
      const start = ad.startDate ? new Date(ad.startDate) : null
      const end = ad.endDate ? new Date(ad.endDate) : null
      
      if (start && now < start) return false
      if (end && now > end) return false
      
      return true
    },
    
    isEnded(ad) {
      const now = new Date()
      const end = ad.endDate ? new Date(ad.endDate) : null
      
      return end && now > end
    }
  }
}
</script>

<style lang="scss" scoped>
.ad-manage-page {
  min-height: 100vh;
  background-color: #f5f6f7;
  padding-bottom: 32rpx;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 32rpx;
  background-color: #ffffff;
  
  .page-title {
    font-size: 40rpx;
    font-weight: 600;
    color: #333333;
  }
  
  .add-btn {
    display: flex;
    align-items: center;
    padding: 16rpx 24rpx;
    background-color: #1890ff;
    color: #ffffff;
    border-radius: 8rpx;
    font-size: 28rpx;
    border: none;
    
    .btn-icon {
      font-size: 32rpx;
      margin-right: 8rpx;
    }
  }
}

.filter-tabs {
  display: flex;
  padding: 0 32rpx;
  background-color: #ffffff;
  border-bottom: 1rpx solid #f0f0f0;
  
  .tab-item {
    flex: 1;
    text-align: center;
    padding: 24rpx 0;
    position: relative;
    
    .tab-text {
      font-size: 30rpx;
      color: #666666;
      transition: all 0.3s;
    }
    
    &.active {
      .tab-text {
        color: #1890ff;
        font-weight: 500;
      }
      
      &::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translateX(-50%);
        width: 60rpx;
        height: 4rpx;
        background-color: #1890ff;
      }
    }
  }
}

.ad-list {
  padding: 24rpx 32rpx;
  
  .ad-card {
    background-color: #ffffff;
    border-radius: 16rpx;
    padding: 24rpx;
    margin-bottom: 24rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.05);
    
    .ad-preview {
      position: relative;
      width: 100%;
      height: 200rpx;
      margin-bottom: 24rpx;
      border-radius: 8rpx;
      overflow: hidden;
      
      .preview-image {
        width: 100%;
        height: 100%;
      }
      
      .ad-type-tag {
        position: absolute;
        top: 16rpx;
        left: 16rpx;
        padding: 8rpx 16rpx;
        background-color: rgba(0, 0, 0, 0.6);
        color: #ffffff;
        font-size: 24rpx;
        border-radius: 4rpx;
      }
    }
    
    .ad-info {
      margin-bottom: 24rpx;
      
      .ad-title {
        display: block;
        font-size: 32rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 12rpx;
      }
      
      .ad-position {
        display: block;
        font-size: 28rpx;
        color: #666666;
        margin-bottom: 12rpx;
      }
      
      .ad-stats {
        display: flex;
        gap: 24rpx;
        margin-bottom: 12rpx;
        
        .stat-item {
          font-size: 26rpx;
          color: #999999;
        }
      }
      
      .ad-schedule {
        .schedule-text {
          font-size: 26rpx;
          color: #999999;
        }
      }
    }
    
    .ad-actions {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      .action-buttons {
        display: flex;
        gap: 16rpx;
        
        .action-btn {
          width: 64rpx;
          height: 64rpx;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 28rpx;
          border: none;
          
          &.edit {
            background-color: #e6f7ff;
          }
          
          &.delete {
            background-color: #fff1f0;
          }
        }
      }
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120rpx 32rpx;
  
  .empty-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: 32rpx;
  }
  
  .empty-text {
    font-size: 30rpx;
    color: #666666;
    margin-bottom: 48rpx;
  }
  
  .empty-btn {
    width: 280rpx;
    height: 80rpx;
    line-height: 80rpx;
    background-color: #1890ff;
    color: #ffffff;
    border-radius: 40rpx;
    font-size: 30rpx;
    border: none;
  }
}

.modal-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-content {
  width: 90%;
  max-width: 600rpx;
  background-color: #ffffff;
  border-radius: 16rpx;
  overflow: hidden;
  
  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 32rpx;
    border-bottom: 1rpx solid #f0f0f0;
    
    .modal-title {
      font-size: 32rpx;
      font-weight: 500;
      color: #333333;
    }
    
    .modal-close {
      font-size: 40rpx;
      color: #999999;
    }
  }
  
  .modal-body {
    max-height: 800rpx;
    padding: 32rpx;
    
    .form-section {
      margin-bottom: 40rpx;
      
      .section-title {
        display: block;
        font-size: 30rpx;
        font-weight: 500;
        color: #333333;
        margin-bottom: 20rpx;
      }
      
      .form-item {
        margin-bottom: 24rpx;
        
        .form-label {
          display: block;
          font-size: 28rpx;
          color: #666666;
          margin-bottom: 12rpx;
        }
        
        .form-input {
          width: 100%;
          height: 80rpx;
          padding: 0 24rpx;
          font-size: 28rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          background-color: #f8f8f8;
        }
        
        .form-textarea {
          width: 100%;
          min-height: 160rpx;
          padding: 20rpx 24rpx;
          font-size: 28rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          background-color: #f8f8f8;
        }
      }
      
      .type-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16rpx;
        
        .type-item {
          padding: 24rpx 16rpx;
          border: 2rpx solid #e0e0e0;
          border-radius: 8rpx;
          text-align: center;
          transition: all 0.3s;
          
          .type-icon {
            display: block;
            font-size: 40rpx;
            margin-bottom: 8rpx;
          }
          
          .type-name {
            display: block;
            font-size: 26rpx;
            color: #666666;
          }
          
          &.active {
            border-color: #1890ff;
            background-color: #e6f7ff;
            
            .type-name {
              color: #1890ff;
            }
          }
        }
      }
      
      .position-list {
        .position-item {
          display: flex;
          align-items: center;
          margin-bottom: 20rpx;
          
          .position-label {
            margin-left: 16rpx;
            font-size: 28rpx;
            color: #333333;
          }
        }
      }
      
      .upload-area {
        width: 100%;
        height: 300rpx;
        border: 2rpx dashed #e0e0e0;
        border-radius: 8rpx;
        overflow: hidden;
        
        .upload-preview {
          width: 100%;
          height: 100%;
        }
        
        .upload-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background-color: #f8f8f8;
          
          .upload-icon {
            font-size: 64rpx;
            margin-bottom: 16rpx;
          }
          
          .upload-text {
            font-size: 30rpx;
            color: #666666;
            margin-bottom: 8rpx;
          }
          
          .upload-hint {
            font-size: 26rpx;
            color: #999999;
          }
        }
      }
      
      .picker-value {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 80rpx;
        padding: 0 24rpx;
        font-size: 28rpx;
        color: #333333;
        border: 2rpx solid #e0e0e0;
        border-radius: 8rpx;
        background-color: #f8f8f8;
        
        .picker-arrow {
          color: #999999;
        }
      }
      
      .priority-hint {
        display: block;
        font-size: 24rpx;
        color: #999999;
        margin-top: 12rpx;
        text-align: center;
      }
    }
  }
  
  .modal-footer {
    display: flex;
    border-top: 1rpx solid #f0f0f0;
    
    .modal-btn {
      flex: 1;
      height: 88rpx;
      line-height: 88rpx;
      text-align: center;
      font-size: 30rpx;
      border: none;
      
      &.cancel {
        background-color: #f8f8f8;
        color: #666666;
      }
      
      &.confirm {
        background-color: #1890ff;
        color: #ffffff;
      }
    }
  }
}
</style>