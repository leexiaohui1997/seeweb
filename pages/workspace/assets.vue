<template>
  <div class="assets-page">
    <!-- 筛选区 -->
    <el-card class="filter-section" shadow="never">
      <el-form :model="filterForm" inline>
        <el-form-item label="文件名">
          <el-input
            v-model="filterForm.name"
            placeholder="请输入文件名"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="上传时间">
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
        <el-form-item label="是否公开">
          <el-select
            v-model="filterForm.private"
            placeholder="请选择"
            clearable
            style="width: 120px"
          >
            <el-option label="公开" :value="false" />
            <el-option label="私有" :value="true" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">搜索</el-button>
          <el-button :icon="Refresh" @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 按钮区 -->
    <div class="action-section">
      <el-upload
        ref="uploadRef"
        :action="uploadAction"
        :headers="uploadHeaders"
        :data="uploadData"
        :before-upload="beforeUpload"
        :on-success="handleUploadSuccess"
        :on-error="handleUploadError"
        :show-file-list="false"
        :auto-upload="true"
      >
        <template #trigger>
          <el-button type="primary" :icon="Plus">上传文件</el-button>
        </template>
      </el-upload>
      <el-button
        v-if="selectedFiles.length > 0"
        type="danger"
        :icon="Delete"
        :disabled="deleteLoading"
        @click="handleBatchDelete"
      >
        批量删除 ({{ selectedFiles.length }})
      </el-button>
    </div>

    <!-- 内容区 -->
    <div v-loading="loading" class="content-section">
      <!-- 空状态 -->
      <el-empty v-if="!loading && files.length === 0" description="暂无文件数据" />

      <!-- 文件列表 -->
      <div v-else class="files-grid">
        <AppAssetsItem
          v-for="file in files"
          :key="file.id"
          :file="file"
          :selected="selectedFiles.includes(file.id)"
          @edit="handleEdit"
          @delete="handleDelete"
          @update:selected="handleSelectChange(file.id, $event)"
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

    <!-- 编辑文件对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="编辑文件"
      width="500px"
      :close-on-click-modal="false"
      append-to-body
    >
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="100px">
        <el-form-item label="文件名" prop="name">
          <el-input v-model="editForm.name" maxlength="255" show-word-limit />
        </el-form-item>
        <el-form-item label="是否公开" prop="private">
          <el-switch v-model="editForm.private" active-text="私有" inactive-text="公开" />
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
import type { FormInstance, FormRules, UploadInstance, UploadRawFile } from 'element-plus'
import { Search, Refresh, Plus, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { File } from '~/shared/types/file'
import { getErrorMessage } from '~/shared/utils/common'

definePageMeta({
  layout: 'workspace',
})

// 响应式数据
const loading = ref(false)
const files = ref<File[]>([])
const total = ref(0)
const selectedFiles = ref<number[]>([])

// 筛选表单
const filterForm = reactive({
  name: '',
  startTime: undefined as number | undefined,
  endTime: undefined as number | undefined,
  private: undefined as boolean | undefined,
})

// 日期范围
const dateRange = ref<[number, number] | null>(null)

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
})

// 编辑文件对话框
const editDialogVisible = ref(false)
const editLoading = ref(false)
const editFormRef = ref<FormInstance>()
const editForm = reactive({
  id: 0,
  name: '',
  private: false,
})

// 编辑表单验证规则
const editFormRules: FormRules = {
  name: [{ max: 255, message: '文件名长度不能超过 255 位', trigger: 'blur' }],
}

// 文件上传
const uploadRef = ref<UploadInstance>()
const uploadAction = '/api/user/files'
const uploadHeaders = computed(() => {
  // Nuxt 会自动处理 cookie，这里不需要手动设置
  return {}
})
const uploadData = computed(() => {
  return {}
})

// 上传前验证
const beforeUpload = (_file: UploadRawFile) => {
  // 可以在这里添加前端验证
  return true
}

// 上传成功
const handleUploadSuccess = (response: any) => {
  if (response.success) {
    ElMessage.success(response.message || '文件上传成功')
    // 刷新列表
    fetchFiles()
  } else {
    ElMessage.error(response.message || '文件上传失败')
  }
}

// 上传失败
const handleUploadError = (error: Error) => {
  ElMessage.error(getErrorMessage(error))
}

// 批量删除
const deleteLoading = ref(false)
const handleBatchDelete = async () => {
  if (selectedFiles.value.length === 0) {
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedFiles.value.length} 个文件吗？删除后不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    try {
      deleteLoading.value = true
      const response = await $fetch<{
        success: boolean
        message: string
      }>('/api/user/files', {
        method: 'DELETE',
        body: {
          ids: selectedFiles.value,
        },
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      ElMessage.success(response.message)
      selectedFiles.value = []
      // 刷新列表
      await fetchFiles()
    } catch (error) {
      ElMessage.error(getErrorMessage(error))
    } finally {
      deleteLoading.value = false
    }
  } catch (error: any) {
    // 用户取消操作
    if (error === 'cancel') {
      return
    }
    ElMessage.error(getErrorMessage(error))
  }
}

// 获取文件列表
const fetchFiles = async () => {
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

    if (filterForm.startTime) {
      query.startTime = filterForm.startTime.toString()
    }

    if (filterForm.endTime) {
      query.endTime = filterForm.endTime.toString()
    }

    if (filterForm.private !== undefined) {
      query.private = filterForm.private.toString()
    }

    const response = await $fetch<{
      success: boolean
      message: string
      data: {
        list: File[]
        total: number
        page: number
        pageSize: number
      }
    }>('/api/user/files', {
      method: 'GET',
      query,
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    files.value = response.data.list
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
  fetchFiles()
}

// 重置
const handleReset = () => {
  filterForm.name = ''
  filterForm.startTime = undefined
  filterForm.endTime = undefined
  filterForm.private = undefined
  dateRange.value = null
  pagination.page = 1
  selectedFiles.value = []
  fetchFiles()
}

// 分页大小改变
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  pagination.page = 1
  fetchFiles()
}

// 页码改变
const handlePageChange = (page: number) => {
  pagination.page = page
  fetchFiles()
}

// 选择文件
const handleSelectChange = (fileId: number, selected: boolean) => {
  if (selected) {
    if (!selectedFiles.value.includes(fileId)) {
      selectedFiles.value.push(fileId)
    }
  } else {
    const index = selectedFiles.value.indexOf(fileId)
    if (index > -1) {
      selectedFiles.value.splice(index, 1)
    }
  }
}

// 打开编辑对话框
const handleEdit = (file: File) => {
  editForm.id = file.id
  editForm.name = file.name || ''
  editForm.private = file.private
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
      data: File
    }>(`/api/user/files/${editForm.id}`, {
      method: 'PUT',
      body: {
        name: editForm.name || null,
        private: editForm.private,
      },
    })

    if (!response.success) {
      throw new Error(response.message)
    }

    ElMessage.success(response.message)
    editDialogVisible.value = false
    // 刷新列表
    await fetchFiles()
  } catch (error) {
    ElMessage.error(getErrorMessage(error))
  } finally {
    editLoading.value = false
  }
}

// 删除文件
const handleDelete = async (file: File) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除文件 "${file.name || '未命名文件'}" 吗？删除后不可恢复。`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    try {
      loading.value = true
      const response = await $fetch<{
        success: boolean
        message: string
      }>('/api/user/files', {
        method: 'DELETE',
        body: {
          ids: [file.id],
        },
      })

      if (!response.success) {
        throw new Error(response.message)
      }

      ElMessage.success(response.message)
      // 从选中列表中移除
      const index = selectedFiles.value.indexOf(file.id)
      if (index > -1) {
        selectedFiles.value.splice(index, 1)
      }
      // 刷新列表
      await fetchFiles()
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
  fetchFiles()
})
</script>

<style lang="scss" scoped>
.assets-page {
  padding: 20px;
  min-height: 100%;

  // CSS 变量：文件卡片宽度
  --file-card-width: 300px;

  .filter-section {
    margin-bottom: 20px;

    :deep(.el-card__body) {
      padding-bottom: calc(var(--el-card-padding) - 18px);
    }
  }

  .action-section {
    margin-bottom: 20px;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .content-section {
    min-height: 400px;
    margin-bottom: 20px;

    .files-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--file-card-width), 1fr));
      gap: 20px;
      align-items: start;

      // 响应式调整
      @media (max-width: 768px) {
        grid-template-columns: repeat(auto-fill, minmax(calc(var(--file-card-width) * 0.8), 1fr));
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
