'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('codes', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      type: {
        type: Sequelize.ENUM('template', 'script', 'style'),
        allowNull: false,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      app_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'apps',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    })

    // 添加索引
    await queryInterface.addIndex('codes', ['user_id'], {
      name: 'idx_codes_user_id',
    })

    await queryInterface.addIndex('codes', ['app_id'], {
      name: 'idx_codes_app_id',
    })

    await queryInterface.addIndex('codes', ['type'], {
      name: 'idx_codes_type',
    })

    // 添加联合唯一索引：确保同一用户、同一应用、同一类型只有一条记录
    await queryInterface.addIndex('codes', ['user_id', 'app_id', 'type'], {
      name: 'idx_codes_user_app_type',
      unique: true,
    })
  },

  async down(queryInterface, _Sequelize) {
    await queryInterface.dropTable('codes')
  },
}
