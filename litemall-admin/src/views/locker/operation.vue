<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="filter-container">
      <el-date-picker
        v-model="listQuery.dateRange"
        type="datetimerange"
        value-format="yyyy-MM-dd HH:mm:ss"
        class="filter-item"
        style="width: 360px"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        :picker-options="pickerOptions"
      />
      <el-input v-model="listQuery.lockerNumber" clearable style="width: 160px" class="filter-item" placeholder="请输入柜号" />
      <el-input v-model="listQuery.userName" clearable style="width: 160px" class="filter-item" placeholder="请输入用户姓名" />
      <el-input v-model="listQuery.userPhone" clearable style="width: 160px" class="filter-item" placeholder="请输入用户手机号" />
      <el-select v-model="listQuery.operationType" clearable style="width: 130px" class="filter-item" placeholder="操作类型">
        <el-option v-for="item in operationTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-select v-model="listQuery.storeId" clearable style="width: 160px" class="filter-item" placeholder="请选择门店">
        <el-option v-for="store in storeOptions" :key="store.id" :label="store.name" :value="store.id" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button class="filter-item" type="success" icon="el-icon-download" @click="handleExport">导出</el-button>
    </div>

    <!-- 统计信息 -->
    <div v-if="statsData" class="stats-container">
      <el-row :gutter="20">
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">总操作次数</div>
            <div class="stat-value">{{ statsData.totalCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">存入次数</div>
            <div class="stat-value" style="color: #67C23A">{{ statsData.storeCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">取出次数</div>
            <div class="stat-value" style="color: #409EFF">{{ statsData.retrieveCount }}</div>
          </div>
        </el-col>
        <el-col :span="6">
          <div class="stat-card">
            <div class="stat-title">强制取出次数</div>
            <div class="stat-value" style="color: #E6A23C">{{ statsData.forceRetrieveCount }}</div>
          </div>
        </el-col>
      </el-row>
    </div>

    <!-- 数据列表 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="80" />
      <el-table-column align="center" label="柜号" prop="lockerNumber" width="100" />
      <el-table-column align="center" label="用户姓名" prop="userName" width="120" />
      <el-table-column align="center" label="用户手机号" prop="userMobile" width="130" />
      <el-table-column align="center" label="操作类型" prop="type" width="100">
        <template slot-scope="scope">
          <el-tag :type="operationTypeTag(scope.row.type)">
            {{ operationTypeText(scope.row.type) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="操作时间" prop="addTime" width="160" />
      <el-table-column align="center" label="操作员" prop="operatorName" width="120" />
      <el-table-column align="center" label="备注" prop="notes" show-overflow-tooltip />
      <el-table-column align="center" label="操作" width="100" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 详情对话框 -->
    <el-dialog :visible.sync="detailDialogVisible" title="操作详情" width="600px">
      <el-form v-if="detailData" label-width="100px">
        <el-form-item label="操作ID：">
          <span>{{ detailData.id }}</span>
        </el-form-item>
        <el-form-item label="操作编号：">
          <span>{{ detailData.operationNo }}</span>
        </el-form-item>
        <el-form-item label="储物柜编号：">
          <span>{{ detailData.lockerNumber }}</span>
        </el-form-item>
        <el-form-item label="用户姓名：">
          <span>{{ detailData.userName }}</span>
        </el-form-item>
        <el-form-item label="用户手机号：">
          <span>{{ detailData.userMobile }}</span>
        </el-form-item>
        <el-form-item label="操作类型：">
          <el-tag :type="operationTypeTag(detailData.type)">
            {{ operationTypeText(detailData.type) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="凭证码：">
          <span>{{ detailData.voucherCode }}</span>
        </el-form-item>
        <el-form-item label="状态：">
          <el-tag :type="statusTagType(detailData.status)">
            {{ statusText(detailData.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="操作时间：">
          <span>{{ detailData.addTime }}</span>
        </el-form-item>
        <el-form-item label="完成时间：">
          <span>{{ detailData.completedAt }}</span>
        </el-form-item>
        <el-form-item label="过期时间：">
          <span>{{ detailData.expiredAt }}</span>
        </el-form-item>
        <el-form-item label="操作员：">
          <span>{{ detailData.operatorName }}</span>
        </el-form-item>
        <el-form-item label="备注：">
          <span>{{ detailData.notes }}</span>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLockerOperation, detailLockerOperation, exportLockerOperation, statsLockerOperation, allStore } from '@/api/locker'
import Pagination from '@/components/Pagination'

export default {
  name: 'LockerOperationList',
  components: { Pagination },
  data() {
    return {
      list: null,
      total: 0,
      listLoading: true,
      listQuery: {
        page: 1,
        limit: 20,
        lockerNumber: undefined,
        userName: undefined,
        userPhone: undefined,
        operationType: undefined,
        storeId: undefined,
        dateRange: null,
        startTime: undefined,
        endTime: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      operationTypeOptions: [
        { label: '存入', value: 'store' },
        { label: '取出', value: 'retrieve' },
        { label: '强制取出', value: 'force_retrieve' }
      ],
      storeOptions: [],
      pickerOptions: {
        shortcuts: [{
          text: '最近一周',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 7)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近一个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 30)
            picker.$emit('pick', [start, end])
          }
        }, {
          text: '最近三个月',
          onClick(picker) {
            const end = new Date()
            const start = new Date()
            start.setTime(start.getTime() - 3600 * 1000 * 24 * 90)
            picker.$emit('pick', [start, end])
          }
        }]
      },
      detailDialogVisible: false,
      detailData: null,
      statsData: null
    }
  },
  created() {
    this.getList()
    this.getStoreList()
    this.getStats()
  },
  methods: {
    getList() {
      this.listLoading = true
      // 处理日期范围
      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        this.listQuery.startTime = this.listQuery.dateRange[0]
        this.listQuery.endTime = this.listQuery.dateRange[1]
      } else {
        this.listQuery.startTime = undefined
        this.listQuery.endTime = undefined
      }

      listLockerOperation(this.listQuery).then(response => {
        this.list = response.data.data.list
        this.total = response.data.data.total
        this.listLoading = false
      }).catch(() => {
        this.list = []
        this.total = 0
        this.listLoading = false
      })
    },
    getStoreList() {
      allStore().then(response => {
        this.storeOptions = response.data.data || []
      }).catch(() => {
        this.storeOptions = []
      })
    },
    getStats() {
      const params = {}
      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        params.startTime = this.listQuery.dateRange[0]
        params.endTime = this.listQuery.dateRange[1]
      }

      statsLockerOperation(params).then(response => {
        this.statsData = response.data.data
      }).catch(() => {
        this.statsData = null
      })
    },
    handleFilter() {
      this.listQuery.page = 1
      this.getList()
      this.getStats()
    },
    handleDetail(row) {
      detailLockerOperation(row.id).then(response => {
        this.detailData = response.data.data
        this.detailDialogVisible = true
      }).catch(() => {
        this.$message.error('获取详情失败')
      })
    },
    handleExport() {
      const params = {
        lockerNumber: this.listQuery.lockerNumber,
        userName: this.listQuery.userName,
        userPhone: this.listQuery.userPhone,
        operationType: this.listQuery.operationType,
        storeId: this.listQuery.storeId
      }

      if (this.listQuery.dateRange && this.listQuery.dateRange.length === 2) {
        params.startTime = this.listQuery.dateRange[0]
        params.endTime = this.listQuery.dateRange[1]
      }

      this.downloadLoading = true
      exportLockerOperation(params).then(response => {
        const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        link.href = URL.createObjectURL(blob)
        link.download = `操作记录_${new Date().getTime()}.csv`
        link.click()
        URL.revokeObjectURL(link.href)
        this.downloadLoading = false
      }).catch(() => {
        this.$message.error('导出失败')
        this.downloadLoading = false
      })
    },
    operationTypeText(type) {
      const typeMap = {
        'store': '存入',
        'retrieve': '取出',
        'force_retrieve': '强制取出'
      }
      return typeMap[type] || type
    },
    operationTypeTag(type) {
      const typeMap = {
        'store': 'success',
        'retrieve': 'primary',
        'force_retrieve': 'warning'
      }
      return typeMap[type] || 'info'
    },
    statusText(status) {
      const statusMap = {
        'active': '有效',
        'used': '已使用',
        'expired': '已过期'
      }
      return statusMap[status] || status
    },
    statusTagType(status) {
      const statusMap = {
        'active': 'success',
        'used': 'info',
        'expired': 'danger'
      }
      return statusMap[status] || 'info'
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}

.stats-container {
  margin-bottom: 20px;
}

.stat-card {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.stat-title {
  color: #909399;
  font-size: 14px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #303133;
}
</style>
