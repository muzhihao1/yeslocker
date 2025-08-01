# Loading States & User Feedback Guide

This guide documents the comprehensive loading states and user feedback system implemented in the YesLocker WeChat Mini Program.

## Overview

The loading states and feedback system provides:
- Consistent loading skeletons for all data-fetching operations
- Progress indicators for multi-step processes
- Success/error toast messages with appropriate icons
- Pull-to-refresh implementation on list pages
- Loading overlay for form submissions
- Optimistic UI updates where applicable
- Network error recovery with retry options

## Components

### 1. LoadingSkeleton Component

**Location**: `/src/components/atoms/LoadingSkeleton.vue`

**Usage**:
```vue
<loading-skeleton 
  type="card"       // card, list, image, button, custom
  :lines="3"        // number of content lines for card type
  :count="5"        // number of items for list type
  :show-avatar="true" // show avatar for list items
  width="100%"      // width for image/button types
  height="200rpx"   // height for image/button types
/>
```

**Types**:
- `card`: Shows a card skeleton with header and content lines
- `list`: Shows multiple list item skeletons
- `image`: Shows a single image placeholder
- `button`: Shows a button placeholder
- `custom`: Allows custom skeleton content via slot

### 2. LoadingOverlay Component

**Location**: `/src/components/atoms/LoadingOverlay.vue`

**Usage**:
```vue
<loading-overlay
  :visible="loading"
  type="spinner"    // spinner, progress, steps, custom
  text="加载中..."
  sub-text="请稍候"
  :progress="60"    // for progress type
  :steps="['步骤1', '步骤2', '步骤3']" // for steps type
  :current-step="1" // for steps type
/>
```

### 3. Toast Component

**Location**: `/src/components/atoms/Toast.vue`

**Features**:
- Multiple types: success, error, warning, info, default
- Configurable position: top, center, bottom
- Optional icon, close button, and action button
- Auto-dismiss with configurable duration
- Custom colors support

### 4. NetworkError Component

**Location**: `/src/components/atoms/NetworkError.vue`

**Usage**:
```vue
<network-error 
  v-if="networkError"
  title="网络连接失败"
  message="请检查您的网络设置"
  @retry="handleRetry"
  :show-settings="true"
/>
```

### 5. Page-Specific Skeletons

- **HomePageSkeleton**: `/src/components/molecules/HomePageSkeleton.vue`
- **HistoryPageSkeleton**: `/src/components/molecules/HistoryPageSkeleton.vue`

These provide page-specific loading states that match the actual layout.

### 6. MultiStepProgress Component

**Location**: `/src/components/molecules/MultiStepProgress.vue`

**Usage**:
```vue
<multi-step-progress
  :steps="[
    { label: '身份验证', description: '验证您的身份信息' },
    { label: '选择柜号', description: '选择储物柜' },
    { label: '确认信息', description: '确认存储信息' },
    { label: '生成凭证', description: '生成存储凭证' }
  ]"
  :current-step="2"
  title="存储流程"
  current-message="正在处理..."
  :loading="true"
  :error="errorMessage"
  @retry="handleRetry"
/>
```

## Utility Functions

### Toast Manager

**Location**: `/src/utils/toast.js`

**Usage**:
```javascript
import { toast } from '@/utils/toast'

// Basic usage
toast.success('操作成功')
toast.error('操作失败')
toast.warning('请注意')
toast.info('提示信息')

// Advanced usage
toast.error('网络连接失败', {
  duration: 5000,
  showAction: true,
  actionText: '重试',
  onAction: () => {
    // Retry logic
  }
})

// Loading toast (doesn't auto-dismiss)
const loadingId = toast.loading('处理中...')
// Later...
toast.close(loadingId)
```

### Loading Manager

**Location**: `/src/utils/loading.js`

**Usage**:
```javascript
import { loading } from '@/utils/loading'

// Basic loading
const id = loading.show({ text: '加载中...' })
// Later...
loading.hide(id)

// Progress loading
const id = loading.showProgress('上传中...', 0)
// Update progress
loading.updateProgress(id, 50, '已上传 50%')
loading.updateProgress(id, 100, '上传完成')

// Steps loading
const id = loading.showSteps(
  ['验证信息', '创建请求', '生成凭证'],
  0,
  '正在验证信息...'
)
// Update step
loading.updateStep(id, 1, '正在创建请求...')

// Async helper methods
await loading.run(asyncFunction, { text: '处理中...' })
await loading.runWithProgress(asyncFunction, '上传中...')
await loading.runWithSteps(steps, asyncFunction)
```

## Integration with Request Utility

The request utility (`/src/utils/request.js`) has been enhanced to work with the new loading and toast systems:

```javascript
// Request with progress
const response = await request({
  url: '/api/upload',
  method: 'POST',
  data: formData,
  showProgress: true,
  loadingText: '上传中...',
  onProgress: (progress) => {
    console.log('Upload progress:', progress)
  }
})

// Request with custom error handling
const response = await request({
  url: '/api/data',
  showError: false, // Don't show automatic error toast
  // Handle errors manually
})
```

## Implementation Examples

### 1. Home Page with Loading Skeleton

```vue
<template>
  <view class="home-page">
    <home-page-skeleton v-if="loading" />
    <view v-else>
      <!-- Actual content -->
    </view>
    <network-error 
      v-if="networkError"
      @retry="retryLoading"
    />
  </view>
</template>

<script>
import { toast } from '@/utils/toast'

export default {
  async mounted() {
    await this.loadData()
  },
  methods: {
    async loadData() {
      this.loading = true
      this.networkError = false
      
      try {
        await this.fetchData()
        this.loading = false
      } catch (error) {
        this.loading = false
        if (error.type === 'NETWORK_ERROR') {
          this.networkError = true
        } else {
          toast.error('加载失败')
        }
      }
    }
  }
}
</script>
```

### 2. Form Submission with Steps

```vue
<script>
import { loading, toast } from '@/utils'

export default {
  methods: {
    async submitForm() {
      const steps = [
        { label: '验证数据' },
        { label: '提交请求' },
        { label: '处理响应' }
      ]
      
      const loadingId = loading.showSteps(steps, 0)
      
      try {
        // Step 1
        await this.validateData()
        loading.updateStep(loadingId, 1)
        
        // Step 2
        const response = await this.submitRequest()
        loading.updateStep(loadingId, 2)
        
        // Step 3
        await this.processResponse(response)
        
        loading.hide(loadingId)
        toast.success('提交成功！')
      } catch (error) {
        loading.hide(loadingId)
        toast.error(error.message)
      }
    }
  }
}
</script>
```

### 3. List Page with Pull-to-Refresh

```vue
<template>
  <view class="list-page">
    <view v-if="initialLoading">
      <loading-skeleton type="list" :count="5" />
    </view>
    <view v-else>
      <!-- List content -->
      <view v-if="loading && !initialLoading" class="loading-more">
        <loading-skeleton type="list" :count="2" />
      </view>
    </view>
  </view>
</template>

<script>
export default {
  onPullDownRefresh() {
    this.refreshData()
  },
  methods: {
    async refreshData() {
      try {
        await this.loadData()
        toast.success('刷新成功')
      } catch (error) {
        toast.error('刷新失败')
      } finally {
        uni.stopPullDownRefresh()
      }
    }
  }
}
</script>
```

## Best Practices

1. **Use Skeletons for Initial Loads**: Show skeleton screens for the initial page load to improve perceived performance.

2. **Show Progress for Long Operations**: Use progress bars or step indicators for operations that take more than 2-3 seconds.

3. **Provide Clear Error Messages**: Use descriptive error messages and provide retry options when appropriate.

4. **Implement Optimistic Updates**: Update the UI immediately for better responsiveness, then sync with the server.

5. **Handle Network Errors Gracefully**: Always provide a way for users to retry failed operations.

6. **Use Appropriate Loading Types**:
   - Spinner: For quick operations (< 2 seconds)
   - Progress: For measurable operations (file uploads, downloads)
   - Steps: For multi-stage processes (registration, checkout)

7. **Toast Message Guidelines**:
   - Success: Brief confirmation of completed actions
   - Error: Clear error messages with recovery options
   - Warning: Important information that needs attention
   - Info: Non-critical information

## Performance Considerations

1. **Lazy Load Skeletons**: Only import skeleton components when needed
2. **Debounce Loading States**: Avoid flickering by delaying loading states for very quick operations
3. **Cache Loading States**: Reuse loading components instead of creating new instances
4. **Minimize Re-renders**: Use Vue's reactivity system efficiently

## Future Enhancements

1. **Skeleton Animations**: Add shimmer effects to skeletons
2. **Custom Loading Animations**: Support for branded loading animations
3. **Offline Support**: Better handling of offline scenarios
4. **Analytics Integration**: Track loading times and errors
5. **A/B Testing**: Test different loading state approaches