<template>
  <div class="apps-page">
    <!-- 筛选区 -->
    <el-card class="filter-section" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="应用标识">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入应用标识"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="应用名称">
          <el-input
            v-model="filterForm.title"
            placeholder="请输入应用名称"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="X"
            style="width: 400px"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 按钮区 -->
    <div class="action-section">
      <el-button type="primary" :icon="Plus" @click="handleCreate">新建应用</el-button>
    </div>

    <!-- 内容区 -->
    <div v-loading="loading" class="content-section">
      <!-- 空状态 -->
      <el-empty v-if="!loading && apps.length === 0" description="暂无应用数据" />

      <!-- 应用列表 -->
      <div v-else class="apps-grid">
        <AppAppCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          @edit="handleEdit"
          @delete="handleDelete"
        />
      </div>
    </div>

    <!-- 分页器 -->
    <div v-if="total > 0" class="pagination-section">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </div>

    <!-- 创建应用对话框 -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建应用"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="createFormRef" :model="createForm" :rules="createFormRules" label-width="100px">
        <el-form-item label="应用标识" prop="name">
          <el-input v-model="createForm.name" maxlength="50" show-word-limit />
        </el-form-item>
        <el-form-item label="应用名称" prop="title">
          <el-input v-model="createForm.title" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="createLoading" @click="handleCreateSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 编辑应用对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑应用"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="应用标识">
          <el-input v-model="editForm.name" disabled />
        </el-form-item>
        <el-form-item label="应用名称" prop="title">
          <el-input v-model="editForm.title" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="editLoading" @click="handleEditSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Search, Refresh, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { App } from '~/shared/types/app'
import { getErrorMessage } from '~/shared/utils/common'

definePageMeta({
  layout: 'workspace',
})

// 响应式数据
const loading = ref(false)
const apps = ref<App[]>([])
const total = ref(0)

// 筛选表单
const filterForm = reactive({
  name: '',
  title: '',
  startTime: undefined as number | undefined,
  endTime: undefined as number | undefined,
})

// 日期范围
const dateRange = ref<[number, number] | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
})

// 创建应用对话框
const createDialogVisible = ref(false)
const createLoading = ref(false)
const createFormRef = ref<FormInstance>()
const createForm = reactive({
  name: '',
  title: '',
})

// 创建表单验证规则
const createFormRules: FormRules = {
  name: [
    { required: true, message: '请输入应用标识', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]+$/,
      message: '应用标识只能包含字母、数字、下划线',
      trigger: 'blur',
    },
    { min: 3, max: 50, message: '应用标识长度应为 3-50 位', trigger: 'blur' },
  ],
  title: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 1, max: 100, message: '应用名称长度应为 1-100 位', trigger: 'blur' },
  ],
}

// 编辑应用对话框
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: 0,
  name: '',
  title: '',
})

// 编辑表单验证规则
const editFormRules: FormRules = {
  title: [
    { required: true, message: '请输入应用名称', trigger: 'blur' },
    { min: 1, max: 100, message: '应用名称长度应为 1-100 位', trigger: 'blur' },
  ],
}

// 获取应用列表
const fetchApps = async () => {
  try {
    loading.value = true

    // 构建查询参数
    const query: Record<string, string> = {
      page: pagination.page.toString(),
      pageSize: pagination.pageSize.toString(),
    }

    if (filterForm.name) {
      query.name = filterForm.name
    }

    if (filterForm.title) {
      query.title = filterForm.title
    }

    if (filterForm.startTime) {
      query.startTime = filterForm.startTime.toString()
    }

    if (filterForm.endTime) {
      query.endTime = filterForm.endTime.toString()
    }

    const response = await $fetch<{
      success: boolean
      message: string
      data: {
        list: App[]
        total: number
        page: number
        pageSize: number
      }
    }>('/api/user/apps', {
      method: 'GET',
      query,
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    apps.value = response.data.list
    total.value = response.data.total
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  // 同步日期范围到筛选表单
  if (dateRange.value && dateRange.value.length === 2) {
    filterForm.startTime = dateRange.value[0]
    filterForm.endTime = dateRange.value[1]
  } else {
    filterForm.startTime = undefined
    filterForm.endTime = undefined
  }

  pagination.page = 1
  fetchApps()
}

// 重置
const handleReset = () => {
  filterForm.name = ''
  filterForm.title = ''
  filterForm.startTime = undefined
  filterForm.endTime = undefined
  dateRange.value = null
  pagination.page = 1
  fetchApps()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchApps()
}

// 页码改变
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchApps()
}

// 打开创建对话框
const handleCreate = () => {
  createForm.name = ''
  createForm.title = ''
  createDialogVisible.value = true
  // 清除表单验证状态
  nextTick(() => {
    createFormRef.value?.clearValidate()
  })
}

// 提交创建
const handleCreateSubmit = async () => {
  if (!createFormRef.value) return

  try {
    await createFormRef.value.validate()
  } catch {
    return
  }

  try {
    createLoading.value = true
    const response = await $fetch<{
      success: boolean
      message: string
      data: App
    }>('/api/user/apps', {
      method: 'POST',
      body: {
        name: createForm.name,
        title: createForm.title,
      },
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    ElMessage.success(response.message)
    createDialogVisible.value = false
    // 刷新列表
    await fetchApps()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    createLoading.value = false
  }
}

// 打开编辑对话框
const handleEdit = (app: App) => {
  editForm.id = app.id
  editForm.name = app.name
  editForm.title = app.title
  editDialogVisible.value = true
  // 清除表单验证状态
  nextTick(() => {
    editFormRef.value?.clearValidate()
  })
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editFormRef.value) return

  try {
    await editFormRef.value.validate()
  } catch {
    return
  }

  try {
    editLoading.value = true
    const response = await $fetch<{
      success: boolean
      message: string
      data: App
    }>(`/api/user/apps/${editForm.id}`, {
      method: 'PUT',
      body: {
        title: editForm.title,
      },
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    ElMessage.success(response.message)
    editDialogVisible.value = false
    // 刷新列表
    await fetchApps()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    editLoading.value = false
  }
}

// 删除应用
const handleDelete = async (app: App) => {
  try {
    await ElMessageBox.confirm(`确定要删除应用 "${app.title}" 吗？删除后不可恢复。`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    try {
      loading.value = true
      const response = await $fetch<{
        success: boolean
        message: string
      }>(`/api/user/apps/${app.id}`, {
        method: 'DELETE',
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      ElMessage.success(response.message)
      // 刷新列表
      await fetchApps()
    } catch (error) {
      ElMessage.error(getErrorMessage(error))
    } finally {
      loading.value = false
    }
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel') {
      return
    }
    ElMessage.error(getErrorMessage(error))
  }
}

// 初始化加载
onMounted(() => {
  fetchApps()
})
</script>

<style lang="scss" scoped>
.apps-page {
  padding: 20px;

  // CSS 变量：应用卡片宽度
  --app-card-width: 300px;

  .filter-section {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding-bottom: calc(var(--el-card-padding) - 18px);
    }
  }

  .action-section {
    margin-bottom: 20px;
  }

  .content-section {
    min-height: 400px;
    margin-bottom: 20px;

    .apps-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--app-card-width), 1fr));
      gap: 20px;
      align-items: start;

      // 响应式调整
      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(calc(var(--app-card-width) * 0.8), 1fr));
        gap: 16px;
      }

      @media (max-width: 480px) {
        grid-template-columns: 1fr;
        gap: 12px;
      }
    }
  }

  .pagination-section {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}
</style>
