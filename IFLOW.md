# AI 消息总结器 - 项目上下文文档

## 项目概述

这是一个基于微信小程序云开发的快速启动项目，演示了如何使用云开发的三大基础能力：数据库、文件存储和云函数。项目名称为 "ai-message-summarizer"，但实际代码显示这是一个云开发 QuickStart 示例项目。

### 主要技术栈

- **前端框架**: 微信小程序原生框架
- **云服务**: 微信云开发（CloudBase）
- **云函数运行时**: Node.js
- **数据库**: 云开发文档型数据库
- **存储**: 云开发文件存储

### 项目结构

```
ai-message-summarizer/
├── cloudfunctions/          # 云函数目录
│   └── quickstartFunctions/ # 主要云函数
│       ├── index.js         # 云函数入口文件
│       ├── config.json      # 云函数配置
│       └── package.json     # 依赖配置
├── miniprogram/             # 小程序前端代码
│   ├── app.js               # 小程序入口
│   ├── app.json             # 小程序配置
│   ├── app.wxss             # 全局样式
│   ├── components/          # 组件目录
│   │   └── cloudTipModal/   # 提示弹窗组件
│   ├── images/              # 图片资源
│   └── pages/               # 页面目录
│       ├── index/           # 首页
│       └── example/         # 示例页面
├── project.config.json      # 微信开发者工具配置
└── uploadCloudFunction.sh   # 云函数上传脚本
```

## 核心功能

### 1. 云函数功能（quickstartFunctions）

云函数支持以下操作类型：

- **getOpenId**: 获取用户的 OpenID、AppID 和 UnionID
- **getMiniProgramCode**: 生成小程序二维码并上传到云存储
- **createCollection**: 创建数据库集合并插入示例数据
- **selectRecord**: 查询数据库记录
- **updateRecord**: 更新数据库记录
- **insertRecord**: 插入新记录
- **deleteRecord**: 删除记录

### 2. 小程序页面

- **首页 (pages/index/index)**: 展示云开发各项能力的入口，包括：
  - 云托管调用
  - 云函数（获取 OpenID、生成小程序码）
  - 数据库操作（创建集合、增删改查）
  - 云存储（上传文件）
  - AI 拓展能力（大模型对话指引）

- **示例页面 (pages/example/index)**: 展示具体功能的使用示例和代码片段

## 构建和运行

### 前置要求

1. 安装微信开发者工具
2. 注册微信小程序账号并开通云开发
3. 获取云开发环境 ID

### 配置步骤

1. **配置环境 ID**:
   在 `miniprogram/app.js` 中设置云开发环境 ID：
   ```javascript
   this.globalData = {
     env: "your-env-id" // 替换为你的云开发环境 ID
   };
   ```

2. **上传云函数**:
   - 使用微信开发者工具，在 `cloudfunctions/quickstartFunctions` 目录右键
   - 选择【上传并部署-云端安装依赖】
   - 等待云函数上传完成

   或使用脚本上传：
   ```bash
   ./uploadCloudFunction.sh
   ```

### 运行项目

1. 使用微信开发者工具打开项目根目录
2. 点击"编译"按钮预览小程序
3. 在真机或模拟器中测试各项功能

## 开发约定

### 代码风格

- 使用 2 空格缩进（参见 `project.config.json` 中的 `editorSetting.tabSize`）
- 启用 ES6 转换和代码压缩
- 使用小程序原生框架开发

### 云函数开发

- 云函数使用 `wx-server-sdk` 进行云开发操作
- 使用 `cloud.DYNAMIC_CURRENT_ENV` 作为环境参数，支持多环境
- 云函数通过 `event.type` 参数区分不同的操作类型
- 所有数据库操作都通过云函数进行，确保安全性

### 数据库约定

- 示例集合名称：`sales`
- 数据结构示例：
  ```javascript
  {
    region: "华东",
    city: "上海",
    sales: 11
  }
  ```

### 错误处理

- 云函数调用失败时，检查环境 ID 配置是否正确
- 确保云函数已正确上传和部署
- 常见错误：
  - `Environment not found`: 环境未找到，检查 `env` 参数
  - `FunctionName parameter could not be found`: 云函数未上传

## 依赖管理

### 云函数依赖

云函数依赖在 `cloudfunctions/quickstartFunctions/package.json` 中定义：

```json
{
  "dependencies": {
    "wx-server-sdk": "~2.4.0"
  }
}
```

使用微信开发者工具上传云函数时会自动安装依赖。

## 重要文件说明

- `miniprogram/app.js`: 小程序入口，初始化云开发环境
- `cloudfunctions/quickstartFunctions/index.js`: 云函数主入口，处理所有云函数请求
- `miniprogram/pages/index/index.js`: 首页逻辑，展示功能入口
- `miniprogram/pages/example/index.js`: 示例页面，展示具体功能实现
- `project.config.json`: 微信开发者工具项目配置

## 参考文档

- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)
- [云工具箱文档](https://docs.cloudbase.net/toolbox/quick-start)
- [云开发 Agent UI 组件](https://gitee.com/TencentCloudBase/cloudbase-agent-ui/tree/main/apps/miniprogram-agent-ui/miniprogram/components/agent-ui)

## 注意事项

1. 确保在微信开发者工具中正确配置 AppID
2. 云开发环境需要在小程序管理后台开通
3. 云函数上传后需要等待部署完成才能使用
4. 数据库操作需要先创建集合（通过云函数）
5. 文件上传功能需要用户授权