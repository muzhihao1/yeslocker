// 统一的模拟数据，确保各页面数据一致
export const mockRequests = [
  {
    id: 3,
    code: 'REQ20240122003',
    type: 'store',
    status: 'active',
    lockerNumber: 'A12',
    createTime: new Date(2025, 6, 26, 14, 42).getTime(), // 2025-07-26 14:42
    completeTime: null
  },
  {
    id: 2,
    code: 'REQ20240121002',
    type: 'retrieve',
    status: 'completed',
    lockerNumber: 'A12',
    createTime: new Date(2025, 6, 24, 15, 12).getTime(), // 2025-07-24 15:12
    completeTime: new Date(2025, 6, 24, 15, 57).getTime() // 2025-07-24 15:57
  },
  {
    id: 1,
    code: 'REQ20240122001',
    type: 'store',
    status: 'completed',
    lockerNumber: 'A12',
    createTime: new Date(2025, 6, 23, 15, 12).getTime(), // 2025-07-23 15:12
    completeTime: new Date(2025, 6, 23, 15, 42).getTime() // 2025-07-23 15:42
  }
]

// 获取最近的请求（用于首页和储物柜详情页）
export function getRecentRequests(limit = 3) {
  return mockRequests.slice(0, limit)
}

// 获取当前活跃的请求
export function getActiveRequest() {
  return mockRequests.find(req => req.status === 'active')
}

// 根据类型筛选请求
export function getRequestsByType(type) {
  if (type === 'all') return mockRequests
  return mockRequests.filter(req => req.type === type)
}