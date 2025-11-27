import { DataTypes, Model } from 'sequelize'
import type { Optional } from 'sequelize'
import { getSequelize } from './index'

interface AppAttributes {
  id: number
  name: string
  title: string
  userId: number
  deletedAt?: Date | null
  createdAt?: Date
  updatedAt?: Date
}

interface AppCreationAttributes
  extends Optional<AppAttributes, 'id' | 'deletedAt' | 'createdAt' | 'updatedAt'> {}

export class App extends Model<AppAttributes, AppCreationAttributes> implements AppAttributes {
  declare id: number
  declare name: string
  declare title: string
  declare userId: number
  declare deletedAt: Date | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export function initAppModel(): void {
  const sequelize = getSequelize()

  App.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/, // 只允许字母、数字、下划线
        },
      },
      title: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: 'user_id',
        references: {
          model: 'users',
          key: 'id',
        },
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'deleted_at',
      },
      createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'created_at',
      },
      updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        field: 'updated_at',
      },
    },
    {
      sequelize,
      tableName: 'apps',
      timestamps: true,
      underscored: true,
    }
  )
}
