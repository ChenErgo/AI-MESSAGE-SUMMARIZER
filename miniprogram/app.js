App({
  onLaunch() {
    // 初始化云开发
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }

    wx.cloud.init({
      env: 'ai-message-summarizer-3a856f6650', // 云开发环境ID
      traceUser: true,
    });

    this.globalData = {
      env: 'ai-message-summarizer-3a856f6650',
    };
  },
});