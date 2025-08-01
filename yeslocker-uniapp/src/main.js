import Vue from 'vue'
import App from './App'
import './uni.promisify.adaptor'

// Import and register global components
import LazyImage from '@/components/atoms/LazyImage.vue'
import LoadingSkeleton from '@/components/atoms/LoadingSkeleton.vue'
import NetworkError from '@/components/atoms/NetworkError.vue'
import Toast from '@/components/atoms/Toast.vue'
import LoadingOverlay from '@/components/atoms/LoadingOverlay.vue'

Vue.component('lazy-image', LazyImage)
Vue.component('loading-skeleton', LoadingSkeleton)
Vue.component('network-error', NetworkError)
Vue.component('toast', Toast)
Vue.component('loading-overlay', LoadingOverlay)

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
  ...App
})
app.$mount()
