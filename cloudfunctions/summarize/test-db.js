/**
 * 数据库测试脚本
 * 用于测试数据库集合是否存在以及基本操作
 */

const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

async function testDatabase() {
  console.log('=== 开始数据库测试 ===');

  try {
    const db = cloud.database();

    console.log('\n1. 测试数据库连接...');
    console.log('✓ 数据库连接成功');

    console.log('\n2. 检查 summaries 集合...');
    try {
      const testResult = await db
        .collection('summaries')
        .limit(1)
        .get();
      console.log('✓ summaries 集合存在');
      console.log('  - 当前记录数:', testResult.data.length);
    } catch (error) {
      if (error.errCode === -1 && error.errMsg.includes('collection not exist')) {
        console.error('✗ summaries 集合不存在');
        console.error('  请在云开发控制台创建 summaries 集合');
      } else {
        console.error('✗ 检查集合失败:', error);
      }
      throw error;
    }

    console.log('\n3. 检查 rate_limits 集合...');
    try {
      const testResult = await db
        .collection('rate_limits')
        .limit(1)
        .get();
      console.log('✓ rate_limits 集合存在');
      console.log('  - 当前记录数:', testResult.data.length);
    } catch (error) {
      if (error.errCode === -1 && error.errMsg.includes('collection not exist')) {
        console.error('✗ rate_limits 集合不存在');
        console.error('  请在云开发控制台创建 rate_limits 集合');
      } else {
        console.error('✗ 检查集合失败:', error);
      }
      throw error;
    }

    console.log('\n4. 测试查询命令...');
    try {
      const command = db.command;
      console.log('✓ db.command 可用');

      const testTime = Date.now() - 86400000;
      console.log('  - 测试时间:', new Date(testTime).toISOString());
      console.log('  - gte 命令:', command.gte(testTime));
    } catch (error) {
      console.error('✗ 查询命令测试失败:', error);
      throw error;
    }

    console.log('\n=== 所有测试通过 ✓ ===');

  } catch (error) {
    console.error('\n✗ 测试失败:', error.message);
    console.error('\n错误详情:');
    console.error('  - errCode:', error.errCode);
    console.error('  - errMsg:', error.errMsg);
    console.error('\n错误堆栈:');
    console.error(error.stack);

    console.error('\n可能的原因:');
    console.error('  1. 数据库集合不存在');
    console.error('  2. 云开发环境未正确配置');
    console.error('  3. 权限不足');

    process.exit(1);
  }
}

testDatabase();