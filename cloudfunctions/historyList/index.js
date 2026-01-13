const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  console.log('[HistoryList] 开始处理');
  
  const { page = 1, page_size = 20 } = event;
  
  console.log('[HistoryList] 接收参数:', { page, page_size });
  
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const openid = wxContext.OPENID || 'test_user_001';
  
  try {
    const skip = (page - 1) * page_size;
    
    console.log('[HistoryList] 查询条件:', { openid, skip, limit: page_size });
    
    // 查询列表，包含 output_json
    const listResult = await db.collection('summaries')
      .where({ openid })
      .orderBy('created_at', 'desc')
      .skip(skip)
      .limit(page_size)
      .get();
    
    // 查询总数
    const countResult = await db.collection('summaries')
      .where({ openid })
      .count();
    
    console.log('[HistoryList] 查询成功:', {
      count: listResult.data.length,
      total: countResult.total
    });
    
    return {
      ok: true,
      data: listResult.data,
      meta: {
        page,
        page_size,
        total: countResult.total,
        has_more: page * page_size < countResult.total
      }
    };
  } catch (error) {
    console.error('[HistoryList] 查询失败:', error);
    throw error;
  }
};