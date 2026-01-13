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

  /**
   * 删除历史记录
   */
  async deleteHistoryRecord(id, openid) {
    try {
      // 先检查权限
      await this.getHistoryRecord(id, openid);

      await this.db
        .collection('summaries')
        .doc(id)
        .remove();

      return true;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      console.error('[DB] Delete history record failed:', error);
      throw new AppError(ErrorCode.INTERNAL, '删除记录失败');
    }
  }
}

module.exports = {
  Database,
};