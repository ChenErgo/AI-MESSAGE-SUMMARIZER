const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  console.log('[HistoryGet] 开始处理');
  
  const { id } = event;
  
  if (!id) {
    throw new Error('缺少id参数');
  }
  
  console.log('[HistoryGet] 查询ID:', id);
  
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  const openid = wxContext.OPENID;
  
  console.log('[HistoryGet] 当前用户 openid:', openid ? openid.substring(0, 10) + '...' : 'null');
  
  try {
    const result = await db.collection('summaries').doc(id).get();
    
    if (!result.data) {
      throw new Error('记录不存在');
    }
    
    console.log('[HistoryGet] 记录 openid:', result.data.openid ? result.data.openid.substring(0, 10) + '...' : 'null');
    
    // 检查权限
    if (result.data.openid !== openid) {
      console.error('[HistoryGet] 权限检查失败');
      throw new Error('无权访问此记录');
    }
    
    console.log('[HistoryGet] 查询成功');
    
    return {
      ok: true,
      data: result.data
    };
  } catch (error) {
    console.error('[HistoryGet] 查询失败:', error);
    throw error;
  }
};