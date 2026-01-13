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
      openid: null,
    };

    // 获取用户 openid
    this.getUserOpenId();
  },

  // 获取用户 openid
  async getUserOpenId() {
    try {
      const res = await wx.cloud.callFunction({
        name: 'login',
      });

      if (res.result.ok) {
        this.globalData.openid = res.result.data.openid;
        console.log('[App] 用户 openid:', this.globalData.openid);
      }
    } catch (err) {
      console.error('[App] 获取 openid 失败:', err);
    }
  },
});