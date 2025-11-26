import { DataTypes, Model } from 'sequelize'
import type { Optional } from 'sequelize'
import { getSequelize } from './index'

interface UserAttributes {
  id: number
  username: string
  password: string
  isAdmin: boolean
  createdAt?: Date
  updatedAt?: Date
}

interface UserCreationAttributes
  extends Optional<UserAttributes, 'id' | 'isAdmin' | 'createdAt' | 'updatedAt'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number
  declare username: string
  declare password: string
  declare isAdmin: boolean
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export function initUserModel(): void {
  const sequelize = getSequelize()

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 50],
          is: /^[a-zA-Z0-9_]+$/, // 只允许字母、数字、下划线
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        field: 'is_admin',
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
      tableName: 'users',
      timestamps: true,
      underscored: true,
    }
  )
}
