# 用户模块使用说明

## 功能概述

已实现完整的用户注册、登录功能，包括：

1. **用户表管理**：使用 Sequelize ORM 管理 MySQL 数据库
2. **注册功能**：`/regist` 页面，首位注册用户自动成为管理员
3. **登录功能**：`/login` 页面，包含图形验证码和 JWT 认证

## 数据库配置

### 1. 执行数据库迁移

在首次使用前，需要执行数据库迁移创建用户表：

```bash
pnpm run db:migrate
```

### 2. 环境变量配置

复制 `env.example` 文件创建 `.env` 文件，并配置以下变量：

```env
# MySQL 数据库配置
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=seeweb

# JWT 密钥（用于生成和验证 Token）
JWT_SECRET=your-secret-key-change-in-production

# Session 密钥（用于存储验证码等会话数据）
SESSION_SECRET=your-session-secret-change-in-production
```

**重要**：生产环境请务必修改 `JWT_SECRET` 和 `SESSION_SECRET` 为安全的随机字符串。

## API 接口

### 1. 获取验证码

**GET** `/api/auth/captcha`

返回 SVG 格式的验证码图片，验证码文本存储在 session 中。

### 2. 用户注册

**POST** `/api/auth/register`

请求体：

```json
{
  "username": "testuser",
  "password": "password123",
  "confirmPassword": "password123"
}
```

响应：

```json
{
  "success": true,
  "message": "注册成功",
  "data": {
    "id": 1,
    "username": "testuser",
    "isAdmin": true
  }
}
```

**注意**：首位注册的用户会自动成为管理员（`isAdmin: true`）。

### 3. 用户登录

**POST** `/api/auth/login`

请求体：

```json
{
  "username": "testuser",
  "password": "password123",
  "captcha": "abcd"
}
```

响应：

```json
{
  "success": true,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "testuser",
      "isAdmin": true
    }
  }
}
```

## 前端页面

### 注册页面

访问 `/regist` 进行用户注册。

- 用户名：3-50 位，只能包含字母、数字、下划线
- 密码：至少 8 位，必须包含字母和数字
- 确认密码：必须与密码一致

### 登录页面

访问 `/login` 进行用户登录。

- 需要填写用户名、密码和图形验证码
- 登录成功后，token 会存储在 `localStorage` 中
- 验证码可点击图片刷新

## 数据验证规则

### 用户名

- 长度：3-50 字符
- 格式：只能包含字母（a-z, A-Z）、数字（0-9）、下划线（\_）
- 唯一性：用户名必须唯一

### 密码

- 最小长度：8 位
- 复杂度：必须包含至少一个字母和一个数字

## 安全特性

1. **密码加密**：使用 bcryptjs 进行加盐哈希加密
2. **JWT 认证**：Token 有效期 7 天
3. **图形验证码**：防止暴力破解，5 分钟过期
4. **Session 管理**：验证码存储在服务端 session 中

## 数据库迁移命令

```bash
# 执行迁移
pnpm run db:migrate

# 查看迁移状态
pnpm run db:migrate:status

# 回滚最后一次迁移
pnpm run db:migrate:undo
```

## 项目结构

```
server/
├── models/
│   ├── index.ts          # Sequelize 实例
│   └── User.ts           # User 模型定义
├── migrations/
│   └── 20241201000000-create-users.js  # 用户表迁移
├── api/
│   └── auth/
│       ├── captcha.get.ts    # 验证码接口
│       ├── register.post.ts  # 注册接口
│       └── login.post.ts     # 登录接口
└── utils/
    ├── password.ts       # 密码加密工具
    └── jwt.ts            # JWT 工具

pages/
├── regist.vue           # 注册页面
└── login.vue            # 登录页面
```

## 注意事项

1. 首次使用前必须执行数据库迁移
2. 生产环境请修改 `.env` 中的密钥配置
3. 验证码存储在 session 中，重启服务器会丢失（生产环境建议使用 Redis）
4. JWT token 存储在客户端 localStorage，可根据需要调整存储方式
