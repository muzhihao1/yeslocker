# Admin Locker Batch Update API

## Endpoint

`POST /admin/locker/batch-update`

## Description

批量更新储物柜信息。支持批量修改储物柜状态、区域、备注等信息。此API支持事务性操作，会返回每个储物柜的更新结果。

## Authentication

需要管理员权限认证。使用 `X-Litemall-Admin-Token` header 传递认证令牌。

## Permissions

- 需要权限: `admin:locker:batch`
- 权限描述: 储物柜管理 > 储物柜列表 > 批量更新

## Request

### Headers

```
Content-Type: application/json
X-Litemall-Admin-Token: {admin-token}
```

### Request Body

```json
{
  "ids": [1, 2, 3],           // 必填：要更新的储物柜ID列表，最多100个
  "status": "maintenance",     // 可选：状态 (available, occupied, maintenance, disabled)
  "zone": "A",                // 可选：区域
  "notes": "批量维护"          // 可选：备注
}
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| ids | Array<Integer> | Yes | 储物柜ID列表，最少1个，最多100个 |
| status | String | No | 储物柜状态，可选值：available(可用), occupied(占用), maintenance(维护中), disabled(禁用) |
| zone | String | No | 储物柜所属区域 |
| notes | String | No | 备注信息 |

### Status Transition Rules

状态转换规则如下：

- **available** (可用) → occupied, maintenance, disabled
- **occupied** (占用) → available, maintenance
- **maintenance** (维护中) → available, disabled
- **disabled** (禁用) → available, maintenance

## Response

### Success Response

```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "total": 3,                    // 总处理数量
    "successCount": 2,             // 成功数量
    "failedCount": 1,              // 失败数量
    "successIds": [1, 2],          // 成功更新的ID列表
    "failedIds": {                 // 失败的ID及原因
      "3": "无效的状态转换: occupied -> disabled"
    }
  }
}
```

### Error Responses

#### 参数错误
```json
{
  "errno": 401,
  "errmsg": "请选择要更新的储物柜"
}
```

#### 无效状态
```json
{
  "errno": 401,
  "errmsg": "无效的状态值: invalid_status"
}
```

#### 权限不足
```json
{
  "errno": 403,
  "errmsg": "无权操作储物柜ID: 123"
}
```

## Examples

### Example 1: 批量设置维护状态

```bash
curl -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: your-admin-token" \
  -d '{
    "ids": [1, 2, 3, 4, 5],
    "status": "maintenance",
    "notes": "定期维护，预计2天完成"
  }'
```

### Example 2: 批量更新区域

```bash
curl -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: your-admin-token" \
  -d '{
    "ids": [10, 11, 12],
    "zone": "B区"
  }'
```

### Example 3: 批量恢复可用状态

```bash
curl -X POST http://localhost:8083/admin/locker/batch-update \
  -H "Content-Type: application/json" \
  -H "X-Litemall-Admin-Token: your-admin-token" \
  -d '{
    "ids": [1, 2, 3, 4, 5],
    "status": "available",
    "notes": ""
  }'
```

## Implementation Notes

1. **事务处理**: 每个储物柜的更新是独立的，不会因为一个失败而影响其他的更新。
2. **状态验证**: 系统会验证每个状态转换的合法性，不合法的转换会被拒绝。
3. **权限检查**: 对于门店管理员，只能更新其所属门店的储物柜。
4. **日志记录**: 所有批量操作都会记录在系统日志中。
5. **性能考虑**: 限制单次最多更新100个储物柜，避免长时间占用数据库连接。

## Error Codes

- `401`: 参数错误或验证失败
- `403`: 权限不足
- `500`: 服务器内部错误