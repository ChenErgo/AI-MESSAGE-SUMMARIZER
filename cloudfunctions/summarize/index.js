const cloud = require('wx-server-sdk');
const tcb = require('@cloudbase/js-sdk');
const adapter = require('@cloudbase/adapter-node');
const crypto = require('crypto');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

// 初始化 cloudbase SDK（用于 AI 功能）
const { sessionStorage } = adapter.genAdapter();
tcb.useAdapters(adapter);

const app = tcb.init({
  env: 'ai-message-summarizer-3a856f6650',
});

const auth = app.auth({
  storage: sessionStorage,
  captchaOptions: {
    openURIWithCallback: (...props) => {
      console.log('open uri with callback', ...props);
    },
  },
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

    // 1. 参数校验
    const {
      text,
      scene = 'work',
      custom_hint,
      save_history = true,
      language = 'zh',
      ai_result
    } = event;

    if (!text || typeof text !== 'string') {
      throw new Error('缺少text参数');
    }

    // 检查长度
    if (text.length > 8000) {
      throw new Error('文本过长，请控制在8000字符以内');
    }

    if (text.length < 10) {
      throw new Error('文本过短，请输入有效内容');
    }

    // 检查scene
    const validScenes = ['work', 'study', 'family', 'custom'];
    if (!validScenes.includes(scene)) {
      throw new Error('无效的scene参数');
    }

    console.log('[Summarize] 参数验证通过，文本长度:', text.length, '场景:', scene);

    // 2. 计算文本哈希
    const textHash = calculateHash(text);
    console.log('[Summarize] 文本哈希:', textHash);

    // 3. 如果提供了 AI 结果，直接使用
    if (ai_result) {
      console.log('[Summarize] 使用客户端提供的 AI 结果');
      
      // 保存到数据库（如果需要）
      if (save_history) {
        try {
          const wxContext = cloud.getWXContext();
          const db = cloud.database();

          const record = {
            openid: wxContext.OPENID,
            text_hash: textHash,
            scene,
            custom_hint,
            input_len: text.length,
            output_json: ai_result,
            created_at: new Date(),
            from_cache: false,
          };

          await db.collection('summaries').add({
            data: record
          });
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

    // 4. 调用 AI Agent
    console.log('[Summarize] 准备调用 AI Agent');

    try {
      await auth.signInAnonymously();
      console.log('[Summarize] 匿名登录成功');
    } catch (authError) {
      console.error('[Summarize] 匿名登录失败:', authError);
      throw new Error('认证失败: ' + authError.message);
    }

    const ai = app.ai();

    // 构建提示词
    const prompt = buildPrompt(text, scene, custom_hint);

    console.log('[Summarize] 调用 AI Agent');

    // 调用 AI Agent
    const res = await ai.bot.sendMessage({
      botId: "agent-message-8gp7tymn95fb752c",
      threadId: "550e8400-e29b-41d4-a716-446655440000",
      runId: "run_001",
      messages: [
        { id: "msg-1", role: "user", content: prompt }
      ],
      tools: [],
      context: [],
      state: {},
      forwardedProps: {}
    });

    console.log('[Summarize] 收到响应，开始解析');

    // 收集响应
    let aiResponseText = '';

    for await (const data of res.dataStream) {
      switch (data.type) {
        case 'TEXT_MESSAGE_CONTENT':
          aiResponseText += data.delta;
          console.log('[Summarize] 接收文本片段:', data.delta.substring(0, 50));
          break;

        case 'RUN_ERROR':
          console.error('[Summarize] 运行出错:', data.message);
          throw new Error(data.message);

        case 'RUN_FINISHED':
          console.log('[Summarize] 运行结束');
          break;
      }
    }

    console.log('[Summarize] AI Agent 响应完成，总长度:', aiResponseText.length);

    // 清理可能的 Markdown 代码块标记
    let cleanText = aiResponseText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.slice(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.slice(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.slice(0, -3);
    }
    cleanText = cleanText.trim();

    // 解析 JSON
    let aiResult;
    try {
      aiResult = JSON.parse(cleanText);
      console.log('[Summarize] JSON 解析成功');
    } catch (error) {
      console.error('[Summarize] JSON 解析失败:', error);
      console.error('[Summarize] 原始文本:', cleanText.substring(0, 500));
      throw new Error('AI 返回数据格式错误');
    }

    // 5. 保存记录到数据库（如果需要）
    if (save_history) {
      try {
        const wxContext = cloud.getWXContext();
        const db = cloud.database();

        const record = {
          openid: wxContext.OPENID,
          text_hash: textHash,
          scene,
          custom_hint,
          input_len: text.length,
          output_json: aiResult,
          created_at: new Date(),
          from_cache: false,
        };

        await db.collection('summaries').add({
          data: record
        });
        console.log('[Summarize] 记录保存成功');
      } catch (dbError) {
        console.error('[Summarize] 保存记录失败:', dbError);
        // 不影响主流程
      }
    }

    console.log('[Summarize] 处理完成，耗时:', Date.now() - startTime, 'ms');

    return {
      ok: true,
      data: aiResult,
      meta: {
        from_cache: false,
        text_hash: textHash,
        latency_ms: Date.now() - startTime,
      },
    };

  } catch (error) {
    const latency = Date.now() - startTime;

    console.error('[Summarize] Error:', {
      error: error.message,
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