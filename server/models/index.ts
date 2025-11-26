import { Sequelize } from 'sequelize'

let sequelize: Sequelize | null = null

export function getSequelize(): Sequelize {
  if (!sequelize) {
    const config = useRuntimeConfig()

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

export async function closeSequelize(): Promise<void> {
  if (sequelize) {
    await sequelize.close()
    sequelize = null
  }
}
