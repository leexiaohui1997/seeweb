import { DataTypes, Model } from 'sequelize'
import type { Optional } from 'sequelize'
import { getSequelize } from './index'

interface FileAttributes {
  id: number
  key: string
  name: string | null
  type: string
  size: number
  ext: string | null
  private: boolean
  userId: number | null
  createdAt?: Date
  updatedAt?: Date
}

interface FileCreationAttributes
  extends Optional<FileAttributes, 'id' | 'name' | 'ext' | 'userId' | 'createdAt' | 'updatedAt'> {}

export class File extends Model<FileAttributes, FileCreationAttributes> implements FileAttributes {
  declare id: number
  declare key: string
  declare name: string | null
  declare type: string
  declare size: number
  declare ext: string | null
  declare private: boolean
  declare userId: number | null
  declare readonly createdAt: Date
  declare readonly updatedAt: Date
}

export function initFileModel(): void {
  const sequelize = getSequelize()

  File.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          len: [1, 255],
        },
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          len: [1, 100],
        },
      },
      size: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0,
        },
      },
      ext: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      private: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'user_id',
        references: {
          model: 'users',
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
      tableName: 'files',
      timestamps: true,
      underscored: true,
    }
  )
}
