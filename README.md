# Seeweb

基于 Nuxt 3 + MySQL 的现代化 Web 开发架构

## 技术栈

- **框架**: Nuxt 3
- **数据库**: MySQL (使用 mysql2)
- **代码检查**: ESLint
- **代码格式化**: Prettier
- **Git Hooks**: Husky
- **提交规范**: Commitlint

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `env.example` 文件并创建 `.env` 文件：

```bash
cp env.example .env
```

然后编辑 `.env` 文件，配置你的 MySQL 数据库连接信息：

```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=seeweb
```

### 3. 初始化 Husky

Husky 会在 `npm install` 后自动初始化（通过 `prepare` 脚本）。如果需要手动初始化：

```bash
npm run prepare
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

## 可用脚本

- `npm run dev` - 启动开发服务器
- `npm run build` - 构建生产版本
- `npm run generate` - 生成静态站点
- `npm run preview` - 预览生产构建
- `npm run lint` - 运行 ESLint 检查
- `npm run lint:fix` - 运行 ESLint 并自动修复
- `npm run format` - 使用 Prettier 格式化代码
- `npm run format:check` - 检查代码格式

## Git Hooks

### Pre-commit

在提交前会自动运行：

- ESLint 代码检查
- Prettier 格式检查

### Commit-msg

提交信息必须符合 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响代码运行）
- `refactor`: 重构代码
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `revert`: 回滚提交

示例：

```bash
git commit -m "feat: 添加用户登录功能"
git commit -m "fix: 修复数据库连接问题"
```

## 项目结构

```
seeweb/
├── app/                    # Nuxt 应用目录
│   ├── router.options.ts  # 路由配置
│   └── app.vue            # 根组件
├── pages/                  # 页面目录
│   └── index.vue          # 首页
├── server/                 # 服务端代码
│   ├── api/               # API 路由
│   └── utils/             # 服务端工具函数
│       └── db.ts          # 数据库连接工具
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── .commitlintrc.json     # Commitlint 配置
├── .husky/                # Husky Git hooks
├── nuxt.config.ts         # Nuxt 配置
└── package.json           # 项目依赖
```

## 数据库连接

数据库连接工具位于 `server/utils/db.ts`，使用连接池管理 MySQL 连接。

在 API 路由中使用：

```typescript
import { getDatabase } from '~/server/utils/db'

export default defineEventHandler(async event => {
  const db = await getDatabase()
  const [rows] = await db.query('SELECT * FROM users')
  return rows
})
```

## 开发规范

1. **代码风格**: 使用 Prettier 自动格式化，遵循 ESLint 规则
2. **提交信息**: 必须符合 Conventional Commits 规范
3. **代码检查**: 提交前会自动运行 lint 和 format 检查

## 许可证

MIT
