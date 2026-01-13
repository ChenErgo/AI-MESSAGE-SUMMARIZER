/**
 * 本地调试脚本
 * 用于测试云函数的初始化和基本功能
 */

console.log('=== 开始本地调试 ===');
console.log('Node.js 版本:', process.version);
console.log('当前目录:', __dirname);

try {
  console.log('\n1. 测试引入主模块...');
  const index = require('./index.js');
  console.log('✓ 主模块引入成功');

  console.log('\n2. 测试引入 utils 模块...');
  const utils = require('./lib/utils.js');
  console.log('✓ utils 模块引入成功');
  console.log('  - ErrorCode:', Object.keys(utils.ErrorCode));

  console.log('\n3. 测试引入 aiClient 模块...');
  const aiClient = require('./lib/aiClient.js');
  console.log('✓ aiClient 模块引入成功');

  console.log('\n4. 测试实例化 AIClient...');
  const client = new aiClient.AIClient();
  console.log('✓ AIClient 实例化成功');

  console.log('\n5. 测试配置...');
  const config = utils.getConfig();
  console.log('✓ 配置获取成功:');
  console.log('  - MAX_INPUT_LENGTH:', config.MAX_INPUT_LENGTH);
  console.log('  - AI_BOT_ID:', config.AI_BOT_ID);

  console.log('\n6. 测试 UUID 生成...');
  const crypto = require('crypto');
  let uuid;
  if (crypto.randomUUID) {
    uuid = crypto.randomUUID();
    console.log('✓ 使用 crypto.randomUUID():', uuid);
  } else {
    uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    console.log('✓ 使用降级方案:', uuid);
  }

  console.log('\n7. 测试引入其他依赖模块...');
  const db = require('./lib/db.js');
  console.log('✓ db 模块引入成功');

  const prompt = require('./lib/prompt.js');
  console.log('✓ prompt 模块引入成功');

  const rateLimit = require('./lib/rateLimit.js');
  console.log('✓ rateLimit 模块引入成功');

  const schema = require('./lib/schema.js');
  console.log('✓ schema 模块引入成功');

  console.log('\n8. 测试 @cloudbase/js-sdk 引入...');
  const cloudbase = require("@cloudbase/js-sdk");
  console.log('✓ @cloudbase/js-sdk 引入成功');
  console.log('  - 版本:', cloudbase.version || '未知');

  console.log('\n9. 测试 @cloudbase/adapter-node 引入...');
  const adapter = require("@cloudbase/adapter-node");
  console.log('✓ @cloudbase/adapter-node 引入成功');

  console.log('\n10. 测试 adapter.genAdapter()...');
  const { sessionStorage } = adapter.genAdapter();
  console.log('✓ adapter.genAdapter() 调用成功');

  console.log('\n11. 测试 cloudbase.useAdapters()...');
  cloudbase.useAdapters(adapter);
  console.log('✓ cloudbase.useAdapters() 调用成功');

  console.log('\n12. 跳过 cloudbase.init() 测试...');
  console.log('  (本地环境需要 appSecret，云函数环境不需要)');
  console.log('✓ 跳过测试');

  console.log('\n13. 跳过 app.auth() 测试...');
  console.log('  (本地环境需要 appSecret，云函数环境不需要)');
  console.log('✓ 跳过测试');

  console.log('\n=== 所有测试通过 ✓ ===');
  console.log('\n提示：如果所有测试都通过，问题可能出在云函数运行时环境中');
  console.log('建议检查：');
  console.log('  1. 云函数运行时版本是否支持 Node.js 16+');
  console.log('  2. 依赖包是否正确安装');
  console.log('  3. 环境变量是否正确配置');

} catch (error) {
  console.error('\n✗ 测试失败:', error.message);
  console.error('\n错误堆栈:');
  console.error(error.stack);
  console.error('\n错误类型:', error.constructor.name);
  console.error('\n错误详情:', error);

  if (error.code) {
    console.error('\n错误代码:', error.code);
  }

  process.exit(1);
}