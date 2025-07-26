import request from '@/utils/request'

export function listLocker(query) {
  return request({
    url: '/locker/list',
    method: 'get',
    params: query
  })
}

export function detailLocker(id) {
  return request({
    url: '/locker/detail',
    method: 'get',
    params: { id }
  })
}

export function updateLocker(data) {
  return request({
    url: '/locker/update',
    method: 'post',
    data
  })
}
