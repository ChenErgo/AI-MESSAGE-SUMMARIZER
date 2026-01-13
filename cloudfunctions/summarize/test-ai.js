/**
 * 测试 AI 接口
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

async function testAI() {
  console.log('=== 测试 AI 接口 ===');

  try {
    console.log('\n1. 检查 cloud.extend.AI 是否存在...');
    if (!cloud.extend || !cloud.extend.AI) {
      console.error('✗ cloud.extend.AI 不存在');
      console.error('  请确保 wx-server-sdk 版本支持 AI 功能');
      console.error('  当前版本:', require('wx-server-sdk/package.json').version);
      process.exit(1);
    }
    console.log('✓ cloud.extend.AI 存在');

    console.log('\n2. 检查 AI.bot.sendMessage 是否存在...');
    const ai = cloud.extend.AI;
    if (!ai.bot || !ai.bot.sendMessage) {
      console.error('✗ AI.bot.sendMessage 不存在');
      console.error('  请确保 wx-server-sdk 版本支持 AI Agent 功能');
      process.exit(1);
    }
    console.log('✓ AI.bot.sendMessage 存在');

    console.log('\n3. 测试调用 AI Agent...');
    const botId = 'agent-message-8gp7tymn95fb752c';

    console.log('  - botId:', botId);
    console.log('  - 发送测试消息...');

    const res = await ai.bot.sendMessage({
      botId: botId,
      data: {
        botId: botId,
        msg: '你好，请简单介绍一下你自己',
        history: [],
      },
    });

    console.log('  - 收到响应，开始读取文本流...');

    let text = '';
    for await (const data of res.textStream) {
      text += data;
      console.log('  - 接收到的文本片段:', data);
    }

    console.log('\n✓ AI 调用成功！');
    console.log('  完整响应:', text);

  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    console.error('\n错误详情:');
    console.error('  - errCode:', error.errCode);
    console.error('  - errMsg:', error.errMsg);
    console.error('\n错误堆栈:');
    console.error(error.stack);

    process.exit(1);
  }
}

testAI();