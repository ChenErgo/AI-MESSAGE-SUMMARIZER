const util = require('../../utils/util');

Page({
  data: {
    result: null,
    meta: null,
    loading: false,
  },

  onLoad(options) {
    if (options.data) {
      try {
        const data = JSON.parse(decodeURIComponent(options.data));
        this.setData({
          result: data.data,
          meta: data.meta,
        });
      } catch (err) {
        console.error('解析数据失败:', err);
        util.showError('数据加载失败');
      }
    } else if (options.id) {
      // 从历史记录加载
      this.loadFromHistory(options.id);
    }
  },

  // 从历史记录加载
  async loadFromHistory(id) {
    this.setData({ loading: true });
    util.showLoading('加载中...');

    try {
      const res = await wx.cloud.callFunction({
        name: 'historyGet',
        data: { id },
      });

      util.hideLoading();
      this.setData({ loading: false });

      if (res.result.ok) {
        this.setData({
          result: res.result.data.output_json,
          meta: {
            from_cache: res.result.data.from_cache,
            text_hash: res.result.data.text_hash,
          },
        });
      } else {
        util.showError(res.result.error.message || '加载失败');
        setTimeout(() => {
          wx.navigateBack();
        }, 1500);
      }
    } catch (err) {
      util.hideLoading();
      this.setData({ loading: false });
      console.error('加载历史记录失败:', err);
      util.showError('加载失败');
      setTimeout(() => {
        wx.navigateBack();
      }, 1500);
    }
  },

  // 复制全部
  onCopyAll() {
    const { result } = this.data;
    if (!result) return;

    let text = '';

    if (result.summary_points && result.summary_points.length > 0) {
      text += '【重点】\n';
      result.summary_points.forEach((point, index) => {
        text += `${index + 1}. ${point}\n`;
      });
      text += '\n';
    }

    if (result.decisions && result.decisions.length > 0) {
      text += '【结论】\n';
      result.decisions.forEach((decision, index) => {
        text += `${index + 1}. ${decision}\n`;
      });
      text += '\n';
    }

    if (result.todos && result.todos.length > 0) {
      text += '【待办】\n';
      result.todos.forEach((todo, index) => {
        text += `${index + 1}. ${todo.task}\n`;
        text += `   负责人: ${todo.owner_hint}\n`;
        text += `   时间: ${todo.due_hint}\n`;
      });
      text += '\n';
    }

    if (result.open_questions && result.open_questions.length > 0) {
      text += '【未决问题】\n';
      result.open_questions.forEach((question, index) => {
        text += `${index + 1}. ${question}\n`;
      });
      text += '\n';
    }

    text += `【免责声明】${result.disclaimer}\n`;

    if (result.risk_flags && result.risk_flags.length > 0) {
      text += `【风险提示】${result.risk_flags.join('、')}\n`;
    }

    util.copyToClipboard(text);
  },

  // 复制待办
  onCopyTodos() {
    const { result } = this.data;
    if (!result || !result.todos || result.todos.length === 0) {
      util.showError('没有待办事项');
      return;
    }

    let text = '';
    result.todos.forEach((todo, index) => {
      text += `${index + 1}. ${todo.task}\n`;
      text += `   负责人: ${todo.owner_hint}\n`;
      text += `   时间: ${todo.due_hint}\n\n`;
    });

    util.copyToClipboard(text);
  },

  // 导出待办为纯文本
  onExportTodos() {
    const { result } = this.data;
    if (!result || !result.todos || result.todos.length === 0) {
      util.showError('没有待办事项');
      return;
    }

    let text = '待办事项列表\n';
    text += '============\n\n';
    result.todos.forEach((todo, index) => {
      text += `${index + 1}. ${todo.task}\n`;
      if (todo.owner_hint && todo.owner_hint !== '未明确') {
        text += `   @${todo.owner_hint}`;
      }
      if (todo.due_hint && todo.due_hint !== '未明确') {
        text += `  📅 ${todo.due_hint}`;
      }
      text += '\n';
    });

    util.copyToClipboard(text, '已复制待办列表');
  },

  // 重新生成
  onRegenerate() {
    wx.showModal({
      title: '提示',
      content: '重新生成需要重新输入文本，是否返回首页？',
      success: (res) => {
        if (res.confirm) {
          wx.navigateBack();
        }
      },
    });
  },

  // 返回首页
  onBackToHome() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
});