const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  console.log('[HistorySave] 开始处理');
  
  const { text, scene, custom_hint, output_json } = event;
  
  console.log('[HistorySave] 接收参数:', {
    text_length: text ? text.length : 0,
    scene: scene,
    custom_hint: custom_hint,
    output_json: output_json ? 'exists' : 'null',
  });
  
  const wxContext = cloud.getWXContext();
  const db = cloud.database();
  
  // 计算哈希
  const textHash = crypto.createHash('md5').update(text).digest('hex');
  
  // 构建记录
  const record = {
    openid: wxContext.OPENID || 'test_user_001',
    text_hash: textHash,
    scene: scene || 'work',
    custom_hint: custom_hint || '',
    input_len: text.length,
    output_json: output_json,
    created_at: new Date(),
    from_cache: false,
  };
  
  console.log('[HistorySave] 准备保存记录:', {
    openid: record.openid,
    scene: record.scene,
    input_len: record.input_len,
    output_json_type: typeof record.output_json,
    output_json_keys: record.output_json ? Object.keys(record.output_json) : [],
  });
  
  try {
    // 保存到数据库
    const result = await db.collection('summaries').add({
      data: record
    });
    
    console.log('[HistorySave] 保存成功, ID:', result._id);
    
    return {
      ok: true,
      data: {
        id: result._id
      }
    };
  } catch (error) {
    console.error('[HistorySave] 保存失败:', error);
    throw error;
  }
};