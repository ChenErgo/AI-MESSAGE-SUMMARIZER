const util = require('../../utils/util');

Page({
  data: {
    text: '',
    scene: 'work',
    sceneIndex: 0,
    customHint: '',
    saveHistory: true,
    charCount: 0,
    maxCharCount: 8000,
    loading: false,
    generating: false,
    streamingText: '',
    statusBarHeight: 0, // 添加状态栏高度
    scenes: [
      { value: 'work', label: '工作' },
      { value: 'study', label: '学习' },
      { value: 'family', label: '家庭' },
      { value: 'custom', label: '自定义' },
    ],
  },

  onLoad() {
    // 获取系统信息，设置状态栏高度
    const systemInfo = wx.getSystemInfoSync();
    const statusBarHeight = systemInfo.statusBarHeight;
    
    // 使用 setData 设置状态栏高度
    this.setData({
      statusBarHeight: statusBarHeight
    });

    // 检查云开发环境
    const app = getApp();
    if (!app.globalData.env) {
      wx.showModal({
        title: '提示',
        content: '请在 app.js 中配置云开发环境 ID',
        showCancel: false,
      });
    }
  },

  // 输入框变化
  onTextInput(e) {
    const text = e.detail.value;
    this.setData({
      text,
      charCount: text.length,
    });
  },

  // 场景选择
  onSceneChange(e) {
    const index = parseInt(e.detail.value);
    this.setData({
      scene: this.data.scenes[index].value,
      sceneIndex: index,
    });
  },

  // 自定义提示输入
  onCustomHintInput(e) {
    this.setData({
      customHint: e.detail.value,
    });
  },

  // 保存历史开关
  onSaveHistoryChange(e) {
    this.setData({
      saveHistory: e.detail.value,
    });
  },

  // 构建提示词
  buildPrompt(text, scene, customHint) {
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
  },

  // 提交生成
  async onSubmit() {
    const { text, scene, customHint, saveHistory, maxCharCount } = this.data;

    // 校验
    if (!text || text.trim().length === 0) {
      util.showError('请输入聊天记录');
      return;
    }

    if (text.length > maxCharCount) {
      util.showError(`文本过长，请控制在${maxCharCount}字符以内`);
      return;
    }

    if (text.length < 10) {
      util.showError('文本过短，请输入有效内容');
      return;
    }

    if (scene === 'custom' && !customHint.trim()) {
      util.showError('自定义场景请填写总结偏好');
      return;
    }

    this.setData({ 
      loading: true,
      generating: true,
      streamingText: ''
    });

    try {
      // 构建提示词
      const prompt = this.buildPrompt(text, scene, customHint);

      console.log('[Index] 开始调用 AI Agent');

      // 按照官方文档的方式调用 AI Agent
      const res = await wx.cloud.extend.AI.bot.sendMessage({
        data: {
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
        }
      });

      console.log('[Index] 收到 AI Agent 响应，开始流式读取');

      // 按照官方文档的方式处理响应
      let aiResponseText = '';
      let displayCount = 0;

      for await (let event of res.eventStream) {
        const data = JSON.parse(event.data);
        console.log('[Index] 收到事件:', data.type);
        
        switch (data.type) {
          case 'TEXT_MESSAGE_CONTENT':
            aiResponseText += data.delta;
            displayCount++;
            
            // 每5次更新一次显示，避免过于频繁
            if (displayCount % 5 === 0) {
              this.setData({
                streamingText: aiResponseText.substring(0, 200) + '...'
              });
            }
            console.log('[Index] 收到文本片段:', data.delta);
            break;

          case 'RUN_ERROR':
            console.error('[Index] 运行出错:', data.message);
            throw new Error(data.message);

          case 'RUN_FINISHED':
            console.log('[Index] 运行结束');
            break;
        }
      }

      console.log('[Index] AI Agent 响应完成，总长度:', aiResponseText.length);
      console.log('[Index] 完整响应:', aiResponseText);

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

      console.log('[Index] 清理后的文本:', cleanText.substring(0, 500));

      // 解析 JSON
      let aiResult;
      try {
        aiResult = JSON.parse(cleanText);
        console.log('[Index] 解析成功:', aiResult);
        console.log('[Index] 准备保存，参数状态:', {
          text: text ? text.substring(0, 50) + '...' : 'undefined',
          scene: scene,
          customHint: customHint,
          saveHistory: saveHistory,
          aiResult: aiResult ? 'exists' : 'not_exists',
        });
      } catch (error) {
        console.error('[Index] AI 返回的不是有效的 JSON:', error);
        console.error('[Index] 原始文本:', cleanText);
        throw new Error('AI 返回数据格式错误');
      }

      // 保存到历史记录（如果需要）
      if (saveHistory) {
        console.log('[Index] 开始保存历史记录...');
        await this.saveToHistory(text, scene, customHint, aiResult);
        console.log('[Index] 历史记录保存完成');
      } else {
        console.log('[Index] saveHistory 为 false，跳过保存');
      }

      // 跳转到结果页
      this.setData({ 
        loading: false,
        generating: false
      });

      wx.navigateTo({
        url: `/pages/result/result?data=${encodeURIComponent(JSON.stringify({
          ok: true,
          data: aiResult,
          meta: {
            from_cache: false,
          }
        }))}`,
      });

    } catch (err) {
      this.setData({ 
        loading: false,
        generating: false
      });
      console.error('[Index] 调用 AI 失败:', err);
      
      let errorMsg = '生成失败，请重试';
      if (err.message) {
        errorMsg += ': ' + err.message;
      }
      util.showError(errorMsg);
    }
  },

  // 保存到历史记录
  async saveToHistory(text, scene, customHint, aiResult) {
    try {
      console.log('[Index] saveToHistory 被调用');
      console.log('[Index] 参数类型检查:', {
        text: typeof text,
        text_length: text ? text.length : 0,
        text_preview: text ? text.substring(0, 100) : 'null',
        scene: typeof scene,
        scene_value: scene,
        customHint: typeof customHint,
        customHint_value: customHint,
        aiResult: typeof aiResult,
        aiResult_keys: aiResult ? Object.keys(aiResult) : 'null',
      });

      if (!text) {
        console.error('[Index] text 参数为空！');
        return;
      }

      if (!aiResult) {
        console.error('[Index] aiResult 参数为空！');
        return;
      }

      const res = await wx.cloud.callFunction({
        name: 'historySave',
        data: {
          text,
          scene,
          custom_hint: customHint,
          output_json: aiResult,
        },
      });

      console.log('[Index] 保存历史记录结果:', res.result);
    } catch (error) {
      console.error('保存历史记录失败:', error);
      // 不阻塞主流程
    }
  },

  // 跳转到历史记录
  goToHistory() {
    wx.navigateTo({
      url: '/pages/history/history',
    });
  },
});