const cloud = require('wx-server-sdk');
const { AppError, ErrorCode } = require('./utils');

const db = cloud.database();

/**
 * 数据库操作类
 */
class Database {
  constructor() {
    this.db = db;
  }

  /**
   * 获取单条历史记录
   */
  async getHistoryRecord(id, openid) {
    try {
      const result = await this.db
        .collection('summaries')
        .doc(id)
        .get();

      if (!result.data) {
        throw new AppError(ErrorCode.NOT_FOUND, '记录不存在');
      }

      const record = result.data;
      if (record.openid !== openid) {
        throw new AppError(ErrorCode.FORBIDDEN, '无权访问此记录');
      }

      return record;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('[DB] Get history record failed:', error);
      throw new AppError(ErrorCode.INTERNAL, '获取记录失败');
    }
  }
}

module.exports = {
  Database,
};