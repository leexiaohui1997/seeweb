/* eslint-disable no-console */
'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, _Sequelize) {
    const sequelize = queryInterface.sequelize

    // 检查虚拟列是否已存在
    const [columnResults] = await sequelize.query(`
      SELECT COUNT(*) as count 
      FROM information_schema.COLUMNS 
      WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'apps' 
      AND COLUMN_NAME = 'name_unique_when_not_deleted'
    `)

    const columnExists = columnResults[0]?.count > 0

    if (!columnExists) {
      // 添加生成的虚拟列（当 deleted_at IS NULL 时存储 name，否则为 NULL）
      // 使用 STORED 类型以支持唯一索引（VIRTUAL 列在 MySQL 5.7 中不支持唯一索引）
      await sequelize.query(`
        ALTER TABLE apps 
        ADD COLUMN name_unique_when_not_deleted VARCHAR(50) 
        GENERATED ALWAYS AS (CASE WHEN deleted_at IS NULL THEN name ELSE NULL END) STORED
      `)

      // 在虚拟列上创建唯一索引
      // NULL 值在唯一索引中会被忽略，所以已删除的记录（deleted_at IS NOT NULL）不会违反唯一性
      await sequelize.query(`
        CREATE UNIQUE INDEX idx_apps_name_unique_when_not_deleted 
        ON apps (name_unique_when_not_deleted)
      `)
    }
  },

  async down(queryInterface, _Sequelize) {
    const sequelize = queryInterface.sequelize

    // 删除部分唯一索引和虚拟列
    try {
      await sequelize.query(`DROP INDEX idx_apps_name_unique_when_not_deleted ON apps`)
    } catch (error) {
      console.log('索引 idx_apps_name_unique_when_not_deleted 可能不存在')
    }

    try {
      await sequelize.query(`ALTER TABLE apps DROP COLUMN name_unique_when_not_deleted`)
    } catch (error) {
      console.log('虚拟列 name_unique_when_not_deleted 可能不存在')
    }
  },
}
