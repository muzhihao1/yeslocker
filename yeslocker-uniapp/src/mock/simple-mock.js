// 简化的 Mock 实现，用于调试登录问题

export function simpleMock(request) {
  return function(options) {
    const { url, data } = options;
    
    console.log('[SimpleMock] 请求URL:', url);
    console.log('[SimpleMock] 请求数据:', data);
    
    // 判断是否应该启用 Mock
    const isDev = process.env.NODE_ENV === 'development';
    const shouldMock = isDev;
    
    if (!shouldMock) {
      return request(options);
    }
    
    // 处理微信登录请求
    if (url.includes('/auth/login_by_weixin') || url.includes('/wx/auth/login_by_weixin')) {
      console.log('[SimpleMock] 拦截微信登录请求，返回 Mock 数据');
      
      const code = data?.code || '';
      console.log('[SimpleMock] 登录 code:', code);
      
      // 根据不同的 code 返回不同的测试数据
      let mockUserData = {};
      
      if (code.includes('test-new-user')) {
        // 新用户
        mockUserData = {
          id: 101,
          userId: 101,
          username: 'wx_new_user_001',
          nickname: '新用户测试',
          nickName: '新用户测试',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: null,
          mobile: null,
          identityVerified: false,
          isVerified: false,
          locker_id: null,
          lockerId: null,
          storeId: null,
          realName: null,
          createTime: Date.now()
        };
      } else if (code.includes('test-verified-user')) {
        // 已认证用户
        mockUserData = {
          id: 102,
          userId: 102,
          username: 'wx_verified_user_001',
          nickname: '已认证用户',
          nickName: '已认证用户',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: '138****0001',
          mobile: '138****0001',
          identityVerified: true,
          isVerified: true,
          locker_id: 5,
          lockerId: 5,
          locker_number: 'A05',
          storeId: 1,
          realName: '张*',
          idCard: '110***********1234',
          createTime: Date.now() - 7 * 24 * 60 * 60 * 1000
        };
      } else if (code.includes('test-active-storage')) {
        // 存储中用户
        mockUserData = {
          id: 103,
          userId: 103,
          username: 'wx_active_storage_001',
          nickname: '存储中用户',
          nickName: '存储中用户',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: '138****0002',
          mobile: '138****0002',
          identityVerified: true,
          isVerified: true,
          locker_id: 10,
          lockerId: 10,
          locker_number: 'B02',
          storeId: 1,
          realName: '李*',
          hasActiveStorage: true,
          activeStorageInfo: {
            lockerId: 10,
            cabinetNumber: 'B02',
            storedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: 25,
            voucherCode: '20240117-ACTIVE-001'
          },
          createTime: Date.now() - 30 * 24 * 60 * 60 * 1000
        };
      } else if (code.includes('test-expired-storage')) {
        // 超期存储用户
        mockUserData = {
          id: 105,
          userId: 105,
          username: 'wx_expired_storage_001',
          nickname: '超期存储用户',
          nickName: '超期存储用户',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: '138****0003',
          mobile: '138****0003',
          identityVerified: true,
          isVerified: true,
          locker_id: 15,
          lockerId: 15,
          locker_number: 'C03',
          storeId: 1,
          realName: '赵*',
          hasActiveStorage: true,
          activeStorageInfo: {
            lockerId: 15,
            cabinetNumber: 'C03',
            storedAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
            daysRemaining: -5,
            voucherCode: '20240117-EXPIRED-001',
            isExpired: true
          },
          createTime: Date.now() - 60 * 24 * 60 * 60 * 1000
        };
      } else if (code.includes('test-vip-user')) {
        // VIP用户
        mockUserData = {
          id: 104,
          userId: 104,
          username: 'wx_vip_user_001',
          nickname: 'VIP会员',
          nickName: 'VIP会员',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: '138****8888',
          mobile: '138****8888',
          identityVerified: true,
          isVerified: true,
          locker_id: 20,
          lockerId: 20,
          locker_number: 'VIP-01',
          storeId: 1,
          realName: '王*',
          userLevel: 2,
          vipInfo: {
            level: 'gold',
            expireDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            privileges: ['priority_access', 'extended_storage', 'free_cleaning', 'exclusive_locker']
          },
          createTime: Date.now() - 365 * 24 * 60 * 60 * 1000
        };
      } else if (code.includes('test-admin')) {
        // 管理员
        mockUserData = {
          id: 999,
          userId: 999,
          username: 'admin',
          nickname: '系统管理员',
          nickName: '系统管理员',
          avatarUrl: '/static/default-avatar.png',
          phoneNumber: '138****9999',
          mobile: '138****9999',
          identityVerified: true,
          isVerified: true,
          locker_id: null,
          lockerId: null,
          storeId: 1,
          realName: '管理员',
          isAdmin: true,
          userLevel: 99,
          permissions: ['all'],
          createTime: Date.now() - 365 * 24 * 60 * 60 * 1000
        };
      } else {
        // 默认用户
        mockUserData = {
          id: 1,
          userId: 1,
          username: 'wx_user_' + Date.now(),
          nickname: data?.userInfo?.nickName || '微信用户',
          nickName: data?.userInfo?.nickName || '微信用户',
          avatarUrl: data?.userInfo?.avatarUrl || '/static/default-avatar.png',
          phoneNumber: null,
          mobile: null,
          identityVerified: false,
          isVerified: false,
          locker_id: null,
          lockerId: null,
          storeId: null,
          realName: null,
          createTime: Date.now()
        };
      }
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token.' + code,
              tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
              userInfo: mockUserData
            }
          });
        }, 300);
      });
    }
    
    // 处理其他认证相关请求
    if (url.includes('/auth/verify') || url.includes('/wx/auth/verify')) {
      console.log('[SimpleMock] 拦截身份验证请求');
      console.log('[SimpleMock] 验证数据:', data);
      
      // 模拟手机号验证
      const phoneNumber = data?.mobile || '';
      const isWxPhoneAuth = data?.wxPhoneAuth || false;
      
      return new Promise((resolve) => {
        setTimeout(() => {
          // 更新用户信息
          const userInfo = uni.getStorageSync('userInfo') || {};
          userInfo.mobile = phoneNumber;
          userInfo.phoneNumber = phoneNumber;
          userInfo.isVerified = true;
          userInfo.identityVerified = true;
          uni.setStorageSync('userInfo', userInfo);
          uni.setStorageSync('isVerified', true);
          
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              verified: true,
              userInfo: userInfo
            }
          });
        }, 300);
      });
    }
    
    if (url.includes('/auth/captcha') || url.includes('/wx/auth/captcha')) {
      console.log('[SimpleMock] 拦截验证码请求');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '验证码已发送',
            data: {
              success: true
            }
          });
        }, 300);
      });
    }
    
    if (url.includes('/auth/phone') || url.includes('/wx/auth/phone')) {
      console.log('[SimpleMock] 拦截获取手机号请求');
      const code = data?.code || '';
      
      // 根据code返回不同的手机号
      let phoneNumber = '13600136000';
      if (code.includes('138')) {
        phoneNumber = '13800138000';
      } else if (code.includes('139')) {
        phoneNumber = '13900139000';
      } else if (code.includes('137')) {
        phoneNumber = '13700137000';
      }
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              phoneNumber: phoneNumber,
              purePhoneNumber: phoneNumber,
              countryCode: '86'
            }
          });
        }, 200);
      });
    }
    
    if (url.includes('/user/info') || url.includes('/wx/user/info')) {
      console.log('[SimpleMock] 拦截用户信息请求');
      // 从本地存储获取用户信息
      const userInfo = uni.getStorageSync('userInfo');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: userInfo || {
              id: 1,
              nickname: '测试用户',
              avatar: '/static/default-avatar.png',
              mobile: '138****5678',
              identityVerified: true,
              hasActiveLocker: true
            }
          });
        }, 200);
      });
    }
    
    // 处理储物柜相关请求
    if (url.includes('/locker/my-locker')) {
      console.log('[SimpleMock] 拦截我的储物柜请求');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              id: 12,
              lockerNumber: 'A12',
              status: 'available',
              zone: 'A区',
              currentUserId: null
            }
          });
        }, 200);
      });
    }
    
    // 处理历史记录请求
    if (url.includes('/locker/history') || url.includes('/wx/locker/history')) {
      console.log('[SimpleMock] 拦截历史记录请求');
      const { page = 1, size = 10, type, status } = data || {};
      
      // 生成模拟历史记录数据
      const allRecords = [];
      const now = Date.now();
      
      // 生成20条模拟记录
      for (let i = 0; i < 20; i++) {
        const isStore = i % 3 !== 2; // 2/3 是存储，1/3 是取回
        const daysAgo = i * 2;
        const createTime = now - daysAgo * 24 * 60 * 60 * 1000;
        const completeTime = isStore && i % 4 === 0 ? null : createTime + 4 * 60 * 60 * 1000; // 4小时后完成
        
        const record = {
          id: 100 + i,
          operationType: isStore ? 'store' : 'retrieve',
          lockerNumber: `A${(i % 20) + 1}`,
          lockerId: (i % 20) + 1,
          voucherCode: `2025${String(1).padStart(2, '0')}${String(27 - daysAgo).padStart(2, '0')}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
          status: i === 0 ? 'active' : (i % 5 === 1 ? 'expired' : 'completed'),
          createdAt: new Date(createTime).toISOString(),
          completedAt: completeTime ? new Date(completeTime).toISOString() : null,
          notes: isStore ? ['红色球杆套', '品牌球杆', '两支球杆', ''][i % 4] : '',
          fee: i % 5 === 1 ? 10 : 0, // 超期费用
          daysUsed: completeTime ? Math.ceil((completeTime - createTime) / (24 * 60 * 60 * 1000)) : Math.ceil((now - createTime) / (24 * 60 * 60 * 1000))
        };
        
        // 根据筛选条件过滤
        if (type && record.operationType !== type) continue;
        if (status && record.status !== status) continue;
        
        allRecords.push(record);
      }
      
      // 分页处理
      const startIndex = (page - 1) * size;
      const endIndex = startIndex + size;
      const pageData = allRecords.slice(startIndex, endIndex);
      
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              list: pageData,
              pagination: {
                page: page,
                size: size,
                total: allRecords.length,
                hasMore: endIndex < allRecords.length
              }
            }
          });
        }, 300);
      });
    }
    
    if (url.includes('/locker/request/list')) {
      console.log('[SimpleMock] 拦截申请列表请求');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: {
              list: [],
              total: 0
            }
          });
        }, 200);
      });
    }
    
    if (url.includes('/locker/active-request') || url.includes('/locker/request/active')) {
      console.log('[SimpleMock] 拦截活跃申请请求');
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            errno: 0,
            errmsg: '成功',
            data: null // 没有进行中的申请
          });
        }, 200);
      });
    }
    
    // 其他请求使用原始方法
    return request(options);
  };
}