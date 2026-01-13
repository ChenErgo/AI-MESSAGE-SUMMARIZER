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
   * 获取历史列表
   */
  async getHistoryList(openid, page, pageSize) {
    try {
      const skip = (page - 1) * pageSize;

      const [listResult, countResult] = await Promise.all([
        this.db
          .collection('summaries')
          .where({ openid })
          .orderBy('created_at', 'desc')
          .skip(skip)
          .limit(pageSize)
          .field({
            _id: true,
            scene: true,
            input_len: true,
            created_at: true,
            from_cache: true,
          })
          .get(),
        this.db
          .collection('summaries')
          .where({ openid })
          .count(),
      ]);

      return {
        list: listResult.data,
        total: countResult.total,
      };
    } catch (error) {
      console.error('[DB] Get history list failed:', error);
      throw new AppError(ErrorCode.INTERNAL, '获取历史列表失败');
    }
  }
}

module.exports = {
  Database,
};