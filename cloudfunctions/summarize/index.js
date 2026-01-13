const cloud = require('wx-server-sdk');
const crypto = require('crypto');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 计算文本哈希
function calculateHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

exports.main = async (event, context) => {
  const startTime = Date.now();

  try {
    console.log('[Summarize] 开始处理请求');

    const { text, scene = 'work', custom_hint, save_history = true, ai_result } = event;

    if (!text || typeof text !== 'string') {
      throw new Error('缺少text参数');
    }

    if (text.length > 8000) {
      throw new Error('文本过长，请控制在8000字符以内');
    }

    if (text.length < 10) {
      throw new Error('文本过短，请输入有效内容');
    }

    console.log('[Summarize] 参数验证通过，文本长度:', text.length);

    const textHash = calculateHash(text);
    console.log('[Summarize] 文本哈希:', textHash);

    // 如果提供了 AI 结果，只保存到数据库
    if (ai_result) {
      console.log('[Summarize] 使用客户端提供的 AI 结果');

      // 保存到数据库（如果需要）
      if (save_history) {
        try {
          const wxContext = cloud.getWXContext();
          const db = cloud.database();

          // 如果没有 openid，使用固定值
          const openid = wxContext.OPENID || 'test_user_001';

          const record = {
            openid: openid,
            text_hash: textHash,
            scene: scene || 'work',
            custom_hint: custom_hint || '',
            input_len: text.length,
            output_json: aiResult,
            created_at: new Date(),
            from_cache: false,
          };

          console.log('[Summarize] 准备保存记录（客户端AI）');

          await db.collection('summaries').add(record);
          console.log('[Summarize] 记录保存成功');
        } catch (dbError) {
          console.error('[Summarize] 保存记录失败:', dbError);
          // 不影响主流程
        }
      }
      
      return {
        ok: true,
        data: ai_result,
        meta: {
          from_cache: false,
          text_hash: textHash,
          latency_ms: Date.now() - startTime,
        },
      };
    }

    // 如果没有 AI 结果，返回错误提示
    throw new Error('需要提供 AI 结果');

  } catch (error) {
    const latency = Date.now() - startTime;

    console.error('[Summarize] 错误:', {
      message: error.message,
      stack: error.stack,
      latency_ms: latency,
    });

    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || '服务内部错误，请重试',
      },
    };
  }
};