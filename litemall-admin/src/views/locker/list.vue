<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="filter-container">
      <el-input v-model="listQuery.cabinetNumber" clearable class="filter-item" style="width: 200px;" placeholder="请输入柜号" />
      <el-select v-model="listQuery.zone" clearable style="width: 120px" class="filter-item" placeholder="请选择区域">
        <el-option v-for="item in zoneOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.status" clearable style="width: 120px" class="filter-item" placeholder="请选择状态">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
    </div>

    <!-- 数据列表 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="60" />
      <el-table-column align="center" label="柜号" prop="cabinetNumber" width="100" />
      <el-table-column align="center" label="区域" prop="zone" width="80" />
      <el-table-column align="center" label="状态" prop="status" width="100">
        <template slot-scope="scope">
          <el-tag :type="statusTagType(scope.row.status)">
            {{ statusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="当前使用者" prop="currentUserId" width="120" />
      <el-table-column align="center" label="最后使用时间" prop="lastUsedTime" width="160" />
      <el-table-column align="center" label="备注" prop="remarks" />
      <el-table-column align="center" label="操作" width="200" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button type="info" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />
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
