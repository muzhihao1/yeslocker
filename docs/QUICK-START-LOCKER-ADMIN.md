# 储物柜管理功能快速开始指南

## 立即开始 - 第一个功能实现

### Step 1: 创建开发分支
```bash
cd /Users/liasiloam/项目开发/杆柜管理/yeslocker
git checkout -b feature/locker-admin
```

### Step 2: 生成MyBatis代码
在 `litemall-db/src/main/java/org/linlinjava/litemall/db/dao/` 创建：

**LitemallLockerMapper.java**
```java
package org.linlinjava.litemall.db.dao;

import org.apache.ibatis.annotations.Param;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerExample;
import java.util.List;

public interface LitemallLockerMapper {
    long countByExample(LitemallLockerExample example);
    int deleteByExample(LitemallLockerExample example);
    int deleteByPrimaryKey(Integer id);
    int insert(LitemallLocker record);
    int insertSelective(LitemallLocker record);
    List<LitemallLocker> selectByExample(LitemallLockerExample example);
    LitemallLocker selectByPrimaryKey(Integer id);
    int updateByExampleSelective(@Param("record") LitemallLocker record, @Param("example") LitemallLockerExample example);
    int updateByExample(@Param("record") LitemallLocker record, @Param("example") LitemallLockerExample example);
    int updateByPrimaryKeySelective(LitemallLocker record);
    int updateByPrimaryKey(LitemallLocker record);
}
```

### Step 3: 创建第一个Service
在 `litemall-db/src/main/java/org/linlinjava/litemall/db/service/` 创建：

**LitemallLockerService.java**
```java
package org.linlinjava.litemall.db.service;

import com.github.pagehelper.PageHelper;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.linlinjava.litemall.db.dao.LitemallLockerMapper;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.domain.LitemallLockerExample;
import javax.annotation.Resource;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LitemallLockerService {
    @Resource
    private LitemallLockerMapper lockerMapper;

    public List<LitemallLocker> querySelective(String cabinetNumber, String zone, 
                                               String status, Integer page, 
                                               Integer limit, String sort, String order) {
        LitemallLockerExample example = new LitemallLockerExample();
        LitemallLockerExample.Criteria criteria = example.createCriteria();

        if (!StringUtils.isEmpty(cabinetNumber)) {
            criteria.andCabinetNumberLike("%" + cabinetNumber + "%");
        }
        if (!StringUtils.isEmpty(zone)) {
            criteria.andZoneEqualTo(zone);
        }
        if (!StringUtils.isEmpty(status)) {
            criteria.andStatusEqualTo(status);
        }
        criteria.andDeletedEqualTo(false);

        if (!StringUtils.isEmpty(sort) && !StringUtils.isEmpty(order)) {
            example.setOrderByClause(sort + " " + order);
        }

        PageHelper.startPage(page, limit);
        return lockerMapper.selectByExample(example);
    }

    public int updateById(LitemallLocker locker) {
        locker.setUpdateTime(LocalDateTime.now());
        return lockerMapper.updateByPrimaryKeySelective(locker);
    }

    public LitemallLocker findById(Integer id) {
        return lockerMapper.selectByPrimaryKey(id);
    }
}
```

### Step 4: 创建第一个Controller
在 `litemall-admin-api/src/main/java/org/linlinjava/litemall/admin/web/` 创建：

**AdminLockerController.java**
```java
package org.linlinjava.litemall.admin.web;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.shiro.authz.annotation.RequiresPermissions;
import org.linlinjava.litemall.admin.annotation.RequiresPermissionsDesc;
import org.linlinjava.litemall.core.util.ResponseUtil;
import org.linlinjava.litemall.core.validator.Order;
import org.linlinjava.litemall.core.validator.Sort;
import org.linlinjava.litemall.db.domain.LitemallLocker;
import org.linlinjava.litemall.db.service.LitemallLockerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import java.util.List;

@RestController
@RequestMapping("/admin/locker")
@Validated
public class AdminLockerController {
    private final Log logger = LogFactory.getLog(AdminLockerController.class);

    @Autowired
    private LitemallLockerService lockerService;

    @RequiresPermissions("admin:locker:list")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "查询")
    @GetMapping("/list")
    public Object list(String cabinetNumber, String zone, String status,
                       @RequestParam(defaultValue = "1") Integer page,
                       @RequestParam(defaultValue = "10") Integer limit,
                       @Sort @RequestParam(defaultValue = "add_time") String sort,
                       @Order @RequestParam(defaultValue = "desc") String order) {
        List<LitemallLocker> lockerList = lockerService.querySelective(
            cabinetNumber, zone, status, page, limit, sort, order);
        return ResponseUtil.okList(lockerList);
    }

    @RequiresPermissions("admin:locker:read")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "详情")
    @GetMapping("/detail")
    public Object detail(@NotNull Integer id) {
        LitemallLocker locker = lockerService.findById(id);
        return ResponseUtil.ok(locker);
    }

    @RequiresPermissions("admin:locker:update")
    @RequiresPermissionsDesc(menu = {"储物柜管理", "储物柜列表"}, button = "编辑")
    @PostMapping("/update")
    public Object update(@RequestBody LitemallLocker locker) {
        if (locker.getId() == null) {
            return ResponseUtil.badArgument();
        }
        
        if (lockerService.updateById(locker) == 0) {
            return ResponseUtil.updatedDataFailed();
        }
        return ResponseUtil.ok();
    }
}
```

### Step 5: 添加前端路由
在 `litemall-admin/src/router/index.js` 中添加：

```javascript
{
  path: '/locker',
  component: Layout,
  redirect: 'noredirect',
  alwaysShow: true,
  name: 'lockerManage',
  meta: {
    title: '储物柜管理',
    icon: 'chart'
  },
  children: [
    {
      path: 'list',
      component: () => import('@/views/locker/list'),
      name: 'lockerList',
      meta: {
        title: '储物柜列表',
        noCache: true
      }
    },
    {
      path: 'operation',
      component: () => import('@/views/locker/operation'),
      name: 'operationList',
      meta: {
        title: '操作记录',
        noCache: true
      }
    }
  ]
}
```

### Step 6: 创建第一个Vue页面
创建 `litemall-admin/src/views/locker/list.vue`：

```vue
<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="filter-container">
      <el-input v-model="listQuery.cabinetNumber" clearable class="filter-item" style="width: 200px;" placeholder="请输入柜号"/>
      <el-select v-model="listQuery.zone" clearable style="width: 120px" class="filter-item" placeholder="请选择区域">
        <el-option v-for="item in zoneOptions" :key="item" :label="item" :value="item"/>
      </el-select>
      <el-select v-model="listQuery.status" clearable style="width: 120px" class="filter-item" placeholder="请选择状态">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value"/>
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <!-- 数据列表 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="60"/>
      <el-table-column align="center" label="柜号" prop="cabinetNumber" width="100"/>
      <el-table-column align="center" label="区域" prop="zone" width="80"/>
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="当前使用者" prop="currentUserId" width="120"/>
      <el-table-column align="center" label="最后使用时间" prop="lastUsedTime" width="160"/>
      <el-table-column align="center" label="备注" prop="remarks"/>
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="info" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList"/>
  </div>
</template>

<script>
import { listLocker } from '@/api/locker'
import Pagination from '@/components/Pagination'

export default {
  name: 'LockerList',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        cabinetNumber: undefined,
        zone: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      zoneOptions: ['A区', 'B区', 'C区'],
      statusOptions: [
        { label: '可用', value: 'available' },
        { label: '占用', value: 'occupied' },
        { label: '维护', value: 'maintenance' }
      ]
    }
  },
  created() {
    this.getList()
  },
  methods: {
    getList() {
      this.listLoading = true
      listLocker(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
    },
    statusText(status) {
      const statusMap = {
        'available': '可用',
        'occupied': '占用',
        'maintenance': '维护'
      }
      return statusMap[status] || status
    },
    statusTagType(status) {
      const statusMap = {
        'available': 'success',
        'occupied': 'warning',
        'maintenance': 'danger'
      }
      return statusMap[status] || 'info'
    },
    handleDetail(row) {
      this.$message('开发中...')
    },
    handleUpdate(row) {
      this.$message('开发中...')
    }
  }
}
</script>
```

### Step 7: 创建API接口
创建 `litemall-admin/src/api/locker.js`：

```javascript
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
```

### Step 8: 添加权限配置
在数据库中执行：

```sql
-- 添加储物柜管理权限
INSERT INTO litemall_permission (role_id, permission, add_time, update_time, deleted)
VALUES 
(1, 'admin:locker:list', NOW(), NOW(), 0),
(1, 'admin:locker:read', NOW(), NOW(), 0),
(1, 'admin:locker:update', NOW(), NOW(), 0);
```

### 测试第一个功能

1. **重启后端服务**
```bash
# 重新编译
mvn clean package -DskipTests

# 重启服务
java -jar litemall-all/target/litemall-all-*-exec.jar --spring.profiles.active=dev
```

2. **重新构建前端**
```bash
cd litemall-admin
npm run build:dep
```

3. **访问测试**
- 访问 http://localhost:8090
- 使用 admin123/admin123 登录
- 查看左侧菜单是否出现"储物柜管理"

## 后续任务

完成第一个功能后，按照开发计划继续实现：
1. 储物柜详情弹窗
2. 储物柜状态修改功能
3. 操作记录查询页面
4. 数据导出功能
5. 统计分析图表

---

**提示**: 每完成一个功能，记得更新TodoList并提交代码！