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

export function createLocker(data) {
  return request({
    url: '/locker/create',
    method: 'post',
    data
  })
}

export function deleteLocker(data) {
  return request({
    url: '/locker/delete',
    method: 'post',
    data
  })
}

// Store APIs
export function listStore(query) {
  return request({
    url: '/store/list',
    method: 'get',
    params: query
  })
}

export function createStore(data) {
  return request({
    url: '/store/create',
    method: 'post',
    data
  })
}

export function updateStore(data) {
  return request({
    url: '/store/update',
    method: 'post',
    data
  })
}

export function deleteStore(data) {
  return request({
    url: '/store/delete',
    method: 'post',
    data
  })
}

export function detailStore(query) {
  return request({
    url: '/store/detail',
    method: 'get',
    params: query
  })
}

export function allStore() {
  return request({
    url: '/store/all',
    method: 'get'
  })
}

// Locker Operation APIs
export function listLockerOperation(query) {
  return request({
    url: '/locker/operation/list',
    method: 'get',
    params: query
  })
}

export function detailLockerOperation(id) {
  return request({
    url: '/locker/operation/detail',
    method: 'get',
    params: { id }
  })
}

export function exportLockerOperation(query) {
  return request({
    url: '/locker/operation/export',
    method: 'get',
    params: query,
    responseType: 'blob'
  })
}

export function statsLockerOperation(query) {
  return request({
    url: '/locker/operation/stats',
    method: 'get',
    params: query
  })
}
