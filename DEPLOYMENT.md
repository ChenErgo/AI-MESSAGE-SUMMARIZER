# AI 消息总结官 - 部署指南

## 前置条件

1. 微信开发者工具（最新版本）
2. 微信小程序账号（已认证）
3. 云开发环境已开通

## 部署步骤

### 1. 创建云开发环境

1. 登录[微信云开发控制台](https://console.cloud.tencent.com/tcb)
2. 创建新环境，环境 ID 命名为：`ai-message-summarizer`
3. 记录环境 ID（后续配置需要）

### 2. 配置环境变量

在云开发控制台的「云函数」→「配置」→「环境变量」中添加以下变量：

```
AI_ENDPOINT=https://your-ai-endpoint.com/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=hunyuan-turbo
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=2000
MAX_INPUT_LENGTH=8000
MIN_INPUT_LENGTH=10
RATE_LIMIT_PER_MINUTE=3
RATE_LIMIT_PER_DAY=50
CACHE_TTL_HOURS=24
```

**重要说明**：
- `AI_ENDPOINT`：替换为你实际使用的 AI 接口地址
- `AI_API_KEY`：替换为你的 API Key
- `AI_MODEL`：默认使用混元 turbo，可根据需要修改

### 3. 创建数据库集合

在云开发控制台的「数据库」中创建以下集合：

#### 3.1 summaries 集合

**用途**：存储总结记录和缓存

**字段说明**：
- `_id`：自动生成
- `openid`：用户 OpenID
- `text_hash`：文本哈希值
- `scene`：场景类型
- `custom_hint`：自定义提示
- `input_len`：输入文本长度
- `output_json`：输出结果（JSON对象）
- `created_at`：创建时间戳
- `from_cache`：是否来自缓存

**索引创建**：
1. 在「数据库」→「summaries」→「索引管理」中创建索引
2. 索引名称：`openid_created_at`
   - 索引字段：`openid`（升序）、`created_at`（降序）
3. 索引名称：`openid_hash_scene`
   - 索引字段：`openid`（升序）、`text_hash`（升序）、`scene`（升序）

#### 3.2 rate_limits 集合

**用途**：存储限流计数

**字段说明**：
- `_id`：文档 ID（格式：`openid:bucketKey`）
- `openid`：用户 OpenID
- `bucket`：`minute` 或 `day`
- `count`：计数
- `updated_at`：更新时间戳

**索引创建**：
- 索引名称：`openid_bucket`
  - 索引字段：`openid`（升序）、`bucket`（升序）

### 4. 部署云函数

#### 4.1 编译 TypeScript 代码

在每个云函数目录下执行：

```bash
cd cloudfunctions/summarize
npm install
npm run build

cd ../historyList
npm install
npm run build

cd ../historyGet
npm install
npm run build

cd ../historyDelete
npm install
npm run build
```

#### 4.2 上传云函数

使用微信开发者工具：

1. 打开项目根目录
2. 在左侧目录树中找到 `cloudfunctions/summarize`
3. 右键点击，选择「上传并部署：云端安装依赖」
4. 等待上传完成
5. 重复以上步骤，依次部署其他云函数：
   - `historyList`
   - `historyGet`
   - `historyDelete`

或使用 CLI 命令：

```bash
# 安装云开发 CLI
npm install -g @cloudbase/cli

# 登录
cloudbase login

# 部署所有云函数
cloudbase functions:deploy summarize --env ai-message-summarizer
cloudbase functions:deploy historyList --env ai-message-summarizer
cloudbase functions:deploy historyGet --env ai-message-summarizer
cloudbase functions:deploy historyDelete --env ai-message-summarizer
```

### 5. 配置小程序

1. 打开 `miniprogram/app.js`
2. 确认环境 ID 配置正确：
   ```javascript
   wx.cloud.init({
     env: 'ai-message-summarizer', // 确保与云开发环境一致
     traceUser: true,
   });
   ```

3. 在微信开发者工具中：
   - 点击「详情」→「本地设置」
   - 勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」

### 6. 测试部署

1. 在微信开发者工具中点击「编译」
2. 在首页输入测试文本，点击「生成总结」
3. 检查是否正常返回结果
4. 测试历史记录功能

### 7. 常见问题

#### Q1: 云函数调用失败，提示环境未找到
**A**: 检查 `app.js` 中的环境 ID 是否与云开发控制台中的环境 ID 完全一致。

#### Q2: AI 调用失败
**A**:
- 检查环境变量是否正确配置
- 检查 API Key 是否有效
- 检查网络请求是否正常（查看云函数日志）

#### Q3: 数据库操作失败
**A**:
- 确认数据库集合已创建
- 确认索引已正确创建
- 检查云函数权限配置

#### Q4: 限流不生效
**A**:
- 确认 `rate_limits` 集合已创建
- 检查环境变量配置是否正确

### 8. 性能优化建议

1. **缓存策略**：默认 24 小时缓存，可根据需要调整 `CACHE_TTL_HOURS`
2. **限流配置**：根据实际成本调整 `RATE_LIMIT_PER_MINUTE` 和 `RATE_LIMIT_PER_DAY`
3. **模型选择**：根据需求选择合适的 AI 模型，平衡成本和效果
4. **数据库索引**：确保所有索引已创建，提升查询性能

### 9. 安全建议

1. **API Key 保护**：不要将 API Key 硬编码在代码中，始终使用环境变量
2. **输入验证**：云函数已实现严格的输入验证，不要绕过
3. **访问控制**：所有数据库操作都基于 openid，确保数据隔离
4. **日志监控**：定期检查云函数日志，发现异常及时处理

### 10. 成本估算

假设配置：
- 每分钟 3 次，每天 50 次
- 使用 hunyuan-turbo 模型
- 平均每次输入 2000 字符，输出 1000 tokens

预估成本：
- 云函数调用：约 0.5 元/万次（免费额度内通常够用）
- AI 调用：约 0.01-0.05 元/次
- 数据库存储：约 0.07 元/GB/天

每月成本预估：15-75 元（取决于使用量）

### 11. 更新部署

当需要更新云函数时：

1. 修改代码
2. 编译 TypeScript：`npm run build`
3. 在微信开发者工具中右键云函数目录，选择「上传并部署：云端安装依赖」
4. 等待部署完成

### 12. 监控与告警

建议在云开发控制台配置：

1. **云函数监控**：关注调用次数、错误率、平均耗时
2. **数据库监控**：关注读写次数、存储空间
3. **告警配置**：设置错误率告警，及时发现问题

---

部署完成后，即可在小程序中正常使用 AI 消息总结功能！