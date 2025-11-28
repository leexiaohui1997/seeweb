<template>
  <div class="wrapper">
    <el-splitter>
      <el-splitter-panel collapsible>
        <EditorCodePanel type="template" />
      </el-splitter-panel>
      <el-splitter-panel collapsible>
        <EditorCodePanel type="style" />
      </el-splitter-panel>
      <el-splitter-panel collapsible>
        <EditorCodePanel type="script" />
      </el-splitter-panel>
    </el-splitter>
  </div>
</template>

<style lang="scss" scoped>
.wrapper {
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  border: 1px solid rgba($primary-color, 0.5);
}
</style>
