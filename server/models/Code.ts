import { DataTypes, Model } from 'sequelize'
import type { Optional } from 'sequelize'
import { getSequelize } from './index'

interface CodeAttributes {
  id: number
  userId: number
  type: 'template' | 'script' | 'style'
  content: string
  appId: number | null
  createdAt?: Date
  updatedAt?: Date
}

interface CodeCreationAttributes
  extends Optional<CodeAttributes, 'id' | 'appId' | 'content' | 'createdAt' | 'updatedAt'> {}

export class Code extends Model<CodeAttributes, CodeCreationAttributes> implements CodeAttributes {
  declare id: number
  declare userId: number
  declare type: 'template' | 'script' | 'style'
  declare content: string
  declare appId: number | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export function initCodeModel(): void {
  const sequelize = getSequelize()

  Code.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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
      type: {
        type: DataTypes.ENUM('template', 'script', 'style'),
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: '',
      },
      appId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'app_id',
        references: {
          model: 'apps',
          key: 'id',
        },
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
      tableName: 'codes',
      timestamps: true,
      underscored: true,
    }
  )
}
