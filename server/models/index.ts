import { Sequelize } from 'sequelize'
import type { RuntimeConfig } from '../types/runtime-config'
import { User } from './User'
import { App } from './App'
import { File } from './File'

let sequelize: Sequelize | null = null

export function getSequelize(): Sequelize {
  if (!sequelize) {
    const config = useRuntimeConfig() as unknown as RuntimeConfig

    sequelize = new Sequelize(config.mysql.database, config.mysql.user, config.mysql.password, {
      host: config.mysql.host,
      port: config.mysql.port,
      dialect: 'mysql',
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000,
      },
      logging: false, // 生产环境可以设置为 false
    })
  }

  return sequelize
}

/**
 * 初始化所有模型关联关系
 */
export function initModelAssociations(): void {
  // User 和 App 的关联关系
  User.hasMany(App, {
    foreignKey: 'userId',
    as: 'apps',
  })

  App.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  })

  // User 和 File 的关联关系
  User.hasMany(File, {
    foreignKey: 'userId',
    as: 'files',
  })

  File.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
  })
}

export async function closeSequelize(): Promise<void> {
  if (sequelize) {
    await sequelize.close()
    sequelize = null
  }
}
