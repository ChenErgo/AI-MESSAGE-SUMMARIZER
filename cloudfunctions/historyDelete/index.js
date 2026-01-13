const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  console.log('[HistoryDelete] 开始处理');
  
  const { id } = event;
  
  if (!id) {
    throw new Error('缺少id参数');
  }
  
  console.log('[HistoryDelete] 删除ID:', id);
  
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const openid = wxContext.OPENID || 'test_user_001';
  
  try {
    // 先检查权限
    const record = await db.collection('summaries').doc(id).get();
    
    if (!record.data) {
      throw new Error('记录不存在');
    }
    
    if (record.data.openid !== openid) {
      throw new Error('无权删除此记录');
    }
    
    // 删除记录
    await db.collection('summaries').doc(id).remove();
    
    console.log('[HistoryDelete] 删除成功');
    
    return {
      ok: true,
      data: {
        id,
        deleted: true
      }
    };
  } catch (error) {
    console.error('[HistoryDelete] 删除失败:', error);
    throw error;
  }
};