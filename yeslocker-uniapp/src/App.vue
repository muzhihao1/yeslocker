<script>
	import { initAnalytics } from '@/utils/analytics'
	
	export default {
		onLaunch: function() {
			console.log('App Launch')
			
			// 初始化广告统计系统
			initAnalytics()
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style lang="scss">
/* ===== 全局公共样式 ===== */
@import "@/uni.scss";

/* ===== CSS Reset ===== */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

page {
  background-color: $uni-bg-color-grey;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: $uni-font-size-base;
  color: $uni-text-color;
  line-height: 1.5;
}

/* ===== 全局文本样式 ===== */
.text-xs { font-size: $uni-font-size-xs; }
.text-sm { font-size: $uni-font-size-sm; }
.text-base { font-size: $uni-font-size-base; }
.text-lg { font-size: $uni-font-size-lg; }
.text-xl { font-size: $uni-font-size-xl; }
.text-xxl { font-size: $uni-font-size-xxl; }
.text-xxxl { font-size: $uni-font-size-xxxl; }

.text-primary { color: $uni-color-primary; }
.text-success { color: $uni-color-success; }
.text-warning { color: $uni-color-warning; }
.text-error { color: $uni-color-error; }
.text-regular { color: $uni-text-color-regular; }
.text-secondary { color: $uni-text-color-secondary; }
.text-placeholder { color: $uni-text-color-placeholder; }
.text-white { color: #ffffff; }

.text-center { text-align: center; }
.text-left { text-align: left; }
.text-right { text-align: right; }

.font-normal { font-weight: 400; }
.font-medium { font-weight: 500; }
.font-bold { font-weight: 600; }

/* ===== 全局布局样式 ===== */
.container {
  padding: 0 $uni-spacing-lg;
}

.flex {
  display: flex;
}

.flex-center {
  display: flex;
  align-items: center;
  justify-content: center;
}

.flex-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.flex-column {
  display: flex;
  flex-direction: column;
}

.flex-1 {
  flex: 1;
}

.flex-shrink-0 {
  flex-shrink: 0;
}

/* ===== 全局间距样式 ===== */
.p-xs { padding: $uni-spacing-xs; }
.p-sm { padding: $uni-spacing-sm; }
.p-base { padding: $uni-spacing-base; }
.p-md { padding: $uni-spacing-md; }
.p-lg { padding: $uni-spacing-lg; }
.p-xl { padding: $uni-spacing-xl; }

.px-xs { padding-left: $uni-spacing-xs; padding-right: $uni-spacing-xs; }
.px-sm { padding-left: $uni-spacing-sm; padding-right: $uni-spacing-sm; }
.px-base { padding-left: $uni-spacing-base; padding-right: $uni-spacing-base; }
.px-md { padding-left: $uni-spacing-md; padding-right: $uni-spacing-md; }
.px-lg { padding-left: $uni-spacing-lg; padding-right: $uni-spacing-lg; }
.px-xl { padding-left: $uni-spacing-xl; padding-right: $uni-spacing-xl; }

.py-xs { padding-top: $uni-spacing-xs; padding-bottom: $uni-spacing-xs; }
.py-sm { padding-top: $uni-spacing-sm; padding-bottom: $uni-spacing-sm; }
.py-base { padding-top: $uni-spacing-base; padding-bottom: $uni-spacing-base; }
.py-md { padding-top: $uni-spacing-md; padding-bottom: $uni-spacing-md; }
.py-lg { padding-top: $uni-spacing-lg; padding-bottom: $uni-spacing-lg; }
.py-xl { padding-top: $uni-spacing-xl; padding-bottom: $uni-spacing-xl; }

.m-xs { margin: $uni-spacing-xs; }
.m-sm { margin: $uni-spacing-sm; }
.m-base { margin: $uni-spacing-base; }
.m-md { margin: $uni-spacing-md; }
.m-lg { margin: $uni-spacing-lg; }
.m-xl { margin: $uni-spacing-xl; }

.mt-xs { margin-top: $uni-spacing-xs; }
.mt-sm { margin-top: $uni-spacing-sm; }
.mt-base { margin-top: $uni-spacing-base; }
.mt-md { margin-top: $uni-spacing-md; }
.mt-lg { margin-top: $uni-spacing-lg; }
.mt-xl { margin-top: $uni-spacing-xl; }

.mb-xs { margin-bottom: $uni-spacing-xs; }
.mb-sm { margin-bottom: $uni-spacing-sm; }
.mb-base { margin-bottom: $uni-spacing-base; }
.mb-md { margin-bottom: $uni-spacing-md; }
.mb-lg { margin-bottom: $uni-spacing-lg; }
.mb-xl { margin-bottom: $uni-spacing-xl; }

/* ===== 全局背景样式 ===== */
.bg-white { background-color: $uni-bg-color; }
.bg-grey { background-color: $uni-bg-color-grey; }
.bg-primary { background-color: $uni-color-primary; }
.bg-success { background-color: $uni-color-success; }
.bg-warning { background-color: $uni-color-warning; }
.bg-error { background-color: $uni-color-error; }

/* ===== 全局边框样式 ===== */
.border {
  border: 2rpx solid $uni-border-color;
}

.border-t {
  border-top: 2rpx solid $uni-border-color;
}

.border-b {
  border-bottom: 2rpx solid $uni-border-color;
}

.border-l {
  border-left: 2rpx solid $uni-border-color;
}

.border-r {
  border-right: 2rpx solid $uni-border-color;
}

/* ===== 全局圆角样式 ===== */
.rounded-sm { border-radius: $uni-border-radius-sm; }
.rounded { border-radius: $uni-border-radius-base; }
.rounded-lg { border-radius: $uni-border-radius-lg; }
.rounded-xl { border-radius: $uni-border-radius-xl; }
.rounded-full { border-radius: $uni-border-radius-circle; }

/* ===== 全局阴影样式 ===== */
.shadow-sm { box-shadow: $uni-shadow-sm; }
.shadow { box-shadow: $uni-shadow-base; }
.shadow-lg { box-shadow: $uni-shadow-lg; }

/* ===== 全局按钮样式 ===== */
button {
  position: relative;
  border: none;
  padding: 0;
  margin: 0;
  background-color: transparent;
  font-size: inherit;
  line-height: inherit;
  color: inherit;
  
  &::after {
    border: none;
  }
  
  &[disabled] {
    opacity: $uni-opacity-disabled;
  }
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 $uni-spacing-lg;
  height: $uni-btn-height-base;
  font-size: $uni-font-size-xl;
  font-weight: 500;
  border-radius: $uni-border-radius-circle;
  transition: all $uni-transition-fast;
  
  &-primary {
    background-color: $uni-color-primary;
    color: #ffffff;
    
    &:active:not([disabled]) {
      opacity: 0.8;
    }
  }
  
  &-default {
    background-color: $uni-bg-color;
    color: $uni-text-color;
    border: 2rpx solid $uni-border-color;
    
    &:active:not([disabled]) {
      background-color: $uni-bg-color-hover;
    }
  }
  
  &-text {
    background-color: transparent;
    color: $uni-color-primary;
    padding: 0;
    
    &:active:not([disabled]) {
      opacity: 0.7;
    }
  }
  
  &-block {
    display: flex;
    width: 100%;
  }
  
  &-lg {
    height: $uni-btn-height-lg;
    font-size: $uni-font-size-xxl;
  }
  
  &-sm {
    height: $uni-btn-height-sm;
    font-size: $uni-font-size-base;
    padding: 0 $uni-spacing-base;
  }
}

/* ===== 全局输入框样式 ===== */
input,
textarea {
  width: 100%;
  padding: $uni-spacing-base;
  font-size: $uni-font-size-lg;
  color: $uni-text-color;
  background-color: $uni-bg-color;
  border: 2rpx solid $uni-border-color;
  border-radius: $uni-border-radius-base;
  transition: border-color $uni-transition-fast;
  
  &:focus {
    border-color: $uni-color-primary;
    outline: none;
  }
  
  &::placeholder {
    color: $uni-text-color-placeholder;
  }
  
  &[disabled] {
    background-color: $uni-bg-color-grey;
    color: $uni-text-color-disable;
  }
}

/* ===== 全局列表样式 ===== */
.list {
  background-color: $uni-bg-color;
  
  &-item {
    display: flex;
    align-items: center;
    padding: $uni-spacing-lg;
    border-bottom: 2rpx solid $uni-border-color-light;
    transition: background-color $uni-transition-fast;
    
    &:last-child {
      border-bottom: none;
    }
    
    &:active {
      background-color: $uni-bg-color-hover;
    }
  }
}

/* ===== 全局卡片样式 ===== */
.card {
  background-color: $uni-bg-color;
  border-radius: $uni-border-radius-lg;
  padding: $uni-spacing-lg;
  box-shadow: $uni-shadow-sm;
  
  &-header {
    padding-bottom: $uni-spacing-base;
    border-bottom: 2rpx solid $uni-border-color-light;
    margin-bottom: $uni-spacing-base;
  }
  
  &-title {
    font-size: $uni-font-size-xl;
    font-weight: 500;
    color: $uni-text-color;
  }
}

/* ===== 全局标签样式 ===== */
.tag {
  display: inline-flex;
  align-items: center;
  padding: $uni-spacing-xs $uni-spacing-sm;
  font-size: $uni-font-size-xs;
  border-radius: $uni-border-radius-sm;
  
  &-primary {
    background-color: rgba($uni-color-primary, 0.1);
    color: $uni-color-primary;
  }
  
  &-success {
    background-color: rgba($uni-color-success, 0.1);
    color: $uni-color-success;
  }
  
  &-warning {
    background-color: rgba($uni-color-warning, 0.1);
    color: $uni-color-warning;
  }
  
  &-error {
    background-color: rgba($uni-color-error, 0.1);
    color: $uni-color-error;
  }
}

/* ===== 全局动画 ===== */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn $uni-transition-base ease-in-out;
}

.slide-up {
  animation: slideUp $uni-transition-base ease-out;
}

/* ===== 安全区域适配 ===== */
.safe-area-inset-bottom {
  padding-bottom: $uni-safe-area-inset-bottom;
}

.safe-area-inset-top {
  padding-top: $uni-safe-area-inset-top;
}

/* ===== 响应式隐藏显示 ===== */
@media screen and (max-width: 375px) {
  .hide-xs { display: none !important; }
}

@media screen and (min-width: 768px) {
  .hide-md { display: none !important; }
  .show-md { display: block !important; }
}

/* ===== 禁用选择 ===== */
.no-select {
  -webkit-user-select: none;
  user-select: none;
}

/* ===== 单行/多行文本省略 ===== */
.ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ellipsis-2 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.ellipsis-3 {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
}

/* ===== 加载状态 ===== */
.loading {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: $uni-spacing-xl;
  color: $uni-text-color-grey;
  font-size: $uni-font-size-base;
}

/* ===== 空状态 ===== */
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: $uni-spacing-xxl;
  
  &-image {
    width: 240rpx;
    height: 240rpx;
    margin-bottom: $uni-spacing-lg;
  }
  
  &-text {
    color: $uni-text-color-grey;
    font-size: $uni-font-size-base;
  }
}

/* ===== 固定定位工具 ===== */
.fixed-bottom {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: $uni-z-index-fixed;
}

.fixed-top {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: $uni-z-index-fixed;
}

/* ===== 浮动按钮 ===== */
.fab {
  position: fixed;
  right: $uni-spacing-lg;
  bottom: calc(#{$uni-spacing-xxl} + #{$uni-safe-area-inset-bottom});
  width: 96rpx;
  height: 96rpx;
  background-color: $uni-color-primary;
  color: #ffffff;
  border-radius: $uni-border-radius-circle;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: $uni-shadow-lg;
  z-index: $uni-z-index-fixed;
  font-size: 48rpx;
  
  &:active {
    transform: scale(0.95);
  }
}
</style>
