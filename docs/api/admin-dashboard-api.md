# Admin Dashboard API Documentation

## Overview

The Admin Dashboard API provides comprehensive statistics and analytics data for the locker management system. All endpoints require admin authentication and appropriate permissions.

Base URL: `/admin/dashboard`

## Authentication

All endpoints require:
- Valid JWT token in the `X-Litemall-Admin-Token` header
- Appropriate permissions for each endpoint

## Endpoints

### 1. Dashboard Summary

Get overall statistics summary including today's metrics and total counts.

**Endpoint:** `GET /admin/dashboard/summary`

**Permission:** `admin:dashboard:summary`

**Response:**
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "today": {
      "newUsers": 15,
      "storeOperations": 42,
      "retrieveOperations": 38,
      "activeLockers": 156
    },
    "total": {
      "totalUsers": 1250,
      "verifiedUsers": 1180,
      "totalLockers": 300,
      "availableLockers": 144,
      "usageRate": "52.0"
    },
    "recentOperations": [
      {
        "id": 1001,
        "type": "store",
        "lockerNumber": "A001",
        "userName": "张三",
        "time": "2024-01-20T14:30:00"
      }
    ]
  }
}
```

**Cache:** 5 minutes

---

### 2. Revenue Statistics

Get revenue statistics for a specified date range. (Note: Returns mock data in MVP version)

**Endpoint:** `GET /admin/dashboard/revenue`

**Permission:** `admin:dashboard:revenue`

**Parameters:**
- `startDate` (optional): Start date in ISO format (YYYY-MM-DD)
- `endDate` (optional): End date in ISO format (YYYY-MM-DD)

If no dates provided, returns last 30 days by default.

**Response:**
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "totalRevenue": 0,
    "storageRevenue": 0,
    "overdueRevenue": 0,
    "otherRevenue": 0,
    "dailyRevenue": [
      {
        "date": "2024-01-20",
        "revenue": 0
      }
    ],
    "revenueComposition": {
      "storage": 0,
      "overdue": 0,
      "other": 0
    }
  }
}
```

**Cache:** 10 minutes

---

### 3. Usage Analytics

Get locker usage analytics including zone utilization and hourly distribution.

**Endpoint:** `GET /admin/dashboard/usage`

**Permission:** `admin:dashboard:usage`

**Parameters:**
- `period` (optional): Time period - "day", "week", or "month" (default: "week")

**Response:**
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "zoneUsage": [
      {
        "zone": "A",
        "total": 60,
        "occupied": 35,
        "available": 25,
        "usageRate": "58.3"
      }
    ],
    "hourlyDistribution": [
      {
        "hour": "09:00",
        "store": 5,
        "retrieve": 3,
        "total": 8
      }
    ],
    "durationStats": {
      "avgDuration": "2.5天",
      "minDuration": "1小时",
      "maxDuration": "30天"
    },
    "popularLockers": [
      {
        "number": "A001",
        "usageCount": 47,
        "zone": "A"
      }
    ]
  }
}
```

**Cache:** 5 minutes

---

### 4. Trend Charts Data

Get trend data for various metrics over a specified number of days.

**Endpoint:** `GET /admin/dashboard/trends`

**Permission:** `admin:dashboard:trends`

**Parameters:**
- `type` (optional): Trend type - "user", "operation", or "revenue" (default: "operation")
- `days` (optional): Number of days to include (default: 7, max: 90)

**Response:**
```json
{
  "errno": 0,
  "errmsg": "成功",
  "data": {
    "chartTitle": "存取操作趋势",
    "yAxisLabel": "操作次数",
    "period": "7天",
    "trendData": [
      {
        "date": "2024-01-14",
        "store": 38,
        "retrieve": 35,
        "total": 73
      }
    ],
    "summary": {
      "totalOperations": 511,
      "avgDailyOperations": "73.0"
    }
  }
}
```

**Cache:** 10 minutes

---

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 0 | 成功 | Success |
| 401 | 认证失败 | Authentication failed |
| 501 | 管理员未登录 | Admin not logged in |
| 502 | 管理员权限不足 | Insufficient permissions |
| 402 | 参数不对 | Invalid parameters |
| -1 | 系统内部错误 | System error |

## Usage Examples

### Example 1: Get Dashboard Summary

```bash
curl -X GET "http://localhost:8080/admin/dashboard/summary" \
  -H "X-Litemall-Admin-Token: your-jwt-token"
```

### Example 2: Get Weekly Usage Analytics

```bash
curl -X GET "http://localhost:8080/admin/dashboard/usage?period=week" \
  -H "X-Litemall-Admin-Token: your-jwt-token"
```

### Example 3: Get Operation Trends for Last 30 Days

```bash
curl -X GET "http://localhost:8080/admin/dashboard/trends?type=operation&days=30" \
  -H "X-Litemall-Admin-Token: your-jwt-token"
```

### Example 4: Get Revenue for Specific Date Range

```bash
curl -X GET "http://localhost:8080/admin/dashboard/revenue?startDate=2024-01-01&endDate=2024-01-31" \
  -H "X-Litemall-Admin-Token: your-jwt-token"
```

## Notes

1. **Caching**: All endpoints use caching to improve performance. Cache duration varies by endpoint.
2. **Time Zones**: All timestamps are in local server time zone.
3. **Permissions**: Each endpoint requires specific permissions. Ensure admin roles are properly configured.
4. **Rate Limiting**: API requests are subject to rate limiting (100 requests per minute per admin).
5. **MVP Limitations**: Revenue-related endpoints return mock data in the MVP version as payment features are not implemented.

## Performance Considerations

1. **Summary endpoint** is optimized for dashboard loading and should be called first.
2. **Trend data** for longer periods (>30 days) may take longer to process.
3. **Usage analytics** with "day" period provides the most granular data but requires more processing.
4. Consider implementing frontend caching for static dashboard widgets.