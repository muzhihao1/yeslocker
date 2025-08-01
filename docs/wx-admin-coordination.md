# 微信小程序端与管理后台开发协调文档

更新时间：2025-07-26

## 工作分工明确

### 微信小程序端（已完成）
- **负责人**：当前终端
- **API路径**：`/wx/locker/*`
- **目标用户**：普通用户
- **已完成内容**：
  - ✅ StorageRequest实体和Mapper
  - ✅ StorageRequestService服务类
  - ✅ WxLockerController新流程API
  - ✅ 用户端的申请制流程

### 管理后台端（进行中）
- **负责人**：另一个终端
- **API路径**：`/admin/locker/*`
- **目标用户**：管理员/员工
- **计划内容**：
  - 储物柜CRUD管理
  - 操作记录查询
  - 管理界面开发

## 无冲突确认 ✅

1. **API路径完全分离**
   - 小程序端：`/wx/locker/request/*`
   - 管理端：`/admin/locker/*`

2. **Controller完全独立**
   - 小程序端：`WxLockerController`
   - 管理端：`LockerController`（新建）

3. **功能互补**
   - 小程序端：用户申请、查询、确认
   - 管理端：储物柜管理、记录查看、数据导出

## 共享资源协调

### 1. 数据库表
**已创建的表（小程序端）**：
- `litemall_storage_request` - 申请记录表
- `litemall_staff_log` - 员工操作日志表

**管理端需要注意**：
- 可以直接使用这些表进行查询和管理
- 不需要重复创建

### 2. 实体类
**已创建的实体（小程序端）**：
- `LitemallStorageRequest`
- `LitemallStorageRequestMapper`
- `LitemallStorageRequestService`

**管理端可以**：
- 直接复用这些实体和服务
- 在Service中添加管理员专用方法

### 3. 数据库迁移
**注意事项**：
- 先执行`locker-new-flow.sql`（小程序端的迁移）
- 管理端如有额外表结构需求，创建新的迁移文件

## 建议的协作点

### 1. StorageRequest管理
管理后台可能需要：
```java
// 在LitemallStorageRequestService中添加
public List<LitemallStorageRequest> queryAll(String status, Integer page, Integer limit);
public boolean forceComplete(Integer requestId, Integer adminId);
public Map<String, Object> statistics();
```

### 2. 权限控制
- 小程序端：`@LoginUser`注解（普通用户）
- 管理端：`@RequiresPermissions`注解（管理员）

### 3. 操作日志
建议管理端在处理申请时，也记录到`litemall_staff_log`表：
```java
// 员工确认操作
staffLogService.log(staffId, requestId, "confirm_storage", userId, lockerId);
```

## 开发顺序建议

1. **立即可并行**：
   - 管理端开发储物柜列表页面
   - 小程序端进行前端API对接

2. **需要先后顺序**：
   - 先：执行数据库迁移（locker-new-flow.sql）
   - 后：管理端开发申请管理功能

3. **完全独立**：
   - 管理端的储物柜CRUD
   - 管理端的界面开发

## 测试建议

1. **集成测试时**：
   - 小程序端创建申请
   - 管理端查看和管理申请
   - 验证数据一致性

2. **避免冲突**：
   - 使用不同的测试用户
   - 使用不同的储物柜编号

## 代码合并策略

1. 各自在独立分支开发
2. 小程序端：`feature/wx-new-flow`
3. 管理端：`yeshi-locker-admin`
4. 完成后分别合并到主分支

---

**总结**：两边的工作基本无冲突，可以并行开发。主要协调点在于共享的数据模型和数据库表。