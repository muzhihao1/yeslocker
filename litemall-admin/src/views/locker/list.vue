<template>
  <div class="app-container">
    <!-- 查询条件 -->
    <div class="filter-container">
      <el-select v-model="listQuery.storeId" clearable style="width: 160px" class="filter-item" placeholder="请选择门店">
        <el-option v-for="store in storeOptions" :key="store.id" :label="store.name" :value="store.id" />
      </el-select>
      <el-select v-model="listQuery.zone" clearable style="width: 120px" class="filter-item" placeholder="请选择区域">
        <el-option v-for="item in zoneOptions" :key="item" :label="item" :value="item" />
      </el-select>
      <el-select v-model="listQuery.status" clearable style="width: 120px" class="filter-item" placeholder="请选择状态">
        <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
      </el-select>
      <el-button class="filter-item" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
      <el-button v-permission="['POST /admin/locker/create']" class="filter-item" type="primary" icon="el-icon-plus" @click="handleCreate">添加储物柜</el-button>
    </div>

    <!-- 数据列表 -->
    <el-table v-loading="listLoading" :data="list" element-loading-text="正在查询中。。。" border fit highlight-current-row>
      <el-table-column align="center" label="ID" prop="id" width="60" />
      <el-table-column align="center" label="柜号" prop="cabinetNumber" width="100" />
      <el-table-column align="center" label="门店" prop="storeName" width="120" />
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
      <el-table-column align="center" label="操作" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-permission="['GET /admin/locker/detail']" type="primary" size="mini" @click="handleDetail(scope.row)">详情</el-button>
          <el-button v-permission="['POST /admin/locker/update']" type="info" size="mini" @click="handleUpdate(scope.row)">编辑</el-button>
          <el-button v-permission="['POST /admin/locker/delete']" type="danger" size="mini" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <pagination v-show="total>0" :total="total" :page.sync="listQuery.page" :limit.sync="listQuery.limit" @pagination="getList" />

    <!-- 储物柜详情对话框 -->
    <el-dialog :visible.sync="detailDialogVisible" title="储物柜详情">
      <el-form label-position="left">
        <el-form-item label="储物柜编号：">
          <span>{{ lockerDetail.cabinetNumber }}</span>
        </el-form-item>
        <el-form-item label="所属门店：">
          <span>{{ lockerDetail.storeName }}</span>
        </el-form-item>
        <el-form-item label="区域：">
          <span>{{ lockerDetail.zone }}</span>
        </el-form-item>
        <el-form-item label="状态：">
          <el-tag :type="statusTagType(lockerDetail.status)">
            {{ statusText(lockerDetail.status) }}
          </el-tag>
        </el-form-item>
        <el-form-item label="当前使用者：">
          <span>{{ lockerDetail.currentUserId || '无' }}</span>
        </el-form-item>
        <el-form-item label="最后使用时间：">
          <span>{{ lockerDetail.lastUsedTime || '无' }}</span>
        </el-form-item>
        <el-form-item label="备注：">
          <span>{{ lockerDetail.remarks || '无' }}</span>
        </el-form-item>
        <el-form-item label="创建时间：">
          <span>{{ lockerDetail.addTime }}</span>
        </el-form-item>
        <el-form-item label="更新时间：">
          <span>{{ lockerDetail.updateTime }}</span>
        </el-form-item>
      </el-form>
    </el-dialog>

    <!-- 添加或修改对话框 -->
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="dataForm" status-icon label-position="left" label-width="120px" style="width: 400px; margin-left:50px;">
        <el-form-item label="储物柜编号" prop="number">
          <el-input v-model="dataForm.number" placeholder="请输入储物柜编号" />
        </el-form-item>
        <el-form-item label="所属门店" prop="storeId">
          <el-select v-model="dataForm.storeId" placeholder="请选择门店" style="width: 100%">
            <el-option v-for="store in storeOptions" :key="store.id" :label="store.name" :value="store.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="区域" prop="zone">
          <el-select v-model="dataForm.zone" placeholder="请选择区域" style="width: 100%">
            <el-option v-for="item in zoneOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item v-if="dialogStatus === 'update'" label="状态" prop="status">
          <el-select v-model="dataForm.status" placeholder="请选择状态" style="width: 100%">
            <el-option v-for="item in statusOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注" prop="remarks">
          <el-input v-model="dataForm.remarks" type="textarea" :rows="3" placeholder="请输入备注信息" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">取消</el-button>
        <el-button v-if="dialogStatus=='create'" type="primary" @click="createData">确定</el-button>
        <el-button v-else type="primary" @click="updateData">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { listLocker, allStore, createLocker, updateLocker, deleteLocker, detailLocker } from '@/api/locker'
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
        storeId: undefined,
        zone: undefined,
        status: undefined,
        sort: 'add_time',
        order: 'desc'
      },
      storeOptions: [],
      zoneOptions: ['A区', 'B区', 'C区', 'D区'],
      statusOptions: [
        { label: '可用', value: 'available' },
        { label: '占用', value: 'occupied' },
        { label: '维护', value: 'maintenance' }
      ],
      dataForm: {
        id: undefined,
        number: '',
        storeId: undefined,
        zone: '',
        status: 'available',
        remarks: ''
      },
      dialogFormVisible: false,
      dialogStatus: '',
      textMap: {
        update: '编辑储物柜',
        create: '创建储物柜'
      },
      rules: {
        number: [
          { required: true, message: '储物柜编号不能为空', trigger: 'blur' }
        ],
        storeId: [
          { required: true, message: '请选择所属门店', trigger: 'change' }
        ],
        zone: [
          { required: true, message: '请选择区域', trigger: 'change' }
        ]
      },
      detailDialogVisible: false,
      lockerDetail: {}
    }
  },
  created() {
    this.getList()
    this.getStoreList()
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
      detailLocker(row.id).then(response => {
        this.lockerDetail = response.data.data
        // Get store name if not already present
        if (this.lockerDetail.storeId && !this.lockerDetail.storeName) {
          const store = this.storeOptions.find(s => s.id === this.lockerDetail.storeId)
          if (store) {
            this.lockerDetail.storeName = store.name
          }
        }
        this.detailDialogVisible = true
      })
    },
    resetForm() {
      this.dataForm = {
        id: undefined,
        number: '',
        storeId: undefined,
        zone: '',
        status: 'available',
        remarks: ''
      }
    },
    handleCreate() {
      this.resetForm()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          createLocker(this.dataForm).then(response => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '创建储物柜成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleUpdate(row) {
      this.dataForm = Object.assign({}, row)
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          updateLocker(this.dataForm).then(() => {
            this.dialogFormVisible = false
            this.$notify.success({
              title: '成功',
              message: '更新储物柜成功'
            })
            this.getList()
          }).catch(response => {
            this.$notify.error({
              title: '失败',
              message: response.data.errmsg
            })
          })
        }
      })
    },
    handleDelete(row) {
      this.$confirm('确定删除该储物柜吗？删除后将无法恢复', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteLocker({ id: row.id }).then(() => {
          this.$notify.success({
            title: '成功',
            message: '删除储物柜成功'
          })
          this.getList()
        }).catch(response => {
          this.$notify.error({
            title: '失败',
            message: response.data.errmsg
          })
        })
      }).catch(() => {})
    },
    getStoreList() {
      allStore().then(response => {
        this.storeOptions = response.data.data || []
      }).catch(() => {
        this.storeOptions = []
      })
    }
  }
}
</script>

<style scoped>
.filter-container {
  margin-bottom: 20px;
}
.filter-item {
  margin-right: 10px;
}
</style>
