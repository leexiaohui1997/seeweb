'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 添加模板代码关联字段
    await queryInterface.addColumn('apps', 'template_code_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'codes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    // 添加样式代码关联字段
    await queryInterface.addColumn('apps', 'style_code_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'codes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })

    // 添加脚本代码关联字段
    await queryInterface.addColumn('apps', 'script_code_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'codes',
        key: 'id',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    })
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.removeColumn('apps', 'template_code_id')
    await queryInterface.removeColumn('apps', 'style_code_id')
    await queryInterface.removeColumn('apps', 'script_code_id')
  },
}
