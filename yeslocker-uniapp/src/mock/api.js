// Mock API 数据 - 供前端开发使用
// 使用方法：在开发环境中拦截请求返回这些数据

const mockData = {
  // ========== 用户认证相关 ==========
  '/wx/auth/login': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 1,
        username: 'admin123',
        nickname: '管理员测试账号',
        avatar: '/static/default-avatar.png',
        mobile: '138****5678',
        identityVerified: true,
        isAdmin: true
      }
    }
  },
  
  '/wx/auth/login_by_account': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 1,
        username: 'admin123',
        nickname: '管理员测试账号',
        avatar: '/static/default-avatar.png',
        mobile: '138****5678',
        identityVerified: true,
        isAdmin: true
      }
    }
  },
  
  '/wx/auth/login_by_weixin': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock.token',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 1,
        username: 'user_mock_123',
        nickname: '测试用户',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        mobile: '138****5678',
        identityVerified: false,
        lockerId: null,
        storeId: null,
        userLevel: 0
      }
    }
  },
  
  // Mock data for different test scenarios
  '/wx/auth/login_by_weixin_new_user': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new.user',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 101,
        username: 'mock-new-user-001',
        nickname: '新用户001',
        avatar: '/static/default-avatar.png',
        mobile: null,
        identityVerified: false,
        lockerId: null,
        storeId: null,
        userLevel: 0
      }
    }
  },
  
  '/wx/auth/login_by_weixin_verified_user': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.verified.user',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 102,
        username: 'mock-verified-user-001',
        nickname: '张三（已认证）',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        mobile: '138****0001',
        identityVerified: true,
        lockerId: 5,
        storeId: 1,
        userLevel: 1,
        realName: '张*',
        idCard: '110***********1234'
      }
    }
  },
  
  '/wx/auth/login_by_weixin_active_storage': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.active.storage',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 103,
        username: 'mock-active-storage-001',
        nickname: '李四（存储中）',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        mobile: '138****0002',
        identityVerified: true,
        lockerId: 10,
        storeId: 1,
        userLevel: 1,
        hasActiveStorage: true,
        activeStorageInfo: {
          lockerId: 10,
          cabinetNumber: 'B02',
          storedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          daysRemaining: 25,
          voucherCode: '20240117-ACTIVE-001'
        }
      }
    }
  },
  
  '/wx/auth/login_by_weixin_vip_user': {
    errno: 0,
    errmsg: '成功',
    data: {
      token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.vip.user',
      tokenExpire: Date.now() + 7 * 24 * 60 * 60 * 1000,
      userInfo: {
        id: 104,
        username: 'mock-vip-user-001',
        nickname: '王总（VIP会员）',
        avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
        mobile: '138****8888',
        identityVerified: true,
        lockerId: 20,
        storeId: 1,
        userLevel: 2, // VIP level
        vipInfo: {
          level: 'gold',
          expireDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          privileges: ['priority_access', 'extended_storage', 'free_cleaning', 'exclusive_locker']
        }
      }
    }
  },

  '/wx/auth/verify': {
    errno: 0,
    errmsg: '成功',
    data: {
      verified: true
    }
  },

  '/wx/user/info': {
    errno: 0,
    errmsg: '成功',
    data: {
      id: 1,
      nickname: '测试用户',
      avatar: 'https://thirdwx.qlogo.cn/mmopen/vi_32/POgEwh4mIHO4nibH0KlMECNjjGxQUq24ZEaGT4poC6icRiccVGKSyXwibcPq4BWmiaIGuG1icwxaQX6grC9VemZoJ8rg/132',
      mobile: '138****5678',
      realName: '张*',
      identityVerified: true,
      hasActiveLocker: true,
      activeLocker: {
        lockerId: 5,
        cabinetNumber: 'A05',
        zone: 'A区',
        storedAt: '2024-01-22 10:30:00',
        daysRemaining: 28
      }
    }
  },

  // ========== 储物柜操作相关 ==========
  '/wx/locker/store': {
    errno: 0,
    errmsg: '成功',
    data: {
      operationId: 100,
      voucherCode: `${new Date().toISOString().slice(0,10).replace(/-/g,'')}-MOCK-TEST`,
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=MOCK-VOUCHER',
      lockerId: 5,
      cabinetNumber: 'A05',
      zone: 'A区',
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ')
    }
  },

  '/wx/locker/retrieve': {
    errno: 0,
    errmsg: '成功',
    data: {
      success: true,
      lockerId: 5,
      cabinetNumber: 'A05',
      zone: 'A区',
      storeName: '耶氏台球店（旗舰店）',
      storageTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      retrievedAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
      expiryTime: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
      status: 'active',
      notes: '红色球杆套，品牌：美洲豹',
      overdueFee: 0,
      warnings: []
    }
  },
  
  '/wx/voucher/list': {
    errno: 0,
    errmsg: '成功',
    data: {
      list: [
        {
          id: 1,
          code: 'ABCD1234EFGH',
          cabinetNumber: 'A12',
          lockerNumber: 'A12',
          zone: 'A区',
          storeName: '耶氏台球店（旗舰店）',
          createTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          expiryTime: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          status: 'active'
        },
        {
          id: 2,
          code: 'WXYZ5678IJKL',
          cabinetNumber: 'B03',
          lockerNumber: 'B03',
          zone: 'B区',
          storeName: '耶氏台球店（旗舰店）',
          createTime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          expiryTime: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' '),
          status: 'active'
        }
      ],
      totalCount: 2,
      page: 1,
      limit: 10
    }
  },

  '/wx/locker/status': {
    errno: 0,
    errmsg: '成功',
    data: {
      hasActiveStorage: true,
      activeStorage: {
        operationId: 100,
        lockerId: 5,
        cabinetNumber: 'A05',
        zone: 'A区',
        storedAt: '2024-01-22 10:30:00',
        expiredAt: '2024-02-21 10:30:00',
        voucherCode: '20240122-MOCK-TEST',
        daysRemaining: 29,
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=20240122-MOCK-TEST'
      }
    }
  },

  '/wx/locker/available': {
    errno: 0,
    errmsg: '成功',
    data: {
      total: 15,
      lockers: [
        { id: 1, cabinetNumber: 'A01', zone: 'A区', status: 'available', notes: '标准储物柜' },
        { id: 2, cabinetNumber: 'A02', zone: 'A区', status: 'available', notes: '标准储物柜' },
        { id: 3, cabinetNumber: 'A03', zone: 'A区', status: 'available', notes: '标准储物柜' },
        { id: 4, cabinetNumber: 'A04', zone: 'A区', status: 'available', notes: '标准储物柜' },
        { id: 5, cabinetNumber: 'A05', zone: 'A区', status: 'available', notes: '标准储物柜' },
        { id: 11, cabinetNumber: 'B01', zone: 'B区', status: 'available', notes: '大型储物柜' },
        { id: 12, cabinetNumber: 'B02', zone: 'B区', status: 'available', notes: '大型储物柜' },
        { id: 13, cabinetNumber: 'B03', zone: 'B区', status: 'available', notes: '大型储物柜' }
      ]
    }
  },

  '/wx/locker/history': {
    errno: 0,
    errmsg: '成功',
    data: {
      total: 25,
      page: 1,
      limit: 10,
      list: [
        {
          id: 100,
          type: 'store',
          cabinetNumber: 'A05',
          zone: 'A区',
          operatedAt: '2024-01-22 10:30:00',
          status: 'active',
          voucherCode: '20240122-MOCK-TEST'
        },
        {
          id: 99,
          type: 'retrieve',
          cabinetNumber: 'B03',
          zone: 'B区',
          operatedAt: '2024-01-20 15:20:00',
          status: 'used'
        },
        {
          id: 98,
          type: 'store',
          cabinetNumber: 'A02',
          zone: 'A区',
          operatedAt: '2024-01-15 09:15:00',
          status: 'expired'
        },
        {
          id: 97,
          type: 'retrieve',
          cabinetNumber: 'A02',
          zone: 'A区',
          operatedAt: '2024-01-15 18:30:00',
          status: 'used'
        }
      ]
    }
  },

  // ========== 凭证相关 ==========
  '/wx/voucher/20240122-MOCK-TEST': {
    errno: 0,
    errmsg: '成功',
    data: {
      code: '20240122-MOCK-TEST',
      status: 'active',
      lockerId: 5,
      cabinetNumber: 'A05',
      zone: 'A区',
      createdAt: '2024-01-22 10:30:00',
      expiredAt: '2024-02-21 10:30:00',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=20240122-MOCK-TEST',
      isOwner: true
    }
  },

  '/wx/voucher/validate': {
    errno: 0,
    errmsg: '成功',
    data: {
      valid: true,
      isOwner: true,
      message: '凭证有效，可以取回球杆'
    }
  },

  // ========== 广告相关 ==========
  '/wx/ad/list?position=1': {
    errno: 0,
    errmsg: '成功',
    data: [
      {
        id: 1,
        title: '专业球杆保养服务',
        imageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
        linkUrl: 'https://example.com/service',
        position: 1
      },
      {
        id: 2,
        title: '新品球杆8折优惠',
        imageUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
        linkUrl: 'https://example.com/promotion',
        position: 1
      }
    ]
  },

  // ========== 二手市场 ==========
  '/wx/goods/list': {
    errno: 0,
    errmsg: '成功',
    data: {
      total: 50,
      page: 1,
      limit: 10,
      list: [
        {
          id: 1001,
          name: 'Predator 314-3 九成新',
          brief: '用了半年，成色很好，无磕碰',
          picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          price: 3500.00,
          originalPrice: 5800.00,
          isHot: true,
          isNew: false
        },
        {
          id: 1002,
          name: 'Mezz EC7 专业打杆',
          brief: '日本进口，保养良好',
          picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          price: 4200.00,
          originalPrice: 6800.00,
          isHot: true,
          isNew: false
        },
        {
          id: 1003,
          name: 'OB-122 冲杆',
          brief: '全新未使用，原装配件齐全',
          picUrl: 'https://img.yzcdn.cn/vant/cat.jpeg',
          price: 1800.00,
          originalPrice: 2200.00,
          isHot: false,
          isNew: true
        }
      ]
    }
  }
};

// Mock 请求拦截器
export function setupMock(request) {
  // 开发环境为登录接口启用 Mock（后端未就绪时使用）
  if (process.env.NODE_ENV === 'development') {
    const originalRequest = request;
    
    return function(options) {
      const { url } = options;
      
      // 调试信息
      console.log('[Mock] 拦截到请求:', url);
      
      // 为登录接口启用 Mock
      const mockKey = Object.keys(mockData).find(key => url.includes(key));
      console.log('[Mock] 找到的 mockKey:', mockKey);
      
      // 专门为登录接口处理
      if (url.includes('/auth/login') || url.includes('login_by_account') || url.includes('login_by_weixin')) {
        console.log('[Mock] 匹配到登录接口，使用 Mock 数据');
        console.log('[Mock] 登录请求数据:', options.data);
        
        // 处理微信登录的不同测试场景
        if (url.includes('login_by_weixin') && options.data && options.data.code) {
          const { code } = options.data;
          let mockKey = '/wx/auth/login_by_weixin'; // 默认
          
          // 根据不同的 code 选择不同的 Mock 数据
          if (code.startsWith('test-new-user')) {
            mockKey = '/wx/auth/login_by_weixin_new_user';
          } else if (code.startsWith('test-verified-user')) {
            mockKey = '/wx/auth/login_by_weixin_verified_user';
          } else if (code.startsWith('test-active-storage')) {
            mockKey = '/wx/auth/login_by_weixin_active_storage';
          } else if (code.startsWith('test-vip-user')) {
            mockKey = '/wx/auth/login_by_weixin_vip_user';
          }
          
          console.log(`[Mock] 使用测试场景: ${mockKey}`);
          
          return new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                statusCode: 200,
                data: mockData[mockKey]
              });
            }, 500);
          });
        }
        
        // 找到对应的 Mock 数据
        const responseMockKey = mockKey || '/wx/auth/login';
        
        // 延迟返回，模拟网络请求
        return new Promise((resolve) => {
          setTimeout(() => {
            // 根据不同的用户名返回不同的 Mock 数据
            const { username } = options.data || {};
            let mockResponse = mockData[responseMockKey];
            
            // 支持多个测试账号
            if (username === 'user123') {
              mockResponse = {
                ...mockResponse,
                data: {
                  ...mockResponse.data,
                  userInfo: {
                    ...mockResponse.data.userInfo,
                    username: 'user123',
                    nickname: '普通用户测试账号',
                    isAdmin: false
                  }
                }
              };
            } else if (username === 'locker_admin') {
              mockResponse = {
                ...mockResponse,
                data: {
                  ...mockResponse.data,
                  userInfo: {
                    ...mockResponse.data.userInfo,
                    username: 'locker_admin',
                    nickname: '储物柜管理员',
                    isLockerAdmin: true
                  }
                }
              };
            }
            
            console.log('[Mock] 返回的 Mock 数据:', mockResponse);
            
            // 返回完整的响应对象，包含 statusCode 和 data
            resolve({
              statusCode: 200,
              data: mockResponse
            });
          }, 500);
        });
      }
      
      // 其他请求使用原始请求
      return originalRequest(options);
    };
  }
  
  return request;
}

// 导出 Mock 数据供其他模块使用
export default mockData;