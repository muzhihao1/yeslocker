# API实现检查清单

## 🎯 核心API列表（按优先级排序）

### 第一优先级：用户基础功能
| API端点 | 方法 | 功能描述 | 状态 | 负责人 | 测试状态 |
|---------|------|----------|------|--------|----------|
| `/api/user/wx-login` | POST | 微信登录 | [ ] | - | [ ] |
| `/api/user/register` | POST | 用户注册+柜位分配 | [ ] | - | [ ] |
| `/api/user/profile` | GET | 获取用户信息 | [ ] | - | [ ] |
| `/api/lockers/available` | GET | 获取可用柜位列表 | [ ] | - | [ ] |

### 第二优先级：请求管理
| API端点 | 方法 | 功能描述 | 状态 | 负责人 | 测试状态 |
|---------|------|----------|------|--------|----------|
| `/api/requests/create` | POST | 创建存取请求 | [ ] | - | [ ] |
| `/api/requests/:requestId` | GET | 获取请求详情 | [ ] | - | [ ] |
| `/api/requests/active` | GET | 获取用户活跃请求 | [ ] | - | [ ] |
| `/api/users/:userId/history` | GET | 用户操作历史 | [ ] | - | [ ] |

### 第三优先级：员工操作
| API端点 | 方法 | 功能描述 | 状态 | 负责人 | 测试状态 |
|---------|------|----------|------|--------|----------|
| `/api/staff/login` | POST | 员工登录 | [ ] | - | [ ] |
| `/api/staff/verify-request` | POST | 验证用户请求 | [ ] | - | [ ] |
| `/api/staff/pending-requests` | GET | 待处理请求列表 | [ ] | - | [ ] |
| `/api/staff/complete-operation` | POST | 完成操作记录 | [ ] | - | [ ] |

### 第四优先级：管理功能
| API端点 | 方法 | 功能描述 | 状态 | 负责人 | 测试状态 |
|---------|------|----------|------|--------|----------|
| `/api/admin/dashboard` | GET | 管理面板数据 | [ ] | - | [ ] |
| `/api/admin/reports/daily` | GET | 日报表 | [ ] | - | [ ] |
| `/api/admin/lockers/manage` | POST | 柜位管理 | [ ] | - | [ ] |
| `/api/admin/alerts/config` | GET/POST | 告警配置 | [ ] | - | [ ] |

## 📝 API实现模板

### 控制器模板
```java
@RestController
@RequestMapping("/wx/locker")
public class WxLockerController {
    
    @Autowired
    private LockerService lockerService;
    
    @Autowired
    private RequestService requestService;
    
    /**
     * 创建存取请求
     */
    @PostMapping("/request/create")
    public Object createRequest(@LoginUser Integer userId, @RequestBody RequestCreateVO request) {
        // 1. 参数验证
        if (userId == null) {
            return ResponseUtil.unlogin();
        }
        
        // 2. 业务逻辑
        try {
            RequestDTO result = requestService.createRequest(userId, request);
            return ResponseUtil.ok(result);
        } catch (BusinessException e) {
            return ResponseUtil.fail(e.getCode(), e.getMessage());
        }
    }
}
```

### 服务层模板
```java
@Service
public class RequestService {
    
    @Autowired
    private RequestMapper requestMapper;
    
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;
    
    @Transactional
    public RequestDTO createRequest(Integer userId, RequestCreateVO request) {
        // 1. 前置检查
        checkUserStatus(userId);
        checkActiveRequest(userId);
        
        // 2. 生成请求
        String requestId = generateRequestId();
        String requestCode = generateRequestCode(request.getType(), request.getLockerId());
        
        // 3. 创建记录
        Request entity = new Request();
        entity.setId(requestId);
        entity.setUserId(userId);
        entity.setRequestType(request.getType());
        entity.setRequestCode(requestCode);
        entity.setStatus("pending");
        entity.setExpiresAt(LocalDateTime.now().plusHours(2));
        
        requestMapper.insert(entity);
        
        // 4. 缓存处理
        cacheActiveRequest(requestId, entity);
        
        // 5. 返回结果
        return convertToDTO(entity);
    }
}
```

## 🧪 测试用例模板

### 单元测试
```java
@SpringBootTest
@RunWith(SpringRunner.class)
public class RequestServiceTest {
    
    @Autowired
    private RequestService requestService;
    
    @MockBean
    private RequestMapper requestMapper;
    
    @Test
    public void testCreateRequest_Success() {
        // Given
        Integer userId = 123;
        RequestCreateVO request = new RequestCreateVO();
        request.setType("store");
        request.setLockerId("A12");
        
        // When
        RequestDTO result = requestService.createRequest(userId, request);
        
        // Then
        assertNotNull(result);
        assertEquals("pending", result.getStatus());
        assertNotNull(result.getRequestCode());
    }
    
    @Test(expected = BusinessException.class)
    public void testCreateRequest_UserHasActiveRequest() {
        // Test duplicate request scenario
    }
}
```

### API集成测试
```java
@Test
public void testRequestFlow() throws Exception {
    // 1. 创建请求
    mockMvc.perform(post("/wx/locker/request/create")
            .header("X-Token", userToken)
            .contentType(MediaType.APPLICATION_JSON)
            .content("{\"type\":\"store\",\"lockerId\":\"A12\"}"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.errno").value(0))
            .andExpect(jsonPath("$.data.requestCode").exists());
}
```

## 🔍 代码审查要点

### 安全性检查
- [ ] 用户身份验证
- [ ] 权限校验
- [ ] 输入参数验证
- [ ] SQL注入防护
- [ ] XSS防护

### 性能检查
- [ ] 数据库查询优化
- [ ] 缓存使用合理
- [ ] 避免N+1查询
- [ ] 批量操作优化
- [ ] 异步处理适当

### 代码质量
- [ ] 命名规范一致
- [ ] 注释完整清晰
- [ ] 错误处理完善
- [ ] 日志记录充分
- [ ] 代码可测试性

## 📊 进度跟踪

### 每日更新模板
```markdown
## 2024-01-XX 进度更新

### 已完成API
- [x] /api/user/register - 用户注册功能
- [x] /api/lockers/available - 柜位查询功能

### 进行中
- [ ] /api/requests/create - 完成70%，待测试

### 遇到的问题
1. Redis连接池配置问题 - 已解决
2. 请求码生成重复 - 改用UUID方案

### 明日计划
- 完成请求管理所有API
- 开始员工端API开发
```

## 🚀 快速测试命令

```bash
# 测试用户注册
curl -X POST http://localhost:8080/wx/user/register \
  -H "Content-Type: application/json" \
  -d '{"openId":"test123","nickName":"测试用户","selectedLockerId":"A12"}'

# 测试创建请求
curl -X POST http://localhost:8080/wx/locker/request/create \
  -H "X-Token: your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"type":"store","lockerId":"A12"}'

# 测试员工验证
curl -X POST http://localhost:8080/staff/verify-request \
  -H "Staff-Token: staff-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"requestCode":"ST-A12-0115"}'
```

---

*保持代码质量，确保测试覆盖，及时更新进度！*