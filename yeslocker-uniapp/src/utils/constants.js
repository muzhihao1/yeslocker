/**
 * 常量定义
 */

// 储物柜状态
export const LOCKER_STATUS = {
  AVAILABLE: 'available',     // 可用
  OCCUPIED: 'occupied',       // 已占用
  MAINTENANCE: 'maintenance'  // 维护中
}

// 储物柜状态文本
export const LOCKER_STATUS_TEXT = {
  [LOCKER_STATUS.AVAILABLE]: '可用',
  [LOCKER_STATUS.OCCUPIED]: '已占用',
  [LOCKER_STATUS.MAINTENANCE]: '维护中'
}

// 操作类型
export const OPERATION_TYPE = {
  STORE: 'store',       // 存储
  RETRIEVE: 'retrieve'  // 取回
}

// 操作类型文本
export const OPERATION_TYPE_TEXT = {
  [OPERATION_TYPE.STORE]: '存储',
  [OPERATION_TYPE.RETRIEVE]: '取回'
}

// 凭证状态
export const VOUCHER_STATUS = {
  ACTIVE: 'active',    // 有效
  USED: 'used',        // 已使用
  EXPIRED: 'expired'   // 已过期
}

// 凭证状态文本
export const VOUCHER_STATUS_TEXT = {
  [VOUCHER_STATUS.ACTIVE]: '有效',
  [VOUCHER_STATUS.USED]: '已使用',
  [VOUCHER_STATUS.EXPIRED]: '已过期'
}

// 凭证状态颜色
export const VOUCHER_STATUS_COLOR = {
  [VOUCHER_STATUS.ACTIVE]: '#07c160',   // 绿色
  [VOUCHER_STATUS.USED]: '#999999',     // 灰色
  [VOUCHER_STATUS.EXPIRED]: '#ee0a24'   // 红色
}

// 球杆类型
export const CUE_STICK_TYPE = {
  PLAYING: 'playing_cue',     // 打杆
  BREAKING: 'breaking_cue',   // 冲杆
  JUMP: 'jump_cue'           // 跳杆
}

// 球杆类型文本
export const CUE_STICK_TYPE_TEXT = {
  [CUE_STICK_TYPE.PLAYING]: '打杆',
  [CUE_STICK_TYPE.BREAKING]: '冲杆',
  [CUE_STICK_TYPE.JUMP]: '跳杆'
}

// 价格区间
export const PRICE_RANGE = {
  ENTRY: 'entry',               // 入门级
  INTERMEDIATE: 'intermediate',  // 中级
  PROFESSIONAL: 'professional',  // 专业级
  LUXURY: 'luxury'              // 奢侈级
}

// 价格区间文本
export const PRICE_RANGE_TEXT = {
  [PRICE_RANGE.ENTRY]: '入门级 (0-1000元)',
  [PRICE_RANGE.INTERMEDIATE]: '中级 (1000-3000元)',
  [PRICE_RANGE.PROFESSIONAL]: '专业级 (3000-10000元)',
  [PRICE_RANGE.LUXURY]: '奢侈级 (10000元以上)'
}

// 商品排序方式
export const GOODS_SORT = {
  TIME: 'time',           // 时间
  PRICE_ASC: 'price_asc', // 价格升序
  PRICE_DESC: 'price_desc', // 价格降序
  SALES: 'sales'          // 销量
}

// 商品排序文本
export const GOODS_SORT_TEXT = {
  [GOODS_SORT.TIME]: '最新',
  [GOODS_SORT.PRICE_ASC]: '价格升序',
  [GOODS_SORT.PRICE_DESC]: '价格降序',
  [GOODS_SORT.SALES]: '销量'
}

// 广告位置
export const AD_POSITION = {
  HOME: 1,        // 首页
  OPERATION: 2,   // 操作页
  VOUCHER: 3,     // 凭证底部
  MARKET: 4       // 二手市场
}

// 页面路径
export const PAGES = {
  // 首页
  HOME: '/pages/home/index',
  
  // 存储流程
  STORAGE: '/pages/storage/index',
  STORAGE_VERIFY: '/pages/storage/verify',
  STORAGE_SELECT_LOCKER: '/pages/storage/select-locker',
  STORAGE_CONFIRM: '/pages/storage/confirm',
  STORAGE_VOUCHER: '/pages/storage/voucher',
  
  // 取回流程
  RETRIEVAL: '/pages/retrieval/index',
  RETRIEVAL_CONFIRM: '/pages/retrieval/confirm',
  
  // 二手市场
  MARKETPLACE: '/pages/marketplace/index',
  GOODS_DETAIL: '/pages/marketplace/detail',
  
  // 用户中心
  USER: '/pages/user/index',
  USER_HISTORY: '/pages/user/history',
  USER_PROFILE: '/pages/user/profile',
  USER_SETTINGS: '/pages/user/settings',
  
  // 登录
  LOGIN: '/pages/auth/login'
}

// 存储键名
export const STORAGE_KEYS = {
  TOKEN: 'litemall-token',
  TOKEN_EXPIRE: 'litemall-token-expire',
  USER_INFO: 'user-info',
  LAST_PHONE: 'last-phone',
  DRAFT_CUE_INFO: 'draft-cue-info'
}

// 业务配置
export const CONFIG = {
  // 凭证有效天数
  VOUCHER_VALID_DAYS: 30,
  // 清理提醒天数
  CLEAN_ALERT_DAYS: 90,
  // 每用户最大存储数
  MAX_STORE_PER_USER: 1,
  // 短信验证码有效期（秒）
  SMS_CODE_EXPIRE: 300,
  // 短信发送间隔（秒）
  SMS_SEND_INTERVAL: 60,
  // 图片大小限制（MB）
  IMAGE_SIZE_LIMIT: 5,
  // 图片数量限制
  IMAGE_COUNT_LIMIT: 9
}