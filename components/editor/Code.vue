<template>
  <div class="wrapper">
    <div class="wrapper-inner">
      <el-splitter>
        <el-splitter-panel collapsible>
          <EditorCodePanel
            type="template"
            :app-id="appId"
            :code-id="templateCode?.id"
            :model-value="templateCode?.content"
            @update:code-id="handleTemplateCodeIdUpdate"
          />
        </el-splitter-panel>
        <el-splitter-panel collapsible>
          <EditorCodePanel
            type="style"
            :app-id="appId"
            :code-id="styleCode?.id"
            :model-value="styleCode?.content"
            @update:code-id="handleStyleCodeIdUpdate"
          />
        </el-splitter-panel>
        <el-splitter-panel collapsible>
          <EditorCodePanel
            type="script"
            :app-id="appId"
            :code-id="scriptCode?.id"
            :model-value="scriptCode?.content"
            @update:code-id="handleScriptCodeIdUpdate"
          />
        </el-splitter-panel>
      </el-splitter>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppCode } from '~/shared/types/app'

defineProps<{
  appId?: number
  templateCode?: AppCode
  styleCode?: AppCode
  scriptCode?: AppCode
}>()

const emit = defineEmits<{
  'update:templateCodeId': [id: number]
  'update:styleCodeId': [id: number]
  'update:scriptCodeId': [id: number]
}>()

const handleTemplateCodeIdUpdate = (id: number) => {
  emit('update:templateCodeId', id)
}

const handleStyleCodeIdUpdate = (id: number) => {
  emit('update:styleCodeId', id)
}

const handleScriptCodeIdUpdate = (id: number) => {
  emit('update:scriptCodeId', id)
}
</script>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  padding: 0 16px 16px;

  &-inner {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    border: 1px solid rgba($primary-color, 0.5);
  }
}
</style>
