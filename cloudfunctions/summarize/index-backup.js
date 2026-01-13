// 备选方案：使用 HTTP 请求调用 AI Agent
const cloud = require('wx-server-sdk');
const crypto = require('crypto');
const https = require('https');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 计算文本哈希
function calculateHash(text) {
  return crypto.createHash('md5').update(text).digest('hex');
}

// 构建提示词
function buildPrompt(text, scene, customHint) {
  const scenePrompts = {
    work: '工作场景 - 请重点关注：会议纪要、任务分配、决策结论、待办事项、风险提示',
    study: '学习场景 - 请重点关注：知识点总结、学习要点、疑问解答、后续学习计划',
    family: '家庭场景 - 请重点关注：重要事项、家庭决策、待办安排、情感交流',
    custom: customHint || '请根据消息内容进行总结'
  };

  const scenePrompt = scenePrompts[scene] || scenePrompts.work;

  return `请对以下${scenePrompt}的消息内容进行结构化总结：

消息内容：
${text}

请返回 JSON 格式，包含以下字段：
- summary_points: 重点列表（字符串数组）
- decisions: 结论列表（字符串数组）
- todos: 待办事项列表（对象数组，每个包含 task、owner_hint、due_hint 字段）
- open_questions: 未决问题列表（字符串数组）
- risk_flags: 风险提示列表（字符串数组）
- disclaimer: 免责声明（字符串）

请确保返回的是纯 JSON 格式，不要包含任何 Markdown 标记。`;
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

    const validScenes = ['work', 'study', 'family', 'custom'];
    if (!validScenes.includes(scene)) {
      throw new Error('无效的scene参数');
    }

    console.log('[Summarize] 参数验证通过');

    const textHash = calculateHash(text);

    if (ai_result) {
      console.log('[Summarize] 使用客户端提供的 AI 结果');
      return {
        ok: true,
        data: ai_result,
        meta: { from_cache: false, text_hash: textHash, latency_ms: Date.now() - startTime },
      };
    }

    // 调用 AI Agent（备选方案：使用 HTTP 请求）
    console.log('[Summarize] 准备调用 AI Agent');

    const prompt = buildPrompt(text, scene, custom_hint);
    console.log('[Summarize] 提示词长度:', prompt.length);

    // 这里需要实现 HTTP 调用，暂时返回错误提示
    throw new Error('AI Agent 调用功能待实现，请使用其他方式');

  } catch (error) {
    console.error('[Summarize] 错误:', error.message);
    return {
      ok: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: error.message || '服务内部错误，请重试',
      },
    };
  }
};