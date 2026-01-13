const util = require('../../utils/util');

Page({
  data: {
    list: [],
    loading: false,
    page: 1,
    pageSize: 20,
    hasMore: true,
    total: 0,
    util: util, // 添加 util 对象供 WXML 使用
  },

  onLoad() {
    this.loadHistory();
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      list: [],
      hasMore: true,
    });
    this.loadHistory().then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMore();
    }
  },

  // 加载历史记录
  async loadHistory() {
    if (this.data.loading) return;

    this.setData({ loading: true });

    try {
      const res = await wx.cloud.callFunction({
        name: 'historyList',
        data: {
          page: this.data.page,
          page_size: this.data.pageSize,
        },
      });

      this.setData({ loading: false });

      if (res.result.ok) {
        const newList = this.data.page === 1
          ? res.result.data
          : [...this.data.list, ...res.result.data];

        this.setData({
          list: newList,
          total: res.result.meta.total,
          hasMore: res.result.meta.has_more,
        });
      } else {
        util.showError(res.result.error.message || '加载失败');
      }
    } catch (err) {
      this.setData({ loading: false });
      console.error('加载历史记录失败:', err);
      util.showError('加载失败');
    }
  },

  // 加载更多
  loadMore() {
    this.setData({
      page: this.data.page + 1,
    });
    this.loadHistory();
  },

  // 查看详情
  onViewDetail(e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/result/result?id=${id}`,
    });
  },

  // 删除记录
  onDelete(e) {
    const id = e.currentTarget.dataset.id;
    const index = e.currentTarget.dataset.index;

    wx.showModal({
      title: '确认删除',
      content: '确定要删除这条记录吗？',
      success: (res) => {
        if (res.confirm) {
          this.deleteRecord(id, index);
        }
      },
    });
  },

  // 执行删除
  async deleteRecord(id, index) {
    util.showLoading('删除中...');

    try {
      const res = await wx.cloud.callFunction({
        name: 'historyDelete',
        data: { id },
      });

      util.hideLoading();

      if (res.result.ok) {
        // 从列表中移除
        const list = [...this.data.list];
        list.splice(index, 1);
        this.setData({
          list,
          total: this.data.total - 1,
        });
        util.showSuccess('删除成功');
      } else {
        util.showError(res.result.error.message || '删除失败');
      }
    } catch (err) {
      util.hideLoading();
      console.error('删除记录失败:', err);
      util.showError('删除失败');
    }
  },

  // 返回首页
  onBackToHome() {
    wx.reLaunch({
      url: '/pages/index/index',
    });
  },
});